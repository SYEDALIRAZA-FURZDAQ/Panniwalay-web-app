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
exports.onboardingRouter = (0, express_1.Router)();
// Step 1: Verify token (Optional verification)
exports.onboardingRouter.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.json({ valid: true, preassignedZoneId: 1, zoneName: 'Clifton & Sea View (Z-01)', preassignedCategory: 'residential', preassignedJarQuota: 2 });
        }
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const [invite] = await db_1.db
            .select({
            id: schema_1.customerInvites.id,
            expiresAt: schema_1.customerInvites.expiresAt,
            usedAt: schema_1.customerInvites.usedAt,
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
            return res.json({
                valid: true,
                preassignedZoneId: invite.preassignedZoneId || 1,
                zoneName: invite.zoneName || 'Clifton & Sea View (Z-01)',
                preassignedCategory: invite.preassignedCategory || 'residential',
                preassignedJarQuota: invite.preassignedJarQuota || 2,
            });
        }
        // Allow direct onboarding even if token is custom / demo
        res.json({
            valid: true,
            preassignedZoneId: 1,
            zoneName: 'Clifton & Sea View (Z-01)',
            preassignedCategory: 'residential',
            preassignedJarQuota: 2,
        });
    }
    catch (error) {
        res.json({
            valid: true,
            preassignedZoneId: 1,
            zoneName: 'Clifton & Sea View (Z-01)',
            preassignedCategory: 'residential',
            preassignedJarQuota: 2,
        });
    }
});
const registerCustomerSchema = zod_1.z.object({
    token: zod_1.z.string().optional().nullable(),
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(8),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')).nullable(),
    type: zod_1.z.enum(['residential', 'corporate']).default('residential'),
    zoneId: zod_1.z.number().default(1),
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
        // If token is provided, mark invite as used if present
        if (body.token) {
            try {
                const tokenHash = crypto_1.default.createHash('sha256').update(body.token).digest('hex');
                const [invite] = await db_1.db
                    .select()
                    .from(schema_1.customerInvites)
                    .where((0, drizzle_orm_1.eq)(schema_1.customerInvites.tokenHash, tokenHash));
                if (invite) {
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
        // Generate unique customer code: e.g. CUST-KHI-4912
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const customerCode = `CUST-KHI-${randomSuffix}`;
        const [insertResult] = await db_1.db.insert(schema_1.customers).values({
            customerCode,
            fullName: body.fullName,
            phone: body.phone,
            email: body.email || null,
            type: body.type,
            zoneId: body.zoneId || 1,
            jarQuota: body.jarQuota || 2,
            address: body.address,
            landmark: body.landmark || null,
            deliveryNote: body.deliveryNote || null,
            refillCycle: body.refillCycle,
            status: 'active',
            depositHeld: 1000 * (body.jarQuota || 2), // Standard deposit per jar in PKR
            jarsInCirculation: 0,
        });
        const customerId = insertResult?.insertId || Math.floor(1000 + Math.random() * 9000);
        // Record initial deposit entry in deposits ledger
        try {
            await db_1.db.insert(schema_1.deposits).values({
                customerId,
                amount: 1000 * (body.jarQuota || 2),
                type: 'collect',
                method: 'cash',
                referenceNo: `INIT-DEP-${customerCode}`,
                notes: 'Initial jar deposit collected on customer registration',
            });
        }
        catch (depErr) {
            console.warn('Initial deposit ledger entry warning:', depErr);
        }
        res.status(201).json({
            success: true,
            customerCode,
            customerId,
            message: 'Account successfully registered and added to database! Our delivery fleet will contact you shortly.',
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message || 'Failed to complete registration' });
    }
});
//# sourceMappingURL=onboarding.js.map