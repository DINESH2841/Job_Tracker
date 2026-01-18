export interface WorkerState {
    type: 'gmail_ingestion' | 'status_inference';
    uid: string; // The user this worker is running for (if per-user) or system
    gmailAccountId?: string;
    status: 'idle' | 'running' | 'failed';
    lastHeartbeat: Date;
    lastError: string | null;
}

// In Phase 1.1 we define the interface to ensure validation in future functions
export const WORKER_COLLECTION = 'workers';
