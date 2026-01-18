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
exports.syncGmailNow = exports.getGmailAccounts = exports.oauthCallback = exports.startGmailAuth = exports.getProfile = exports.healthCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
// Controllers
const gmailController = __importStar(require("./controllers/gmail"));
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const corsHandler = (0, cors_1.default)({ origin: true });
// Basic health check
exports.healthCheck = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
});
// Auth Profile Stub
exports.getProfile = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        var _a;
        const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
        if (!idToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            // Fetch user profile from Firestore (stub)
            res.json({ uid, message: "Profile access authorized" });
        }
        catch (error) {
            console.error("Error verifying token:", error);
            res.status(401).json({ error: "Invalid token" });
        }
    });
});
// Gmail Functions
exports.startGmailAuth = gmailController.startGmailAuth;
exports.oauthCallback = gmailController.oauthCallback;
exports.getGmailAccounts = gmailController.getGmailAccounts;
exports.syncGmailNow = gmailController.syncGmailNow;
//# sourceMappingURL=index.js.map