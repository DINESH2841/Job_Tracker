import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/user.model";
import { signSession } from "../services/token.service";
import { logger } from "../utils/logger";

type AuthenticatedRequest = Request & {
  user?: { id: string; email?: string };
};

// In-memory stand-in until persistence is wired.
const users = new Map<string, User>();

function getOrCreateUser(email: string, name?: string): User {
  const existing = [...users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return existing;
  }
  const now = new Date();
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    provider: "google",
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };
  users.set(user.id, user);
  return user;
}

export async function loginWithGoogle(req: Request, res: Response) {
  const { email, name, idToken } = req.body;
  if (!email || !idToken) {
    return res.status(400).json({ message: "email and idToken are required" });
  }

  // TODO: Validate idToken with Google tokeninfo endpoint; enforce scopes.
  logger.info(`Received Google login for ${email}`);
  const user = getOrCreateUser(email, name);
  const token = signSession(user);
  return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function logout(_req: Request, res: Response) {
  // Clients should discard JWT; add server-side blacklist/rotation when persistence exists.
  return res.status(200).json({ message: "Logged out" });
}

export async function currentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ id: user.id, email: user.email, name: user.name });
}
