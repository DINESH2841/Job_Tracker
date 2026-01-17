<<<<<<< Updated upstream
import { sign, verify, Secret, SignOptions } from "jsonwebtoken";
=======
import jwt from "jsonwebtoken";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as unknown as SignOptions["expiresIn"] };
  return sign(payload, config.jwtSecret as Secret, options);
}

export function verifySession(token: string): JwtPayload {
  return verify(token, config.jwtSecret as Secret) as JwtPayload;
=======
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifySession(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
>>>>>>> Stashed changes
}
