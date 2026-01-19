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

const callApi = async <T>(action: string, payload?: Record<string, unknown>): Promise<T> => {
    const callable = httpsCallable<{ action: string } & Record<string, unknown>, T>(functions, "api");
    const result = await callable({ action, ...(payload || {}) });
    return result.data;
};

export async function startGmailAuth() {
    const data = await callApi<AuthUrlResponse>("startGmailAuth");
    return data.url;
}

export async function getGmailAccounts() {
    const data = await callApi<GmailAccountsResponse>("getGmailAccounts");
    return data.accounts;
}

export async function syncGmailNow() {
    return callApi<SyncResponse>("syncGmailNow");
}
