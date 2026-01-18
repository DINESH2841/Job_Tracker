
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
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

export const startGmailAuth = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const uid = request.auth.uid;
        const url = generateAuthUrl(uid);
        return { url };
    } catch (error: any) {
        console.error('Error in startGmailAuth:', error);
        throw new HttpsError('internal', (error && error.message) || 'Internal error');
    }
});

export const getGmailAccounts = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const uid = request.auth.uid;
        const accounts = await getLinkedAccounts(uid);
        return { accounts };
    } catch (error: any) {
        console.error('Error in getGmailAccounts:', error);
        throw new HttpsError('internal', (error && error.message) || 'Internal error');
    }
});

export const syncGmailNow = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = request.auth.uid;
    console.log(`Starting manual sync for user ${uid}...`);

    try {
        const accountsRef = admin.firestore().collection('users').doc(uid).collection('gmailAccounts');
        const snapshot = await accountsRef.get();

        if (snapshot.empty) {
            return { success: false, message: "No connected Gmail accounts found." };
        }

        let syncCount = 0;
        const promises = snapshot.docs.map(async (doc) => {
            const d = doc.data();
            const email = d.email;
            // Construct token object required by googleapis
            const tokens = {
                access_token: d.accessToken,
                refresh_token: d.refreshToken,
                scope: d.scope,
                token_type: d.tokenType,
                expiry_date: d.expiryDate
            };

            console.log(`Syncing email: ${email}`);
            try {
                const count = await syncEmailsForUser(uid, email, tokens);
                syncCount += (typeof count === 'number' ? count : 0);
            } catch (e) {
                console.error(`Failed to sync ${email}:`, e);
            }
        });

        await Promise.all(promises);
        console.log(`Synced ${syncCount} messages for user ${uid}.`);
        return { success: true, count: syncCount };

    } catch (error: any) {
        console.error('Error in syncGmailNow:', error);
        throw new HttpsError('internal', "Failed to sync emails: " + ((error && error.message) || 'Unknown error'));
    }
});

/**
 * Cloud Function handling the OAuth callback from Google.
 * Exchanges code for tokens and triggers initial sync.
 */
export const oauthCallback = onRequest(async (req, res) => {
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

        // Redirect to frontend on success; require explicit FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            throw new Error('FRONTEND_URL is not configured');
        }
        res.redirect(`${frontendUrl}/settings/gmail?status=success&email=${encodeURIComponent(result.email || '')}`);

    } catch (err: any) {
        console.error('Error in oauthCallback:', err);
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            res.status(500).send('FRONTEND_URL is not configured');
            return;
        }
        res.redirect(`${frontendUrl}/settings/gmail?status=error&message=${encodeURIComponent(err.message)}`);
    }
});
