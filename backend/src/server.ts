import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./utils/logger";
import { authRouter } from "./routes/auth.routes";
import { generateAuthUrl, handleOAuthCallback, getLinkedAccounts } from "./gmail";
import { requireAuth, AuthenticatedRequest } from "./middleware/auth.middleware";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Job Tracker Backend API", version: "1.0.0" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Gmail Routes for Local/Express usage matching api.ts
app.get("/startGmailAuth", requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = (req as AuthenticatedRequest).user?.id;
    if (!uid) {
      res.status(401).json({ error: "User ID not found in token" });
      return;
    }
    const url = generateAuthUrl(uid);
    res.json({ url });
  } catch (error: any) {
    logger.error("Error generating auth URL", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getGmailAccounts", requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = (req as AuthenticatedRequest).user?.id;
    if (!uid) {
      res.status(401).json({ error: "User ID not found in token" });
      return;
    }
    const accounts = await getLinkedAccounts(uid);
    res.json({ accounts });
  } catch (error: any) {
    logger.error("Error fetching accounts", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/gmail/auth", requireAuth, async (req: Request, res: Response) => {
  // Legacy/Alternative route
  try {
    const uid = (req as AuthenticatedRequest).user?.id;
    if (!uid) throw new Error("User ID not found");
    const url = generateAuthUrl(uid);
    res.json({ url });
  } catch (error: any) {
    logger.error("Error generating auth URL", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/gmail/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    logger.error("OAuth error", error);
    res.status(400).send(`Authentication failed: ${error}`);
    return;
  }

  if (!code || !state) {
    res.status(400).send("Missing code or state");
    return;
  }

  try {
    const result = await handleOAuthCallback(code as string, state as string);
    // Redirect to frontend on success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings/gmail?status=success&email=${encodeURIComponent(result.email || '')}`);
  } catch (err: any) {
    logger.error("Error in gmail callback", err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings/gmail?status=error&message=${encodeURIComponent(err.message)}`);
  }
});

app.use("/auth", authRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Backend listening on port ${config.port}`);
});
