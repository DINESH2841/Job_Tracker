
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

// verifyAuthHeader removed as it is not needed for Callable Functions


import { generateAuthUrl, handleOAuthCallback, getLinkedAccounts, syncEmailsForUser } from './src/gmail';

// --- Callable Functions (Called from Frontend) ---

export const startGmailAuth = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const uid = context.auth.uid;
        const url = generateAuthUrl(uid);
        return { url };
    } catch (error: any) {
        console.error('Error in startGmailAuth:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

export const getGmailAccounts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const uid = context.auth.uid;
        const accounts = await getLinkedAccounts(uid);
        return { accounts };
    } catch (error: any) {
        console.error('Error in getGmailAccounts:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

export const syncGmailNow = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    console.log(`Starting manual sync for user ${uid}...`);

    try {
        const accountsRef = admin.firestore().collection('users').doc(uid).collection('gmail_accounts');
        const snapshot = await accountsRef.get();

        if (snapshot.empty) {
            return { success: false, message: "No connected Gmail accounts found." };
        }

        let syncCount = 0;
        const promises = snapshot.docs.map(async (doc) => {
            const d = doc.data();
            const email = d.email;
            // Construct token object required by simple-gmail or googleapis
            const tokens = {
                access_token: d.accessToken,
                refresh_token: d.refreshToken,
                scope: d.scope,
                token_type: d.tokenType,
                expiry_date: d.expiryDate
            };

            console.log(`Syncing email: ${email}`);
            await syncEmailsForUser(uid, email, tokens);
            syncCount++;
        });

        await Promise.all(promises);
        console.log(`Synced ${syncCount} accounts for user ${uid}.`);
        return { success: true, count: syncCount };

    } catch (error: any) {
        console.error('Error in syncGmailNow:', error);
        throw new functions.https.HttpsError('internal', "Failed to sync emails: " + error.message);
    }
});

/**
 * Cloud Function handling the OAuth callback from Google.
 * Exchanges code for tokens and triggers initial sync.
 */
export const oauthCallback = functions.https.onRequest(async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string; // This is the UID
    const error = req.query.error;

    if (error) {
        console.error('OAuth error from Google:', error);
        res.status(400).send(`Authentication failed: ${error}`);
        return;
    }

    if (!code || !state) {
        res.status(400).send('Missing authorization code or state.');
        return;
    }

    try {
        const result = await handleOAuthCallback(code, state);

        // Redirect to frontend on success
        // Use FRONTEND_URL env var, fallback to localhost
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings/gmail?status=success&email=${encodeURIComponent(result.email || '')}`);

    } catch (err: any) {
        console.error('Error in oauthCallback:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings/gmail?status=error&message=${encodeURIComponent(err.message)}`);
    }
});
