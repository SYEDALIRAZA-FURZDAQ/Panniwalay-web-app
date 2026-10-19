import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { customerInvites, zones } from '../db/schema';
import { eq, desc, isNull, gt } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';

export const invitesRouter = Router();

const createInviteSchema = z.object({
  preassignedZoneId: z.number().optional().nullable(),
  preassignedCategory: z.enum(['residential', 'corporate']).default('residential'),
  preassignedJarQuota: z.number().default(2),
  expiryHours: z.number().default(168), // 7 days default
});

// Generate customer sign-up link
invitesRouter.post('/', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = createInviteSchema.parse(req.body);

    // Generate secure random 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + body.expiryHours * 60 * 60 * 1000);

    const result = await db.insert(customerInvites).values({
      tokenHash,
      expiresAt,
      preassignedZoneId: body.preassignedZoneId,
      preassignedCategory: body.preassignedCategory,
      preassignedJarQuota: body.preassignedJarQuota,
      createdById: req.user!.id,
    } as any);

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const signupUrl = `${baseUrl}/register?token=${rawToken}`;

    res.status(201).json({
      id: (result as any)[0].insertId,
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
invitesRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
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
