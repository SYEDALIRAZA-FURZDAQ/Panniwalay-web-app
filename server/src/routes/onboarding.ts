import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { customerInvites, customers, zones, deposits } from '../db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { getSettingValue } from './settings';

export const onboardingRouter = Router();

// Step 1: Verify token (Optional verification)
// Also returns dynamic pricing from settings so the client never needs to hardcode prices.
onboardingRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    // Fetch current pricing from settings
    const standardDepositPerJar = parseInt(await getSettingValue('pricing.standardDeposit', '1000'), 10);
    const refillPricePerJar = parseInt(await getSettingValue('pricing.standardRefill', '220'), 10);

    const { token } = req.query as { token?: string };
    if (!token) {
      return res.json({
        valid: true,
        preassignedZoneId: 1,
        zoneName: 'Clifton & Sea View (Z-01)',
        preassignedCategory: 'residential',
        preassignedJarQuota: 2,
        standardDepositPerJar,
        refillPricePerJar,
      });
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

    if (invite) {
      return res.json({
        valid: true,
        preassignedZoneId: invite.preassignedZoneId || 1,
        zoneName: invite.zoneName || 'Clifton & Sea View (Z-01)',
        preassignedCategory: invite.preassignedCategory || 'residential',
        preassignedJarQuota: invite.preassignedJarQuota || 2,
        standardDepositPerJar,
        refillPricePerJar,
      });
    }

    // Allow direct onboarding even if token is custom / demo
    res.json({
      valid: true,
      preassignedZoneId: 1,
      zoneName: 'Clifton & Sea View (Z-01)',
      preassignedCategory: 'residential',
      preassignedJarQuota: 2,
      standardDepositPerJar,
      refillPricePerJar,
    });
  } catch (error: any) {
    // Fallback — still serve dynamic pricing
    let standardDepositPerJar = 1000;
    let refillPricePerJar = 220;
    try {
      standardDepositPerJar = parseInt(await getSettingValue('pricing.standardDeposit', '1000'), 10);
      refillPricePerJar = parseInt(await getSettingValue('pricing.standardRefill', '220'), 10);
    } catch {}
    res.json({
      valid: true,
      preassignedZoneId: 1,
      zoneName: 'Clifton & Sea View (Z-01)',
      preassignedCategory: 'residential',
      preassignedJarQuota: 2,
      standardDepositPerJar,
      refillPricePerJar,
    });
  }
});

const registerCustomerSchema = z.object({
  token: z.string().optional().nullable(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  type: z.enum(['residential', 'corporate']).default('residential'),
  zoneId: z.number().default(1),
  jarQuota: z.number().min(1).default(2),
  address: z.string().min(3),
  landmark: z.string().optional().nullable(),
  deliveryNote: z.string().optional().nullable(),
  refillCycle: z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
});

// Step 2: Complete Registration (Direct without OTP)
onboardingRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerCustomerSchema.parse(req.body);

    // Fetch current deposit price from settings dynamically
    const standardDepositPerJar = parseInt(await getSettingValue('pricing.standardDeposit', '1000'), 10);
    const jarQuota = body.jarQuota || 2;
    const depositHeld = standardDepositPerJar * jarQuota;

    // If token is provided, mark invite as used if present
    if (body.token) {
      try {
        const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex');
        const [invite] = await db
          .select()
          .from(customerInvites)
          .where(eq(customerInvites.tokenHash, tokenHash));

        if (invite) {
          await db
            .update(customerInvites)
            .set({ usedAt: new Date() })
            .where(eq(customerInvites.id, invite.id));
        }
      } catch (e) {
        console.warn('Invite token update skipped:', e);
      }
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
      zoneId: body.zoneId || 1,
      jarQuota,
      address: body.address,
      landmark: body.landmark || null,
      deliveryNote: body.deliveryNote || null,
      refillCycle: body.refillCycle,
      status: 'active',
      depositHeld, // Uses dynamic deposit from settings
      jarsInCirculation: 0,
    } as any);

    const customerId = (insertResult as any)?.insertId || Math.floor(1000 + Math.random() * 9000);

    // Record initial deposit entry in deposits ledger (only if deposit > 0)
    if (depositHeld > 0) {
      try {
        await db.insert(deposits).values({
          customerId,
          amount: depositHeld,
          type: 'collect',
          method: 'cash',
          referenceNo: `INIT-DEP-${customerCode}`,
          notes: 'Initial jar deposit collected on customer registration',
        });
      } catch (depErr) {
        console.warn('Initial deposit ledger entry warning:', depErr);
      }
    }

    res.status(201).json({
      success: true,
      customerCode,
      customerId,
      message: 'Account successfully registered and added to database! Our delivery fleet will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Failed to complete registration' });
  }
});
