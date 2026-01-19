import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import Application from '../models/Application';

const router = express.Router();

// Get all applications for user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const applications = await Application.find({ userId: req.userId }).sort({ appliedAt: -1 });
        res.json({ applications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get single application
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ application: app });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Create application
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { company, role, status, appliedAt } = req.body;
        const app = await Application.create({
            userId: req.userId,
            company,
            role,
            status: status || 'APPLIED',
            appliedAt: appliedAt || new Date()
        });
        res.status(201).json({ application: app });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// Update application
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const app = await Application.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ application: app });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Delete application
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

export default router;
