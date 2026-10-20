"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryInvites = exports.invitesRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.invitesRouter = (0, express_1.Router)();
// In-memory invite registry for fast and reliable resolution across sessions
exports.inMemoryInvites = new Map();
const createInviteSchema = zod_1.z.object({
    preassignedZoneId: zod_1.z.number().optional().nullable(),
    preassignedCategory: zod_1.z.enum(['residential', 'corporate']).default('residential'),
    preassignedJarQuota: zod_1.z.number().default(2),
    expiryHours: zod_1.z.number().default(168), // 7 days default
    tenantId: zod_1.z.string().optional().nullable(),
    createdById: zod_1.z.number().optional().nullable(),
    adminName: zod_1.z.string().optional().nullable(),
});
// Generate customer sign-up link (Generates SHA-256 token and saves in database)
exports.invitesRouter.post('/', async (req, res) => {
    try {
        const body = createInviteSchema.parse(req.body);
        // Get user id and tenant id from token if authenticated, fallback to body or defaults
        let userId = body.createdById || 1;
        let tenantId = body.tenantId || (userId === 1 ? 'plant_default' : `tenant_${userId}`);
        let adminName = body.adminName || (userId === 1 ? 'Tariq Mansoor' : undefined);
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '4f9c8e1a7b3d2f5e0c6a8b1d9e2f4a7c8b0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f');
                if (decoded?.userId)
                    userId = body.createdById || decoded.userId;
                if (decoded?.tenantId && !body.tenantId)
                    tenantId = decoded.tenantId;
                if (decoded?.fullName && !body.adminName)
                    adminName = decoded.fullName;
            }
            catch (e) { }
        }
        // Generate secure random 32-byte hex token
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + body.expiryHours * 60 * 60 * 1000);
        let insertId = Date.now();
        try {
            const result = await db_1.db.insert(schema_1.customerInvites).values({
                tokenHash,
                expiresAt,
                preassignedZoneId: body.preassignedZoneId || 1,
                preassignedCategory: body.preassignedCategory,
                preassignedJarQuota: body.preassignedJarQuota,
                createdById: userId,
            });
            insertId = result[0]?.insertId || insertId;
        }
        catch (dbErr) {
            console.warn('DB insert invite warning:', dbErr);
        }
        // Cache in inMemoryInvites by token and tokenHash
        const stored = {
            id: insertId,
            token: rawToken,
            tokenHash,
            tenantId,
            createdById: userId,
            adminName,
            preassignedZoneId: body.preassignedZoneId || 1,
            preassignedCategory: body.preassignedCategory,
            preassignedJarQuota: body.preassignedJarQuota,
            expiresAt,
            createdAt: new Date(),
        };
        exports.inMemoryInvites.set(rawToken, stored);
        exports.inMemoryInvites.set(tokenHash, stored);
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const signupUrl = `${baseUrl}/register?token=${rawToken}&tenant=${tenantId}`;
        res.status(201).json({
            id: insertId,
            token: rawToken,
            tenantId,
            createdById: userId,
            adminName,
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