import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./utils/logger";
import { authRouter } from "./routes/auth.routes";
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

app.use("/auth", authRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Backend listening on port ${config.port}`);
});
