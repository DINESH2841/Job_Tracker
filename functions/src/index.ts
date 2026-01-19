import * as functions from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import cors from "cors";

// Controllers
import * as gmailController from "./controllers/gmail";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const corsHandler = cors({ origin: true });

// Shared secrets for callable wrapper
const CALLABLE_SECRETS = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "ENCRYPTION_KEY",
];

// Basic health check
export const healthCheck = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
});

// Auth Profile Stub
export const getProfile = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        const idToken = req.headers.authorization?.split("Bearer ")[1];

        if (!idToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            // Fetch user profile from Firestore (stub)
            res.json({ uid, message: "Profile access authorized" });
        } catch (error) {
            console.error("Error verifying token:", error);
            res.status(401).json({ error: "Invalid token" });
        }
    });
});

// Gmail Functions
export const startGmailAuth = gmailController.startGmailAuth;
export const oauthCallback = gmailController.oauthCallback;
export const getGmailAccounts = gmailController.getGmailAccounts;
export const syncGmailNow = gmailController.syncGmailNow;

// Unified callable entry so Hosting rewrite can target a single function.
export const api = onCall({ region: "us-central1", secrets: CALLABLE_SECRETS }, async (request) => {
    const action = request.data?.action as string | undefined;

    switch (action) {
        case "startGmailAuth":
            return gmailController.startGmailAuth(request.data, request as any);
        case "getGmailAccounts":
            return gmailController.getGmailAccounts(request.data, request as any);
        case "syncGmailNow":
            return gmailController.syncGmailNow(request.data, request as any);
        default:
            throw new HttpsError("invalid-argument", "Unknown action");
    }
});
