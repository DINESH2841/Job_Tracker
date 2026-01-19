import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

// Interface for API responses
interface AuthUrlResponse {
    url: string;
}

interface GmailAccountsResponse {
    accounts: any[];
}

interface SyncResponse {
    success: boolean;
    count?: number;
    message?: string;
}

export async function startGmailAuth() {
    const callable = httpsCallable<void, AuthUrlResponse>(functions, "startGmailAuth");
    const result = await callable();
    return result.data.url;
}

export async function getGmailAccounts() {
    const callable = httpsCallable<void, GmailAccountsResponse>(functions, "getGmailAccounts");
    const result = await callable();
    return result.data.accounts;
}

export async function syncGmailNow() {
    const callable = httpsCallable<void, SyncResponse>(functions, "syncGmailNow");
    const result = await callable();
    return result.data;
}
