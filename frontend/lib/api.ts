import { auth } from "./firebase";

// Use Firebase Cloud Functions directly
const API_BASE_URL = "https://us-central1-job-tracker-abb1c.cloudfunctions.net";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const token = await user.getIdToken();

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function startGmailAuth() {
    const { url } = await fetchWithAuth("/startGmailAuth");
    return url;
}

export async function getGmailAccounts() {
    const { accounts } = await fetchWithAuth("/getGmailAccounts");
    return accounts;
}
