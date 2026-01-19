"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncGmailNow = exports.getGmailAccounts = exports.oauthCallback = exports.startGmailAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const cors_1 = __importDefault(require("cors"));
const crypto_1 = require("../utils/crypto");
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
// Secrets configuration
const SECRETS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "ENCRYPTION_KEY"];
// Configuration - Load from env vars
// Note: These will be populated at runtime if secrets are set correctly
const getEnv = (key) => process.env[key];
const getOauthClient = () => {
    const CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
    const CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
    const REDIRECT_URI = getEnv("GOOGLE_REDIRECT_URI");
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        throw new Error("Missing required Google OAuth environment variables.");
    }
    return new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};
// Scopes for reading Gmail
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email"
];
// 1. Start Gmail OAuth Flow (Callable)
exports.startGmailAuth = (0, https_1.onCall)({ secrets: SECRETS }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
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
    }
    catch (error) {
        console.error("Auth start error:", error);
        throw new https_1.HttpsError("internal", "Failed to start auth flow");
    }
});
// 2. OAuth Callback
exports.oauthCallback = (0, https_1.onRequest)({ secrets: SECRETS }, (req, res) => {
    corsHandler(req, res, async () => {
        const { code, state } = req.query;
        if (!code || typeof code !== "string" || !state || typeof state !== "string") {
            res.status(400).send("Invalid request: Missing code or text");
            return;
        }
        const uid = state; // The state we passed was the UID
        try {
            const oauth2Client = getOauthClient();
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            // Get user email to identify account
            const oauth2 = googleapis_1.google.oauth2({ version: "v2", auth: oauth2Client });
            const userInfo = await oauth2.userinfo.get();
            const email = userInfo.data.email;
            if (!email) {
                throw new Error("Could not retrieve email address");
            }
            const accountsRef = db.collection("users").doc(uid).collection("gmailAccounts");
            const snapshot = await accountsRef.where("email", "==", email).get();
            if (!snapshot.empty) {
                // Already exists, update tokens
                const docId = snapshot.docs[0].id;
                await accountsRef.doc(docId).update({
                    accessToken: (0, crypto_1.encrypt)(tokens.access_token || ""),
                    refreshToken: tokens.refresh_token ? (0, crypto_1.encrypt)(tokens.refresh_token) : undefined,
                    status: "active",
                    lastError: null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            else {
                // Create new
                await accountsRef.add({
                    email: email,
                    accessToken: (0, crypto_1.encrypt)(tokens.access_token || ""),
                    refreshToken: tokens.refresh_token ? (0, crypto_1.encrypt)(tokens.refresh_token) : "",
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
            }
            catch (syncError) {
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
        }
        catch (error) {
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
async function syncEmailsForUser(uid, email, accessToken, refreshToken) {
    var _a, _b, _c, _d;
    const oauth2Client = getOauthClient();
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    const gmail = googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
    const messagesResponse = await gmail.users.messages.list({
        userId: "me",
        q: "subject:(application OR applied OR job OR position OR opportunity) newer_than:90d",
        maxResults: 50
    });
    const messages = messagesResponse.data.messages || [];
    let syncCount = 0;
    for (const message of messages) {
        if (!message.id)
            continue;
        const details = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full"
        });
        const headers = ((_a = details.data.payload) === null || _a === void 0 ? void 0 : _a.headers) || [];
        const subject = ((_b = headers.find(h => { var _a; return ((_a = h.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "subject"; })) === null || _b === void 0 ? void 0 : _b.value) || "";
        const from = ((_c = headers.find(h => { var _a; return ((_a = h.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "from"; })) === null || _c === void 0 ? void 0 : _c.value) || "";
        const dateHeader = (_d = headers.find(h => { var _a; return ((_a = h.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "date"; })) === null || _d === void 0 ? void 0 : _d.value;
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
exports.getGmailAccounts = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const uid = request.auth.uid;
    try {
        const accountsRef = db.collection("users").doc(uid).collection("gmailAccounts");
        const snapshot = await accountsRef.get();
        const accounts = snapshot.docs.map(doc => {
            var _a, _b, _c, _d;
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                syncEnabled: data.syncEnabled,
                lastSyncAt: ((_b = (_a = data.lastSyncAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || null,
                status: data.status,
                lastError: data.lastError,
                createdAt: ((_d = (_c = data.createdAt) === null || _c === void 0 ? void 0 : _c.toDate) === null || _d === void 0 ? void 0 : _d.call(_c)) || null
            };
        });
        return { accounts };
    }
    catch (error) {
        console.error("List accounts error:", error);
        throw new https_1.HttpsError("internal", "Failed to list accounts");
    }
});
// 4. Sync Gmail Now (Callable)
exports.syncGmailNow = (0, https_1.onCall)({ secrets: SECRETS }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
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
                const accessToken = (0, crypto_1.decrypt)(encryptedAccessToken);
                const refreshToken = encryptedRefreshToken ? (0, crypto_1.decrypt)(encryptedRefreshToken) : undefined;
                const count = await syncEmailsForUser(uid, email, accessToken, refreshToken);
                totalSynced += count;
                await accountsRef.doc(doc.id).update({
                    lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: "active",
                    lastError: null
                });
            }
            catch (error) {
                console.error(`Sync failed for ${email}:`, error);
                await accountsRef.doc(doc.id).update({
                    lastError: error instanceof Error ? error.message : "Sync failed",
                    status: "error"
                });
            }
        }
        return { success: true, count: totalSynced, message: `Synced ${totalSynced} applications` };
    }
    catch (error) {
        console.error("Sync error:", error);
        throw new https_1.HttpsError("internal", "Failed to sync emails");
    }
});
//# sourceMappingURL=gmail.js.map