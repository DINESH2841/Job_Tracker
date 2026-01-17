import { Request, Response, NextFunction } from "express";
import { verifySession } from "../services/token.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    provider: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  try {
    const token = header.replace("Bearer ", "").trim();
    const decoded = verifySession(token);
    req.user = { id: decoded.sub, email: decoded.email, provider: decoded.provider };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
