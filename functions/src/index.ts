import * as admin from "firebase-admin";

// Controllers
import * as gmailController from "./controllers/gmail";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Gmail Functions (callable exports for direct browser use)
export const startGmailAuth = gmailController.startGmailAuth;
export const getGmailAccounts = gmailController.getGmailAccounts;
export const syncGmailNow = gmailController.syncGmailNow;

// OAuth callback (onRequest because Google redirects to it)
export const oauthCallback = gmailController.oauthCallback;
