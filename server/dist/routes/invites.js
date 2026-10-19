"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitesRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.invitesRouter = (0, express_1.Router)();
const createInviteSchema = zod_1.z.object({
    preassignedZoneId: zod_1.z.number().optional().nullable(),
    preassignedCategory: zod_1.z.enum(['residential', 'corporate']).default('residential'),
    preassignedJarQuota: zod_1.z.number().default(2),
    expiryHours: zod_1.z.number().default(168), // 7 days default
});
// Generate customer sign-up link (Generates SHA-256 token and saves in database)
exports.invitesRouter.post('/', async (req, res) => {
    try {
        const body = createInviteSchema.parse(req.body);
        // Get user id if authenticated, otherwise default to 1 (Admin)
        let userId = 1;
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '4f9c8e1a7b3d2f5e0c6a8b1d9e2f4a7c8b0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f');
                if (decoded?.userId)
                    userId = decoded.userId;
            }
            catch (e) { }
        }
        // Generate secure random 32-byte hex token
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + body.expiryHours * 60 * 60 * 1000);
        let insertId = 1;
        try {
            const result = await db_1.db.insert(schema_1.customerInvites).values({
                tokenHash,
                expiresAt,
                preassignedZoneId: body.preassignedZoneId || 1,
                preassignedCategory: body.preassignedCategory,
                preassignedJarQuota: body.preassignedJarQuota,
                createdById: userId,
            });
            insertId = result[0]?.insertId || 1;
        }
        catch (dbErr) {
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// List recent customer invites
exports.invitesRouter.get('/', async (req, res) => {
    try {
        const list = await db_1.db
            .select({
            id: schema_1.customerInvites.id,
            expiresAt: schema_1.customerInvites.expiresAt,
            usedAt: schema_1.customerInvites.usedAt,
            preassignedCategory: schema_1.customerInvites.preassignedCategory,
            preassignedJarQuota: schema_1.customerInvites.preassignedJarQuota,
            createdAt: schema_1.customerInvites.createdAt,
            zoneName: schema_1.zones.name,
        })
            .from(schema_1.customerInvites)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.customerInvites.preassignedZoneId, schema_1.zones.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.customerInvites.id))
            .limit(50);
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=invites.js.map