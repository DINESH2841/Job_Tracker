import express from 'express';
import { google } from 'googleapis';
import User from '../models/User';
import Application from '../models/Application';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// Start Gmail auth flow
router.post('/auth-url', authMiddleware, async (req, res) => {
    try {
        const oauth2Client = getOAuth2Client();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.readonly'],
            state: req.userId,
            prompt: 'consent'
        });
        res.json({ url: authUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// Sync Gmail emails
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.accessToken) {
            return res.status(400).json({ error: 'Gmail not connected' });
        }

        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'subject:(application OR applied OR job OR interview OR offer OR rejected)',
            maxResults: 50
        });

        const messages = response.data.messages || [];
        let syncedCount = 0;

        for (const message of messages) {
            if (!message.id) continue;

            const details = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'full'
            });

            const headers = details.data.payload?.headers || [];
            const subject = headers.find(h => h.name === 'Subject')?.value || 'Unknown';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const dateStr = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

            const company = from.split('<')[0].trim() || 'Unknown Company';
            const role = subject || 'Unknown Role';
            const appliedAt = new Date(dateStr);

            await Application.findOneAndUpdate(
                { messageId: message.id, userId: req.userId },
                {
                    userId: req.userId,
                    messageId: message.id,
                    company,
                    role,
                    status: 'APPLIED',
                    appliedAt,
                    syncedFrom: user.email,
                },
                { upsert: true }
            );

            syncedCount++;
        }

        res.json({ success: true, count: syncedCount, message: `Synced ${syncedCount} emails` });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync Gmail' });
    }
});

// Get linked Gmail accounts
router.get('/accounts', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const accounts = user.accessToken ? [{ email: user.email, connected: true }] : [];
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

export default router;
