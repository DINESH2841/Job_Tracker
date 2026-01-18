
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const verifyAuthHeader = async (req: functions.https.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new functions.https.HttpsError('unauthenticated', 'Missing token');
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
};

import { generateAuthUrl, handleOAuthCallback, getLinkedAccounts } from './src/gmail';

export const startGmailAuth = functions.https.onRequest(async (req, res) => {
    // Handle CORS
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Authorization');
        res.status(204).send('');
        return;
    }

    try {
        const uid = await verifyAuthHeader(req);
        const url = generateAuthUrl(uid);
        res.json({ url });
    } catch (error: any) {
        console.error('Error generating auth URL:', error);
        const statusCode = error.code === 'unauthenticated' ? 401 : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

export const getGmailAccounts = functions.https.onRequest(async (req, res) => {
    // Handle CORS
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Authorization');
        res.status(204).send('');
        return;
    }

    try {
        const uid = await verifyAuthHeader(req);
        const accounts = await getLinkedAccounts(uid);
        res.json({ accounts });
    } catch (error: any) {
        console.error('Error fetching accounts:', error);
        const statusCode = error.code === 'unauthenticated' ? 401 : 500;
        res.status(statusCode).json({ error: error.message });
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
