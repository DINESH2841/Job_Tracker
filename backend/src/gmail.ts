
import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new functions.https.HttpsError('internal', `${name} is not configured`);
    }
    return value;
}

// Initialize OAuth2 client
const getOAuth2Client = () => {
    const clientId = requireEnv('GOOGLE_CLIENT_ID');
    const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
    const redirectUri = requireEnv('GOOGLE_REDIRECT_URI');
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getLinkedAccounts = async (uid: string) => {
    const snapshot = await admin.firestore().collection('users').doc(uid).collection('gmailAccounts').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Generate OAuth URL
 * @param uid - The Firebase User ID to associate with this auth flow
 */
export const generateAuthUrl = (uid: string) => {
    const oAuth2Client = getOAuth2Client();
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: uid, // Pass UID as state to identify user in callback
        prompt: 'consent' // Force consent to ensure we get refresh token
    });
};

/**
 * Exchange code for tokens and save to Firestore
 * @param code - The authorization code from Google
 * @param state - The state parameter (should be UID)
 */
export const handleOAuthCallback = async (code: string, state: string) => {
    const uid = state; // We used state to pass UID
    if (!uid) {
        throw new Error('Missing state (UID)');
    }

    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    // Set credentials to fetch profile
    oAuth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Fetch user profile to get email address
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const email = profile.data.emailAddress;

    if (!email) {
        throw new Error('Could not retrieve email from Gmail profile');
    }

    // Store tokens in Firestore with email as ID
    // Encrypting tokens is best practice; storing plainly for now per instructions.
    await admin.firestore().collection('users').doc(uid).collection('gmailAccounts').doc(email).set({
        email: email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Trigger one-time sync
    await syncEmailsForUser(uid, email, tokens);

    return { email, success: true };
};

/**
 * Sync logic: Fetch emails
 */
export const syncEmailsForUser = async (uid: string, email: string, tokens: any) => {
    const oAuth2Client = getOAuth2Client();
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // List messages - relaxed filtering for Phase 1
    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        q: 'in:inbox'
    });

    const messages = res.data.messages || [];

    if (!messages.length) return 0;

    const batch = admin.firestore().batch();
    let processed = 0;

    for (const message of messages) {
        if (!message.id) continue;

        const msgDetails = await gmail.users.messages.get({ userId: 'me', id: message.id });

        const headers = msgDetails.data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const fromHeader = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const dateStr = headers.find((h: any) => h.name === 'Date')?.value;

        // Parse date
        let appliedAt: any = admin.firestore.FieldValue.serverTimestamp();
        if (dateStr) {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
                appliedAt = admin.firestore.Timestamp.fromDate(parsedDate);
            }
        }

        const appRef = admin.firestore().collection('users').doc(uid).collection('applications').doc(message.id);

        // Write required fields for Phase 1
        batch.set(appRef, {
            company: fromHeader,
            role: subject,
            appliedAt: appliedAt,
            status: 'Applied',
            gmailLink: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
            sourceEmail: email,
            syncedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        processed++;
    }

    await batch.commit();
    return processed;
};
