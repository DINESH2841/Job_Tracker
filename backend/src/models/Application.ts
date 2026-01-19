import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
    userId: mongoose.Types.ObjectId;
    company: string;
    role: string;
    status: string;
    appliedAt: Date;
    messageId?: string;
    gmailMessageId?: string;
    sourceEmail?: string;
    gmailLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: 'Applied' },
    appliedAt: { type: Date, default: Date.now },
    messageId: { type: String },
    gmailMessageId: { type: String },
    sourceEmail: { type: String },
    gmailLink: { type: String },
}, { timestamps: true });

// Index for faster lookups by user and recent applications
ApplicationSchema.index({ userId: 1, appliedAt: -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
