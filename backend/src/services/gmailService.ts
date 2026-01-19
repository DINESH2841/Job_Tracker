import { google } from 'googleapis';
import User from '../models/User';
import Application from '../models/Application';

export const startGmailAuth = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId.toString(),
        prompt: 'consent'
    });

    return authUrl;
};

export const syncGmailEmails = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.accessToken) throw new Error('Gmail not connected');

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'subject:(application OR applied OR job OR interview OR offer)',
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
        const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();

        const company = from.split('<')[0].trim() || 'Unknown Company';
        const role = subject || 'Unknown Role';

        await Application.findOneAndUpdate(
            { messageId: message.id, userId },
            {
                userId,
                messageId: message.id,
                company,
                role,
                status: 'APPLIED',
                appliedAt: new Date(date),
                syncedFrom: user.email,
            },
            { upsert: true }
        );

        syncedCount++;
    }

    return { success: true, count: syncedCount };
};
