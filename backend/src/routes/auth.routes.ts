import express from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// Redirect to Google OAuth
router.get('/google', (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.readonly'
            ],
            prompt: 'consent'
        });
        res.redirect(url);
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('Authentication Error');
    }
});

// Callback from Google
router.get('/callback', async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
        res.status(400).send('No code provided');
        return;
    }

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        
        // Validate the ID token
        if (!tokens.id_token) {
            res.status(400).send('No ID token received');
            return;
        }

        // Verify the token is valid and get user info
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).send('Invalid token payload');
            return;
        }

        const googleId = payload.sub;
        const email = payload.email;
        
        if (!googleId || !email) {
            res.status(400).send('Could not retrieve user info from token');
            return;
        }

        // Set credentials for Gmail API access
        oauth2Client.setCredentials(tokens);

        const name = payload.name ?? 'User';
        const picture = payload.picture ?? undefined;
        const accessToken = tokens.access_token ?? undefined;
        const refreshToken = tokens.refresh_token ?? undefined;

        // Upsert user
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                picture,
                accessToken,
                refreshToken
            });
        } else {
            // Update tokens
            user.accessToken = accessToken;
            if (refreshToken) {
                user.refreshToken = refreshToken;
            }
            await user.save();
        }

        // Create JWT
        const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${FRONTEND_URL}/dashboard`);

    } catch (error) {
        console.error('Callback Error:', error);
        res.status(500).send('Authentication Callback Error');
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
