import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { encrypt, decrypt } from "../utils/crypto";

const db = admin.firestore();

// Secrets configuration
const SECRETS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "ENCRYPTION_KEY", "FRONTEND_URL"];

// Configuration - Load from env vars
// Note: These will be populated at runtime if secrets are set correctly
const getEnv = (key: string) => process.env[key];

const getOauthClient = () => {
    const CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
    const CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
    const REDIRECT_URI = getEnv("GOOGLE_REDIRECT_URI");

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        throw new Error("Missing required Google OAuth environment variables.");
    }

    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

// Scopes for reading Gmail
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email"
];

// 1. Start Gmail OAuth Flow (Callable)
export const startGmailAuth = onCall({ secrets: SECRETS }, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;

    try {
        const oauth2Client = getOauthClient();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            state: uid,
            prompt: "consent"
        });

        return { url: authUrl };
    } catch (error) {
        console.error("Auth start error:", error);
        throw new HttpsError("internal", "Failed to start auth flow");
    }
});

// 2. OAuth Callback
export const oauthCallback = onRequest({ secrets: SECRETS }, async (req, res) => {
    const { code, state } = req.query;

    if (!code || typeof code !== "string" || !state || typeof state !== "string") {
        res.status(400).send("Invalid request: Missing code or text");
        return;
    }

    const uid = state as string; // The state we passed was the UID

    try {
        const oauth2Client = getOauthClient();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        if (!email) {
            throw new Error("Could not retrieve email address");
        }

        const accountsRef = db.collection("users").doc(uid).collection("gmailAccounts");
        const snapshot = await accountsRef.where("email", "==", email).get();

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await accountsRef.doc(docId).update({
                accessToken: encrypt(tokens.access_token || ""),
                refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
                status: "active",
                lastError: null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
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

        try {
            await syncEmailsForUser(uid, email, tokens.access_token || "", tokens.refresh_token || undefined);
            await accountsRef.where("email", "==", email).get().then(snap => {
                if (!snap.empty) {
                    accountsRef.doc(snap.docs[0].id).update({
                        lastSyncAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            });
        } catch (syncError) {
            console.error("Initial sync failed:", syncError);
        }

        res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: green;">Successfully Connected!</h1>
                        <p>Gmail account ${email} has been linked.</p>
                        <p>Initial sync is in progress...</p>
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

async function syncEmailsForUser(uid: string, email: string, accessToken: string, refreshToken?: string): Promise<number> {
    const oauth2Client = getOauthClient();

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messagesResponse = await gmail.users.messages.list({
        userId: "me",
        q: "subject:(application OR applied OR job OR position OR opportunity) newer_than:90d",
        maxResults: 50
    });

    const messages = messagesResponse.data.messages || [];
    let syncCount = 0;

    for (const message of messages) {
        if (!message.id) continue;

        const details = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full"
        });

        const headers = details.data.payload?.headers || [];
        const subject = headers.find(h => h.name?.toLowerCase() === "subject")?.value || "";
        const from = headers.find(h => h.name?.toLowerCase() === "from")?.value || "";
        const dateHeader = headers.find(h => h.name?.toLowerCase() === "date")?.value;

        const company = from.split("<")[0].trim() || "Unknown";
        const role = subject || "Unknown Position";
        const appliedAt = dateHeader ? new Date(dateHeader) : new Date(details.data.internalDate ? parseInt(details.data.internalDate) : Date.now());
        const gmailLink = `https://mail.google.com/mail/u/${email}/#inbox/${message.id}`;

        await db.collection("users").doc(uid).collection("applications").doc(message.id).set({
            company,
            role,
            appliedAt: admin.firestore.Timestamp.fromDate(appliedAt),
            status: "Applied",
            gmailLink,
            syncedFrom: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        syncCount++;
    }

    return syncCount;
}

// 3. List Linked Accounts (Callable)
export const getGmailAccounts = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;

    try {
        const accountsRef = db.collection("users").doc(uid).collection("gmailAccounts");
        const snapshot = await accountsRef.get();

        const accounts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                syncEnabled: data.syncEnabled,
                lastSyncAt: data.lastSyncAt?.toDate?.() || null,
                status: data.status,
                lastError: data.lastError,
                createdAt: data.createdAt?.toDate?.() || null
            };
        });

        return { accounts };
    } catch (error) {
        console.error("List accounts error:", error);
        throw new HttpsError("internal", "Failed to list accounts");
    }
});

// 4. Sync Gmail Now (Callable)
export const syncGmailNow = onCall({ secrets: SECRETS }, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;

    try {
        const accountsRef = db.collection("users").doc(uid).collection("gmailAccounts");
        const snapshot = await accountsRef.where("syncEnabled", "==", true).get();

        if (snapshot.empty) {
            return { success: true, count: 0, message: "No active Gmail accounts to sync" };
        }

        let totalSynced = 0;

        for (const doc of snapshot.docs) {
            const accountData = doc.data();
            const email = accountData.email;
            const encryptedAccessToken = accountData.accessToken;
            const encryptedRefreshToken = accountData.refreshToken;

            if (!encryptedAccessToken) {
                console.error(`No access token for account ${doc.id}`);
                continue;
            }

            try {
                const accessToken = decrypt(encryptedAccessToken);
                const refreshToken = encryptedRefreshToken ? decrypt(encryptedRefreshToken) : undefined;

                const count = await syncEmailsForUser(uid, email, accessToken, refreshToken);
                totalSynced += count;

                await accountsRef.doc(doc.id).update({
                    lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: "active",
                    lastError: null
                });
            } catch (error) {
                console.error(`Sync failed for ${email}:`, error);
                await accountsRef.doc(doc.id).update({
                    lastError: error instanceof Error ? error.message : "Sync failed",
                    status: "error"
                });
            }
        }

        return { success: true, count: totalSynced, message: `Synced ${totalSynced} applications` };
    } catch (error) {
        console.error("Sync error:", error);
        throw new HttpsError("internal", "Failed to sync emails");
    }
});
