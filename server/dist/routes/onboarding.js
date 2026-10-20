"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const settings_1 = require("./settings");
const invites_1 = require("./invites");
const customers_1 = require("./customers");
exports.onboardingRouter = (0, express_1.Router)();
// Step 1: Verify token (Optional verification)
// Also returns dynamic pricing from settings and the associated tenant/admin
exports.onboardingRouter.get('/verify', async (req, res) => {
    try {
        // Fetch current pricing from settings
        const standardDepositPerJar = parseInt(await (0, settings_1.getSettingValue)('pricing.standardDeposit', '1000'), 10);
        const refillPricePerJar = parseInt(await (0, settings_1.getSettingValue)('pricing.standardRefill', '220'), 10);
        const { token, tenant } = req.query;
        let targetTenantId = tenant || 'plant_default';
        let targetCreatedById = targetTenantId === 'plant_default' ? 1 : undefined;
        let targetAdminName = undefined;
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
        const cachedInvite = invites_1.inMemoryInvites.get(token);
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
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const cachedByHash = invites_1.inMemoryInvites.get(tokenHash);
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
            const [invite] = await db_1.db
                .select({
                id: schema_1.customerInvites.id,
                expiresAt: schema_1.customerInvites.expiresAt,
                usedAt: schema_1.customerInvites.usedAt,
                createdById: schema_1.customerInvites.createdById,
                preassignedZoneId: schema_1.customerInvites.preassignedZoneId,
                preassignedCategory: schema_1.customerInvites.preassignedCategory,
                preassignedJarQuota: schema_1.customerInvites.preassignedJarQuota,
                zoneName: schema_1.zones.name,
                zoneCode: schema_1.zones.code,
            })
                .from(schema_1.customerInvites)
                .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.customerInvites.preassignedZoneId, schema_1.zones.id))
                .where((0, drizzle_orm_1.eq)(schema_1.customerInvites.tokenHash, tokenHash));
            if (invite) {
                const inviteTenant = invite.createdById && invite.createdById !== 1 ? `tenant_${invite.createdById}` : targetTenantId;
                return res.json({
                    valid: true,
                    tenantId: inviteTenant,
                    createdById: invite.createdById || 1,
                    adminName: targetAdminName,
                    preassignedZoneId: invite.preassignedZoneId || 1,
                    zoneName: invite.zoneName || 'Clifton & Sea View (Z-01)',
                    preassignedCategory: invite.preassignedCategory || 'residential',
                    preassignedJarQuota: invite.preassignedJarQuota || 2,
                    standardDepositPerJar,
                    refillPricePerJar,
                });
            }
        }
        catch (dbErr) {
            console.warn('DB invite lookup fallback:', dbErr);
        }
        // Allow direct onboarding even if token is custom / demo
        res.json({
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
    catch (error) {
        // Fallback — still serve dynamic pricing
        let standardDepositPerJar = 1000;
        let refillPricePerJar = 220;
        try {
            standardDepositPerJar = parseInt(await (0, settings_1.getSettingValue)('pricing.standardDeposit', '1000'), 10);
            refillPricePerJar = parseInt(await (0, settings_1.getSettingValue)('pricing.standardRefill', '220'), 10);
        }
        catch { }
        res.json({
            valid: true,
            tenantId: req.query?.tenant || 'plant_default',
            preassignedZoneId: 1,
            zoneName: 'Clifton & Sea View (Z-01)',
            preassignedCategory: 'residential',
            preassignedJarQuota: 2,
            standardDepositPerJar,
            refillPricePerJar,
        });
    }
});
const registerCustomerSchema = zod_1.z.object({
    token: zod_1.z.string().optional().nullable(),
    tenantId: zod_1.z.string().optional().nullable(),
    createdById: zod_1.z.number().optional().nullable(),
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(8),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')).nullable(),
    type: zod_1.z.enum(['residential', 'corporate']).default('residential'),
    zoneId: zod_1.z.number().default(1),
    zoneName: zod_1.z.string().optional().or(zod_1.z.literal('')).nullable(),
    jarQuota: zod_1.z.number().min(1).default(2),
    address: zod_1.z.string().min(3),
    landmark: zod_1.z.string().optional().nullable(),
    deliveryNote: zod_1.z.string().optional().nullable(),
    refillCycle: zod_1.z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
});
// Step 2: Complete Registration (Direct without OTP)
exports.onboardingRouter.post('/register', async (req, res) => {
    try {
        const body = registerCustomerSchema.parse(req.body);
        // Fetch current deposit price from settings dynamically
        const standardDepositPerJar = parseInt(await (0, settings_1.getSettingValue)('pricing.standardDeposit', '1000'), 10);
        const jarQuota = body.jarQuota || 2;
        const depositHeld = standardDepositPerJar * jarQuota;
        // Resolve tenantId and createdById from token or body
        let targetTenantId = body.tenantId || 'plant_default';
        let targetCreatedById = body.createdById || (targetTenantId === 'plant_default' ? 1 : undefined);
        // If token is provided, check in-memory cache and mark invite as used in DB
        if (body.token) {
            const cached = invites_1.inMemoryInvites.get(body.token);
            if (cached) {
                if (!body.tenantId && cached.tenantId)
                    targetTenantId = cached.tenantId;
                if (!body.createdById && cached.createdById)
                    targetCreatedById = cached.createdById;
                cached.usedAt = new Date();
            }
            try {
                const tokenHash = crypto_1.default.createHash('sha256').update(body.token).digest('hex');
                const [invite] = await db_1.db
                    .select()
                    .from(schema_1.customerInvites)
                    .where((0, drizzle_orm_1.eq)(schema_1.customerInvites.tokenHash, tokenHash));
                if (invite) {
                    if (!body.tenantId && invite.createdById && invite.createdById !== 1) {
                        targetTenantId = `tenant_${invite.createdById}`;
                    }
                    if (!body.createdById && invite.createdById) {
                        targetCreatedById = invite.createdById;
                    }
                    await db_1.db
                        .update(schema_1.customerInvites)
                        .set({ usedAt: new Date() })
                        .where((0, drizzle_orm_1.eq)(schema_1.customerInvites.id, invite.id));
                }
            }
            catch (e) {
                console.warn('Invite token update skipped:', e);
            }
        }
        // Resolve real zone name dynamically from DB or body
        let resolvedZoneName = body.zoneName?.trim() || null;
        const selectedZoneId = body.zoneId || 1;
        if (!resolvedZoneName && selectedZoneId) {
            try {
                const [z] = await db_1.db
                    .select({ name: schema_1.zones.name, code: schema_1.zones.code, sector: schema_1.zones.sector })
                    .from(schema_1.zones)
                    .where((0, drizzle_orm_1.eq)(schema_1.zones.id, selectedZoneId))
                    .limit(1);
                if (z) {
                    resolvedZoneName = `${z.name} (${z.code})${z.sector ? ` — ${z.sector}` : ''}`;
                }
            }
            catch (e) {
                console.warn('Zone lookup error:', e);
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
        if (targetTenantId === 'plant_default') {
            try {
                const [insertResult] = await db_1.db.insert(schema_1.customers).values({
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
                });
                if (insertResult?.insertId) {
                    customerId = insertResult.insertId;
                }
            }
            catch (dbErr) {
                console.warn('DB customer insert fallback:', dbErr);
            }
            // Record initial deposit entry in deposits ledger (only if deposit > 0)
            if (depositHeld > 0) {
                try {
                    await db_1.db.insert(schema_1.deposits).values({
                        customerId,
                        amount: depositHeld,
                        type: 'collect',
                        method: 'cash',
                        referenceNo: `INIT-DEP-${customerCode}`,
                        notes: 'Initial jar deposit collected on customer registration',
                    });
                }
                catch (depErr) {
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
        (0, customers_1.addCustomerRecord)(newCustRecord);
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message || 'Failed to complete registration' });
    }
});
//# sourceMappingURL=onboarding.js.map