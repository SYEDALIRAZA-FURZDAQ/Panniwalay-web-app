import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { customerInvites, zones } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

export const invitesRouter = Router();

const createInviteSchema = z.object({
  preassignedZoneId: z.number().optional().nullable(),
  preassignedCategory: z.enum(['residential', 'corporate']).default('residential'),
  preassignedJarQuota: z.number().default(2),
  expiryHours: z.number().default(168), // 7 days default
});

// Generate customer sign-up link (Generates SHA-256 token and saves in database)
invitesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = createInviteSchema.parse(req.body);

    // Get user id if authenticated, otherwise default to 1 (Admin)
    let userId = 1;
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '4f9c8e1a7b3d2f5e0c6a8b1d9e2f4a7c8b0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f') as any;
        if (decoded?.userId) userId = decoded.userId;
      } catch (e) {}
    }

    // Generate secure random 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + body.expiryHours * 60 * 60 * 1000);

    let insertId = 1;
    try {
      const result = await db.insert(customerInvites).values({
        tokenHash,
        expiresAt,
        preassignedZoneId: body.preassignedZoneId || 1,
        preassignedCategory: body.preassignedCategory,
        preassignedJarQuota: body.preassignedJarQuota,
        createdById: userId,
      } as any);
      insertId = (result as any)[0]?.insertId || 1;
    } catch (dbErr) {
      console.warn('DB insert invite warning:', dbErr);
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const signupUrl = `${baseUrl}/register?token=${rawToken}`;

    res.status(201).json({
      id: insertId,
      token: rawToken,
      signupUrl,
      expiresAt,
      preassignedCategory: body.preassignedCategory,
      preassignedJarQuota: body.preassignedJarQuota,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List recent customer invites
invitesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const list = await db
      .select({
        id: customerInvites.id,
        expiresAt: customerInvites.expiresAt,
        usedAt: customerInvites.usedAt,
        preassignedCategory: customerInvites.preassignedCategory,
        preassignedJarQuota: customerInvites.preassignedJarQuota,
        createdAt: customerInvites.createdAt,
        zoneName: zones.name,
      })
      .from(customerInvites)
      .leftJoin(zones, eq(customerInvites.preassignedZoneId, zones.id))
      .orderBy(desc(customerInvites.id))
      .limit(50);

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
