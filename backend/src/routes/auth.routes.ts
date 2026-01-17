import { Router } from "express";
import { loginWithGoogle, logout, currentUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/google", loginWithGoogle);
authRouter.post("/logout", requireAuth, logout);
authRouter.get("/me", requireAuth, currentUser);
