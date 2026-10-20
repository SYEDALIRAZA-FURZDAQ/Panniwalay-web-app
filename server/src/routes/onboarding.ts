import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { customerInvites, customers, zones, deposits } from '../db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { getSettingValue } from './settings';
import { inMemoryInvites } from './invites';
import { addCustomerRecord } from './customers';

export const onboardingRouter = Router();

// Step 1: Verify token (Optional verification)
// Also returns dynamic pricing from settings and the associated tenant/admin
onboardingRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    // Fetch current pricing from settings
    const standardDepositPerJar = parseInt(await getSettingValue('pricing.standardDeposit', '1000'), 10);
    const refillPricePerJar = parseInt(await getSettingValue('pricing.standardRefill', '220'), 10);

    const { token, tenant } = req.query as { token?: string; tenant?: string };

    let targetTenantId = tenant || 'plant_default';
    let targetCreatedById = targetTenantId === 'plant_default' ? 1 : undefined;
    let targetAdminName: string | undefined = undefined;

    if (!token) {
      return res.json({
        valid: true,
        tenantId: targetTenantId,
        createdById: targetCreatedById,
        adminName: targetAdminName,
        preassignedZoneId: 1,
        zoneName: 'Clifton & Sea View (Z-01)',
        preassignedCategory: 'residential',
        preassignedJarQuota: 2,
        standardDepositPerJar,
        refillPricePerJar,
      });
    }

    // 1. Check in-memory invite cache first
    const cachedInvite = inMemoryInvites.get(token);
    if (cachedInvite) {
      return res.json({
        valid: true,
        tenantId: cachedInvite.tenantId || targetTenantId,
        createdById: cachedInvite.createdById || targetCreatedById,
        adminName: cachedInvite.adminName,
        preassignedZoneId: cachedInvite.preassignedZoneId || 1,
        zoneName: 'Clifton & Sea View (Z-01)',
        preassignedCategory: cachedInvite.preassignedCategory || 'residential',
        preassignedJarQuota: cachedInvite.preassignedJarQuota || 2,
        standardDepositPerJar,
        refillPricePerJar,
      });
    }

    // 2. Check Database invite table
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const cachedByHash = inMemoryInvites.get(tokenHash);
    if (cachedByHash) {
      return res.json({
        valid: true,
        tenantId: cachedByHash.tenantId || targetTenantId,
        createdById: cachedByHash.createdById || targetCreatedById,
        adminName: cachedByHash.adminName,
        preassignedZoneId: cachedByHash.preassignedZoneId || 1,
        zoneName: 'Clifton & Sea View (Z-01)',
        preassignedCategory: cachedByHash.preassignedCategory || 'residential',
        preassignedJarQuota: cachedByHash.preassignedJarQuota || 2,
        standardDepositPerJar,
        refillPricePerJar,
      });
    }

    try {
      const [invite] = await db
        .select({
          id: customerInvites.id,
          expiresAt: customerInvites.expiresAt,
          usedAt: customerInvites.usedAt,
          createdById: customerInvites.createdById,
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
        const inviteTenant = invite.createdById && invite.createdById !== 1 ? `tenant_${invite.createdById}` : targetTenantId;
        const formattedZoneName = invite.zoneName ? `${invite.zoneName} (${invite.zoneCode || ''})`.trim() : undefined;
        return res.json({
          valid: true,
          tenantId: inviteTenant,
          createdById: invite.createdById || 1,
          adminName: targetAdminName,
          preassignedZoneId: invite.preassignedZoneId || undefined,
          zoneName: formattedZoneName,
          preassignedCategory: invite.preassignedCategory || 'residential',
          preassignedJarQuota: invite.preassignedJarQuota || 2,
          standardDepositPerJar,
          refillPricePerJar,
        });
      }
    } catch (dbErr) {
      console.warn('DB invite lookup fallback:', dbErr);
    }

    // Allow direct onboarding even if token is custom / demo
    res.json({
      valid: true,
      tenantId: targetTenantId,
      createdById: targetCreatedById,
      adminName: targetAdminName,
      preassignedZoneId: undefined,
      zoneName: undefined,
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
      tenantId: (req.query?.tenant as string) || 'plant_default',
      preassignedZoneId: undefined,
      zoneName: undefined,
      preassignedCategory: 'residential',
      preassignedJarQuota: 2,
      standardDepositPerJar,
      refillPricePerJar,
    });
  }
});

const registerCustomerSchema = z.object({
  token: z.string().optional().nullable(),
  tenantId: z.string().optional().nullable(),
  createdById: z.number().optional().nullable(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  type: z.enum(['residential', 'corporate']).default('residential'),
  zoneId: z.number().default(1),
  zoneName: z.string().optional().or(z.literal('')).nullable(),
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

    // Resolve tenantId and createdById from token or body
    let targetTenantId = body.tenantId || 'plant_default';
    let targetCreatedById = body.createdById || (targetTenantId === 'plant_default' ? 1 : undefined);

    // If token is provided, check in-memory cache and mark invite as used in DB
    if (body.token) {
      const cached = inMemoryInvites.get(body.token);
      if (cached) {
        if (!body.tenantId && cached.tenantId) targetTenantId = cached.tenantId;
        if (!body.createdById && cached.createdById) targetCreatedById = cached.createdById;
        cached.usedAt = new Date();
      }

      try {
        const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex');
        const [invite] = await db
          .select()
          .from(customerInvites)
          .where(eq(customerInvites.tokenHash, tokenHash));

        if (invite) {
          if (!body.tenantId && invite.createdById && invite.createdById !== 1) {
            targetTenantId = `tenant_${invite.createdById}`;
          }
          if (!body.createdById && invite.createdById) {
            targetCreatedById = invite.createdById;
          }
          await db
            .update(customerInvites)
            .set({ usedAt: new Date() })
            .where(eq(customerInvites.id, invite.id));
        }
      } catch (e) {
        console.warn('Invite token update skipped:', e);
      }
    }

    // Resolve real zone name dynamically from DB or body
    let resolvedZoneName = body.zoneName?.trim() || null;
    const selectedZoneId = body.zoneId || 1;
    if (!resolvedZoneName && selectedZoneId) {
      try {
        const [z] = await db
          .select({ name: zones.name, code: zones.code, sector: zones.sector })
          .from(zones)
          .where(eq(zones.id, selectedZoneId))
          .limit(1);
        if (z) {
          resolvedZoneName = `${z.name} (${z.code})${z.sector ? ` — ${z.sector}` : ''}`;
        }
      } catch (e) {
        console.warn('Zone name lookup error:', e);
      }
    }
    if (!resolvedZoneName) {
      resolvedZoneName = selectedZoneId === 7 ? 'Ancholi (Z-08) — Central' : 'Karachi Delivery Zone';
    }

    // Generate unique customer code: e.g. CUST-KHI-4912
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerCode = `CUST-KHI-${randomSuffix}`;

    let customerId = Date.now();

    // ONLY insert into shared MySQL customers table if tenant is plant_default!
    // Non-default tenants (such as Mohib Hyder, tenant_3) are private to that admin
    // and must not appear in the default admin's shared customer list.
    if (targetTenantId === 'plant_default') {
      try {
        const [insertResult] = await db.insert(customers).values({
          customerCode,
          fullName: body.fullName,
          phone: body.phone,
          email: body.email || null,
          type: body.type,
          zoneId: selectedZoneId,
          jarQuota,
          address: body.address,
          landmark: body.landmark || null,
          deliveryNote: body.deliveryNote || null,
          refillCycle: body.refillCycle,
          status: 'active',
          depositHeld, // Uses dynamic deposit from settings
          jarsInCirculation: 0,
        } as any);

        if ((insertResult as any)?.insertId) {
          customerId = (insertResult as any).insertId;
        }
      } catch (dbErr) {
        console.warn('DB customer insert fallback:', dbErr);
      }

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
    }

    // Save into inMemory customer store tagged with targetTenantId
    const newCustRecord = {
      id: customerId,
      customerCode,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || '',
      type: body.type,
      zoneId: selectedZoneId,
      zoneName: resolvedZoneName,
      jarQuota,
      jarsInCirculation: 0,
      depositHeld,
      refillCycle: body.refillCycle === 'twice_weekly' ? 'Twice Weekly' : body.refillCycle === 'on_call' ? 'On Call' : 'Weekly',
      status: 'active',
      address: body.address,
      tenantId: targetTenantId,
      createdById: targetCreatedById || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    addCustomerRecord(newCustRecord);

    res.status(201).json({
      success: true,
      customerCode,
      customerId,
      tenantId: targetTenantId,
      createdById: targetCreatedById,
      zoneName: resolvedZoneName,
      customer: newCustRecord,
      message: 'Account successfully registered and added to database! Our delivery fleet will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Failed to complete registration' });
  }
});
