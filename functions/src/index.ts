import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

// Controllers
import * as gmailController from "./controllers/gmail";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const corsHandler = cors({ origin: true });

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
