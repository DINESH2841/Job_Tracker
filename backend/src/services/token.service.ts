import { sign, verify, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { User } from "../models/user.model";

export interface JwtPayload {
  sub: string;
  email: string;
  provider: string;
  iat?: number;
  exp?: number;
}

export function signSession(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    provider: user.provider
  };
  const options: SignOptions = { expiresIn: "7d" };
  return sign(payload, config.jwtSecret as Secret, options);
}

export function verifySession(token: string): JwtPayload {
  return verify(token, config.jwtSecret as Secret) as JwtPayload;
}
