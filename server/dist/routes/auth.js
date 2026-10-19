"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const generateTokens = (userId, roleName) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, roleName }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, roleName }, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
    return { accessToken, refreshToken };
};
// Login
exports.authRouter.post('/login', async (req, res) => {
    try {
        const body = loginSchema.parse(req.body);
        const [user] = await db_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            passwordHash: schema_1.users.passwordHash,
            fullName: schema_1.users.fullName,
            roleId: schema_1.users.roleId,
            isActive: schema_1.users.isActive,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, body.email))
            .limit(1);
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(body.password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Get role name
        const [role] = await db_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, user.roleId)).limit(1);
        const roleName = role?.name || 'user';
        const tokens = generateTokens(user.id, roleName);
        // Update refresh token and last login
        await db_1.db.update(schema_1.users).set({
            refreshToken: tokens.refreshToken,
            lastLoginAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Audit log
        await db_1.db.insert(schema_1.auditLogs).values({
            userId: user.id,
            action: 'LOGIN',
            entity: 'users',
            entityId: user.id,
            ipAddress: req.ip,
        });
        // Set httpOnly cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth/refresh',
        });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: roleName,
            },
            accessToken: tokens.accessToken,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Login failed' });
    }
});
// Refresh token
exports.authRouter.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        if (!token) {
            return res.status(401).json({ error: 'Refresh token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId))
            .limit(1);
        if (!user || !user.isActive || user.refreshToken !== token) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        const [role] = await db_1.db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, user.roleId)).limit(1);
        const roleName = role?.name || 'user';
        const tokens = generateTokens(user.id, roleName);
        await db_1.db.update(schema_1.users).set({
            refreshToken: tokens.refreshToken,
        }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        res.json({ accessToken: tokens.accessToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
// Logout
exports.authRouter.post('/logout', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user) {
            await db_1.db.update(schema_1.users).set({ refreshToken: null }).where((0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id));
            await db_1.db.insert(schema_1.auditLogs).values({
                userId: req.user.id,
                action: 'LOGOUT',
                entity: 'users',
                entityId: req.user.id,
                ipAddress: req.ip,
            });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        res.json({ message: 'Logged out' });
    }
    catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});
// Get current user
exports.authRouter.get('/me', auth_1.authenticate, async (req, res) => {
    res.json({ user: req.user });
});
//# sourceMappingURL=auth.js.map