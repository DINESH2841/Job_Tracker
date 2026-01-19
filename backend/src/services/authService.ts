import { google } from 'googleapis';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
};

export const handleGoogleCallback = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const googleId = data.id || '';
    const email = data.email || '';
    const name = data.name || 'User';
    const picture = data.picture || undefined;
    const accessToken = tokens.access_token || '';
    const refreshToken = tokens.refresh_token || undefined;

    if (!googleId || !email) {
        throw new Error('Missing Google profile information');
    }

    let user = await User.findOne({ googleId });
    if (!user) {
        user = await User.create({
            googleId,
            email,
            name,
            picture,
            accessToken,
            refreshToken,
        });
    }

    // Update tokens on every login
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret',
        { expiresIn: '7d' }
    );

    return { token, user };
};
