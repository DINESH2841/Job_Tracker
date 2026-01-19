import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Auth endpoints
export function getLoginUrl() {
    return `${API_BASE_URL}/auth/google`;
}

export async function getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
}

export async function logout() {
    await api.post('/auth/logout');
}

// Gmail endpoints
export async function getGmailAuthUrl() {
    const response = await api.post('/gmail/auth-url');
    return response.data.url;
}

export async function getGmailAccounts() {
    const response = await api.get('/gmail/accounts');
    return response.data.accounts || [];
}

export async function syncGmailNow() {
    const response = await api.post('/gmail/sync');
    return response.data;
}

// Jobs/Applications endpoints
export async function getApplications() {
    const response = await api.get('/jobs');
    return response.data.applications || [];
}

export async function getApplication(id: string) {
    const response = await api.get(`/jobs/${id}`);
    return response.data.application;
}

export async function createApplication(data: any) {
    const response = await api.post('/jobs', data);
    return response.data.application;
}

export async function updateApplication(id: string, data: any) {
    const response = await api.patch(`/jobs/${id}`, data);
    return response.data.application;
}

export async function deleteApplication(id: string) {
    return api.delete(`/jobs/${id}`);
}
