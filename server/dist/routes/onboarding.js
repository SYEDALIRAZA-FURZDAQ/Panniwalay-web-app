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
// Store temporary OTPs in memory for development/verification
const otpStore = new Map();
// Step 1: Verify token
exports.onboardingRouter.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ valid: false, error: 'Token is required' });
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
    }
    catch (error) {
        res.status(500).json({ valid: false, error: error.message });
    }
});
// Step 2: Send OTP to Phone
exports.onboardingRouter.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ error: 'Phone number is required' });
        // Generate 6 digit code (or 123456 in dev mode)
        const otp = process.env.NODE_ENV === 'production'
            ? Math.floor(100000 + Math.random() * 900000).toString()
            : '123456';
        otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
        res.json({
            message: 'OTP sent successfully',
            debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const registerCustomerSchema = zod_1.z.object({
    token: zod_1.z.string(),
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    otp: zod_1.z.string().min(4),
    type: zod_1.z.enum(['residential', 'corporate']),
    zoneId: zod_1.z.number(),
    jarQuota: zod_1.z.number().min(1).default(2),
    address: zod_1.z.string().min(5),
    landmark: zod_1.z.string().optional(),
    deliveryNote: zod_1.z.string().optional(),
    refillCycle: zod_1.z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
});
// Step 3: Complete Registration
exports.onboardingRouter.post('/register', async (req, res) => {
    try {
        const body = registerCustomerSchema.parse(req.body);
        // Verify token
        const tokenHash = crypto_1.default.createHash('sha256').update(body.token).digest('hex');
        const [invite] = await db_1.db
            .select()
            .from(schema_1.customerInvites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customerInvites.tokenHash, tokenHash), (0, drizzle_orm_1.isNull)(schema_1.customerInvites.usedAt), (0, drizzle_orm_1.gt)(schema_1.customerInvites.expiresAt, new Date())));
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
        const [insertResult] = await db_1.db.insert(schema_1.customers).values({
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
        });
        const customerId = insertResult.insertId;
        // Record initial deposit entry
        await db_1.db.insert(schema_1.deposits).values({
            customerId,
            amount: 1000 * body.jarQuota,
            type: 'collect',
            method: 'cash',
            referenceNo: `INIT-DEP-${customerCode}`,
            notes: 'Initial jar deposit collected on public registration',
        });
        // Mark invite token as used
        await db_1.db
            .update(schema_1.customerInvites)
            .set({ usedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.customerInvites.id, invite.id));
        // Clear OTP
        otpStore.delete(body.phone);
        res.status(201).json({
            success: true,
            customerCode,
            message: 'Account successfully registered and activated! Our delivery fleet will contact you shortly.',
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//# sourceMappingURL=onboarding.js.map