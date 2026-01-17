export type AuthProvider = "google" | "password";

export interface User {
  id: string;
  email: string;
  name?: string;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface GmailAccount {
  id: string;
  userId: string;
  gmailEmail: string;
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: Date;
  syncEnabled: boolean;
  lastSyncAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
