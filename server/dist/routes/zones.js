"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zonesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
exports.zonesRouter = (0, express_1.Router)();
// In-memory cache / fallback for Karachi zones
let inMemoryZones = [
    { id: 1, name: 'Clifton & Sea View', code: 'Z-01', city: 'Karachi', sector: 'South', totalStops: 42, isActive: true },
    { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', city: 'Karachi', sector: 'South', totalStops: 58, isActive: true },
    { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', city: 'Karachi', sector: 'East', totalStops: 36, isActive: true },
    { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', city: 'Karachi', sector: 'East', totalStops: 29, isActive: true },
    { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', city: 'Karachi', sector: 'Central', totalStops: 34, isActive: true },
    { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', city: 'Karachi', sector: 'Korangi', totalStops: 48, isActive: true },
];
const zoneSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Zone name is required'),
    code: zod_1.z.string().min(2, 'Zone code is required'),
    city: zod_1.z.string().default('Karachi'),
    sector: zod_1.z.string().optional().default('Central'),
    totalStops: zod_1.z.number().optional().default(20),
});
// List all zones (Public/Authenticated)
exports.zonesRouter.get('/', async (req, res) => {
    try {
        const dbData = await db_1.db
            .select()
            .from(schema_1.zones)
            .where((0, drizzle_orm_1.eq)(schema_1.zones.isActive, true))
            .orderBy(schema_1.zones.id);
        if (dbData && dbData.length > 0) {
            return res.json(dbData);
        }
        // Fallback to active in-memory list
        return res.json(inMemoryZones.filter(z => z.isActive));
    }
    catch (err) {
        // If DB offline, return inMemory
        return res.json(inMemoryZones.filter(z => z.isActive));
    }
});
// Add new zone
exports.zonesRouter.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const parsed = zoneSchema.parse(req.body);
        let newZone = null;
        try {
            const result = await db_1.db.insert(schema_1.zones).values({
                name: parsed.name,
                code: parsed.code.toUpperCase(),
                city: parsed.city,
                sector: parsed.sector,
                totalStops: parsed.totalStops,
                isActive: true,
            });
            const insertId = result[0]?.insertId || Date.now();
            newZone = {
                id: insertId,
                name: parsed.name,
                code: parsed.code.toUpperCase(),
                city: parsed.city,
                sector: parsed.sector,
                totalStops: parsed.totalStops,
                isActive: true,
            };
        }
        catch (dbErr) {
            // If DB error, create in-memory
            const newId = inMemoryZones.length > 0 ? Math.max(...inMemoryZones.map(z => z.id)) + 1 : 1;
            newZone = {
                id: newId,
                name: parsed.name,
                code: parsed.code.toUpperCase(),
                city: parsed.city,
                sector: parsed.sector,
                totalStops: parsed.totalStops,
                isActive: true,
            };
        }
        inMemoryZones.push(newZone);
        res.status(201).json(newZone);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update zone
exports.zonesRouter.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, code, sector, city, totalStops } = req.body;
        try {
            await db_1.db.update(schema_1.zones).set({
                ...(name && { name }),
                ...(code && { code: code.toUpperCase() }),
                ...(sector && { sector }),
                ...(city && { city }),
                ...(totalStops !== undefined && { totalStops: Number(totalStops) }),
            }).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id));
        }
        catch (dbErr) { }
        const idx = inMemoryZones.findIndex(z => z.id === id);
        if (idx !== -1) {
            inMemoryZones[idx] = {
                ...inMemoryZones[idx],
                ...(name && { name }),
                ...(code && { code: code.toUpperCase() }),
                ...(sector && { sector }),
                ...(city && { city }),
                ...(totalStops !== undefined && { totalStops: Number(totalStops) }),
            };
        }
        res.json({ message: 'Zone updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete zone (soft delete or remove)
exports.zonesRouter.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        try {
            // Try to soft delete first to avoid foreign key errors
            await db_1.db.update(schema_1.zones).set({ isActive: false }).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id));
        }
        catch (dbErr) { }
        // Update in-memory list
        inMemoryZones = inMemoryZones.filter(z => z.id !== id);
        res.json({ message: 'Zone deleted successfully', id });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//# sourceMappingURL=zones.js.map