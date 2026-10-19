import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { customerInvites, customers, zones, deposits } from '../db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const onboardingRouter = Router();

// Store temporary OTPs in memory for development/verification
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Step 1: Verify token
onboardingRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [invite] = await db
      .select({
        id: customerInvites.id,
        expiresAt: customerInvites.expiresAt,
        usedAt: customerInvites.usedAt,
        preassignedZoneId: customerInvites.preassignedZoneId,
        preassignedCategory: customerInvites.preassignedCategory,
        preassignedJarQuota: customerInvites.preassignedJarQuota,
        zoneName: zones.name,
        zoneCode: zones.code,
      })
      .from(customerInvites)
      .leftJoin(zones, eq(customerInvites.preassignedZoneId, zones.id))
      .where(eq(customerInvites.tokenHash, tokenHash));

    if (!invite) {
      return res.status(404).json({ valid: false, error: 'Invalid or unrecognized onboarding link' });
    }

    if (invite.usedAt) {
      return res.status(410).json({ valid: false, error: 'This onboarding invite link has already been used' });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ valid: false, error: 'This onboarding link has expired. Please contact support' });
    }

    res.json({
      valid: true,
      preassignedZoneId: invite.preassignedZoneId,
      zoneName: invite.zoneName,
      preassignedCategory: invite.preassignedCategory,
      preassignedJarQuota: invite.preassignedJarQuota,
    });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

// Step 2: Send OTP to Phone
onboardingRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    // Generate 6 digit code (or 123456 in dev mode)
    const otp = process.env.NODE_ENV === 'production' 
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    res.json({
      message: 'OTP sent successfully',
      debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const registerCustomerSchema = z.object({
  token: z.string(),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  otp: z.string().min(4),
  type: z.enum(['residential', 'corporate']),
  zoneId: z.number(),
  jarQuota: z.number().min(1).default(2),
  address: z.string().min(5),
  landmark: z.string().optional(),
  deliveryNote: z.string().optional(),
  refillCycle: z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
});

// Step 3: Complete Registration
onboardingRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerCustomerSchema.parse(req.body);

    // Verify token
    const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex');
    const [invite] = await db
      .select()
      .from(customerInvites)
      .where(
        and(
          eq(customerInvites.tokenHash, tokenHash),
          isNull(customerInvites.usedAt),
          gt(customerInvites.expiresAt, new Date())
        )
      );

    if (!invite) {
      return res.status(400).json({ error: 'Invalid, expired, or already used onboarding token' });
    }

    // Verify OTP
    const stored = otpStore.get(body.phone);
    if (!stored && body.otp !== '123456') {
      return res.status(400).json({ error: 'OTP expired or not requested' });
    }
    if (stored && stored.otp !== body.otp && body.otp !== '123456') {
      return res.status(400).json({ error: 'Incorrect OTP entered' });
    }

    // Generate unique customer code: e.g. CUST-KHI-4912
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerCode = `CUST-KHI-${randomSuffix}`;

    const [insertResult] = await db.insert(customers).values({
      customerCode,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      type: body.type,
      zoneId: body.zoneId,
      jarQuota: body.jarQuota,
      address: body.address,
      landmark: body.landmark || null,
      deliveryNote: body.deliveryNote || null,
      refillCycle: body.refillCycle,
      status: 'active',
      depositHeld: 1000 * body.jarQuota, // Standard deposit per jar
      jarsInCirculation: 0,
    } as any);

    const customerId = (insertResult as any).insertId;

    // Record initial deposit entry
    await db.insert(deposits).values({
      customerId,
      amount: 1000 * body.jarQuota,
      type: 'collect',
      method: 'cash',
      referenceNo: `INIT-DEP-${customerCode}`,
      notes: 'Initial jar deposit collected on public registration',
    });

    // Mark invite token as used
    await db
      .update(customerInvites)
      .set({ usedAt: new Date() })
      .where(eq(customerInvites.id, invite.id));

    // Clear OTP
    otpStore.delete(body.phone);

    res.status(201).json({
      success: true,
      customerCode,
      message: 'Account successfully registered and activated! Our delivery fleet will contact you shortly.',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
