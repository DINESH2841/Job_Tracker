import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            email?: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret');
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
