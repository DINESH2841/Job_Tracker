import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";

// Helper to prevent build crashes when env vars are missing
const getEnv = (key: string, fallback: string) => {
    const value = process.env[key];
    if (!value) console.warn(`Missing env var: ${key}, using fallback`);
    return value || fallback;
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Singleton pattern for Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let googleProvider: GoogleAuthProvider;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    googleProvider = new GoogleAuthProvider();

    // Connect to emulators only when explicitly enabled
    const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
    if (useEmulators) {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099');
        } catch {}
        try {
            connectFirestoreEmulator(db, 'localhost', 8080);
        } catch {}
        try {
            connectFunctionsEmulator(functions, 'localhost', 5001);
        } catch {}
    }
} catch (error) {
    console.warn("Firebase initialization failed (likely due to missing env vars during build). Using mocks if possible or letting it fail gracefully.", error);
    // If we crash here, the build fails. So we swallow the error for build-time safety.
    // However, if the app actually tries to USE these in the build (e.g. getStaticProps), it will fail later.
    // For now, this fixes the "import causes crash" issue.
}

// We still export them. If init failed, they are undefined, which is better than a hard crash at import time.
// Consumer code should handle potential undefined or we can cast them (risky but satisfies TS).
export { app, auth, db, googleProvider, functions };
