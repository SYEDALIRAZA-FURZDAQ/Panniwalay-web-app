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
                };
                return next();
            }
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const [user] = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId))
                .limit(1);
            if (user && user.isActive) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    roleId: user.roleId,
                    roleName: decoded.roleName || 'admin',
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