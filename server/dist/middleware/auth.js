"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: 1,
                    email: 'admin@panniwalay.pk',
                    fullName: 'Tariq Mansoor',
                    roleId: 1,
                    roleName: 'admin',
                    tenantId: 'plant_default',
                };
                return next();
            }
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '4f9c8e1a7b3d2f5e0c6a8b1d9e2f4a7c8b0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f');
            let dbUser = null;
            try {
                const [u] = await db_1.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId))
                    .limit(1);
                dbUser = u;
            }
            catch (dbErr) { }
            const tenantId = decoded.tenantId || (decoded.userId === 1 ? 'plant_default' : `tenant_${decoded.userId}`);
            if (dbUser && dbUser.isActive) {
                req.user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    fullName: dbUser.fullName,
                    roleId: dbUser.roleId,
                    roleName: decoded.roleName || 'admin',
                    tenantId,
                };
                return next();
            }
            // If user exists in token (e.g. in-memory or decoupled session)
            if (decoded && decoded.userId) {
                req.user = {
                    id: decoded.userId,
                    email: decoded.email || 'user@panniwalay.pk',
                    fullName: decoded.fullName || 'Admin User',
                    roleId: decoded.roleId || 1,
                    roleName: decoded.roleName || 'admin',
                    tenantId,
                };
                return next();
            }
        }
        catch (jwtErr) {
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: 1,
                    email: 'admin@panniwalay.pk',
                    fullName: 'Tariq Mansoor',
                    roleId: 1,
                    roleName: 'admin',
                    tenantId: 'plant_default',
                };
                return next();
            }
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: 1,
                email: 'admin@panniwalay.pk',
                fullName: 'Tariq Mansoor',
                roleId: 1,
                roleName: 'admin',
                tenantId: 'plant_default',
            };
            return next();
        }
        return res.status(401).json({ error: 'User not found or inactive' });
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: 1,
                email: 'admin@panniwalay.pk',
                fullName: 'Tariq Mansoor',
                roleId: 1,
                roleName: 'admin',
                tenantId: 'plant_default',
            };
            return next();
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.roleName)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map