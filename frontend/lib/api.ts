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
    const startAuth = httpsCallable<void, AuthUrlResponse>(functions, 'startGmailAuth');
    const result = await startAuth();
    return result.data.url;
}

export async function getGmailAccounts() {
    const getAccounts = httpsCallable<void, GmailAccountsResponse>(functions, 'getGmailAccounts');
    const result = await getAccounts();
    return result.data.accounts;
}

export async function syncGmailNow() {
    const syncFn = httpsCallable<void, SyncResponse>(functions, 'syncGmailNow');
    const result = await syncFn();
    return result.data;
}
