import dotenv from "dotenv";
import { logger } from "./utils/logger";

dotenv.config();

function optional(name: string, fallback: string = ""): string {
  const value = process.env[name];
  if (!value) {
    logger.warn(`Missing environment variable: ${name}. Using fallback or empty string.`);
    return fallback;
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  googleClientId: optional("GOOGLE_CLIENT_ID"),
  googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),
  googleRedirectUri: optional("GOOGLE_REDIRECT_URI"),
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "",
  frontendUrl: process.env.FRONTEND_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-not-used-firebase-auth-only"
};
