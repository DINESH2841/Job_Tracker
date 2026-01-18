import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import * as cors from "cors";
import { encrypt } from "../utils/crypto";

const db = admin.firestore();
const corsHandler = cors({ origin: true });

// Configuration - Load from env vars in production
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5001/job-tracker-abb1c/us-central1/oauthCallback";

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Scopes for reading Gmail
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email"
];

// 1. Start Gmail OAuth Flow
export const startGmailAuth = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        // Validate Auth
        const idToken = req.headers.authorization?.split("Bearer ")[1];
        if (!idToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            const uid = decoded.uid;

            // Generage Auth URL
            // We encode the UID in the 'state' parameter to identify the user on callback
            // In production, sign this state to prevent tampering
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: "offline", // Essential for getting refresh token
                scope: SCOPES,
                state: uid,
                prompt: "consent" // Force consent to ensure we get refresh token
            });

            res.json({ url: authUrl });
        } catch (error) {
            console.error("Auth start error:", error);
            res.status(500).json({ error: "Failed to start auth flow" });
        }
    });
});

// 2. OAuth Callback
export const oauthCallback = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const { code, state } = req.query;

        if (!code || typeof code !== "string" || !state || typeof state !== "string") {
            res.status(400).send("Invalid request: Missing code or text");
            return;
        }

        const uid = state as string; // The state we passed was the UID

        try {
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // Get user email to identify account
            const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();
            const email = userInfo.data.email;

            if (!email) {
                throw new Error("Could not retrieve email address");
            }

            // Check for duplicate linking
            // We use email as the document ID key to ensure uniqueness per user? 
            // Or just query? Let's query to give a better error or update existing.
            // But for simplicity/robustness, we'll store under a unique ID but check if exists.

            const accountsRef = db.collection("users").doc(uid).collection("gmail_accounts");
            const snapshot = await accountsRef.where("email", "==", email).get();

            if (!snapshot.empty) {
                // Already exists, update tokens
                const docId = snapshot.docs[0].id;
                await accountsRef.doc(docId).update({
                    accessToken: encrypt(tokens.access_token || ""),
                    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined, // Refresh token might not be returned if not forcing consent
                    status: "active",
                    lastError: null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new
                await accountsRef.add({
                    email: email,
                    accessToken: encrypt(tokens.access_token || ""),
                    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : "",
                    syncEnabled: true,
                    lastSyncAt: null,
                    status: "active",
                    lastError: null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // Success - Close window or redirect
            // return simple HTML to close popup
            res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: green;">Successfully Connected!</h1>
            <p>Gmail account ${email} has been linked.</p>
            <p>You can close this window now.</p>
            <script>
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `);

        } catch (error) {
            console.error("OAuth callback error:", error);
            res.status(500).send(`
        <html>
          <body style="color: red; font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Connection Failed</h1>
            <p>${error instanceof Error ? error.message : "Unknown error"}</p>
          </body>
        </html>
      `);
        }
    });
});

// 3. List Linked Accounts
export const getGmailAccounts = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const idToken = req.headers.authorization?.split("Bearer ")[1];

        if (!idToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            const uid = decoded.uid;

            const accountsRef = db.collection("users").doc(uid).collection("gmail_accounts");
            const snapshot = await accountsRef.get();

            const accounts = snapshot.docs.map(doc => {
                const data = doc.data();
                // NEVER return tokens
                return {
                    id: doc.id,
                    email: data.email,
                    syncEnabled: data.syncEnabled,
                    lastSyncAt: data.lastSyncAt,
                    status: data.status,
                    lastError: data.lastError
                };
            });

            res.json({ accounts });

        } catch (error) {
            console.error("List accounts error:", error);
            res.status(500).json({ error: "Failed to list accounts" });
        }
    });
});
