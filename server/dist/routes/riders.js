"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ridersRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const fast_csv_1 = require("fast-csv");
exports.ridersRouter = (0, express_1.Router)();
// KPI Stats
exports.ridersRouter.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const allRiders = await db_1.db.select().from(schema_1.riders);
        const active = allRiders.filter(r => r.isActive);
        const onRoute = active.filter(r => r.status === 'on_route').length;
        const available = active.filter(r => r.status === 'available').length;
        const restDay = active.filter(r => r.status === 'rest_day').length;
        const offShift = active.filter(r => r.status === 'off_shift').length;
        const totalCashInHand = active.reduce((acc, r) => acc + (r.cashInHand || 0), 0);
        const totalDeposits = active.reduce((acc, r) => acc + (r.depositAmount || 0), 0);
        const avgRating = active.length > 0
            ? (active.reduce((acc, r) => acc + parseFloat(r.rating || '0'), 0) / active.length).toFixed(1)
            : '0.0';
        res.json({
            totalRiders: active.length,
            onRoute,
            available,
            restDay,
            offShift,
            totalCashInHand,
            totalDeposits,
            avgRating,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// List riders with filtering
exports.ridersRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { status, zoneId, search, page = '1', limit = '50' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.riders.isActive, true)];
        if (status && status !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.riders.status, status));
        }
        if (zoneId && zoneId !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.riders.zoneId, parseInt(zoneId)));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.riders.fullName, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.riders.riderId, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.riders.phone, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.riders.cnic, `%${search}%`)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const data = await db_1.db
            .select({
            id: schema_1.riders.id,
            riderId: schema_1.riders.riderId,
            fullName: schema_1.riders.fullName,
            phone: schema_1.riders.phone,
            cnic: schema_1.riders.cnic,
            zoneId: schema_1.riders.zoneId,
            vehicleId: schema_1.riders.vehicleId,
            depositAmount: schema_1.riders.depositAmount,
            commissionRate: schema_1.riders.commissionRate,
            status: schema_1.riders.status,
            dailyJarQuota: schema_1.riders.dailyJarQuota,
            dailyJarsDelivered: schema_1.riders.dailyJarsDelivered,
            cashInHand: schema_1.riders.cashInHand,
            rating: schema_1.riders.rating,
            avatarUrl: schema_1.riders.avatarUrl,
            gpsStatus: schema_1.riders.gpsStatus,
            isActive: schema_1.riders.isActive,
            zoneName: schema_1.zones.name,
            zoneCode: schema_1.zones.code,
            vehicleReg: schema_1.vehicles.registrationNo,
            vehicleType: schema_1.vehicles.type,
        })
            .from(schema_1.riders)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.riders.zoneId, schema_1.zones.id))
            .leftJoin(schema_1.vehicles, (0, drizzle_orm_1.eq)(schema_1.riders.vehicleId, schema_1.vehicles.id))
            .where(whereClause)
            .limit(parseInt(limit))
            .offset(offset);
        res.json({ data, page: parseInt(page), limit: parseInt(limit) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// CSV Export
exports.ridersRouter.get('/export/csv', auth_1.authenticate, async (req, res) => {
    try {
        const data = await db_1.db
            .select({
            'Rider ID': schema_1.riders.riderId,
            'Full Name': schema_1.riders.fullName,
            'Phone': schema_1.riders.phone,
            'CNIC': schema_1.riders.cnic,
            'Status': schema_1.riders.status,
            'Deposit (PKR)': schema_1.riders.depositAmount,
            'Cash in Hand (PKR)': schema_1.riders.cashInHand,
            'Daily Quota': schema_1.riders.dailyJarQuota,
            'Delivered Today': schema_1.riders.dailyJarsDelivered,
            'Rating': schema_1.riders.rating,
        })
            .from(schema_1.riders);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="riders.csv"');
        const csvStream = (0, fast_csv_1.format)({ headers: true });
        csvStream.pipe(res);
        data.forEach((row) => csvStream.write(row));
        csvStream.end();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Single Rider
exports.ridersRouter.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rider] = await db_1.db
            .select()
            .from(schema_1.riders)
            .where((0, drizzle_orm_1.eq)(schema_1.riders.id, id));
        if (!rider)
            return res.status(404).json({ error: 'Rider not found' });
        const handovers = await db_1.db
            .select()
            .from(schema_1.cashHandovers)
            .where((0, drizzle_orm_1.eq)(schema_1.cashHandovers.riderId, id))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.cashHandovers.handoverDate} DESC`)
            .limit(10);
        res.json({ rider, handovers });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const riderSchema = zod_1.z.object({
    riderId: zod_1.z.string().min(2),
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(8),
    cnic: zod_1.z.string().min(13),
    zoneId: zod_1.z.number().optional().nullable(),
    vehicleId: zod_1.z.number().optional().nullable(),
    depositAmount: zod_1.z.number().default(0),
    commissionRate: zod_1.z.string().default('0'),
    dailyJarQuota: zod_1.z.number().default(0),
    status: zod_1.z.enum(['on_route', 'available', 'rest_day', 'off_shift']).default('available'),
    avatarUrl: zod_1.z.string().optional().nullable(),
});
// Create Rider
exports.ridersRouter.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const body = riderSchema.parse(req.body);
        const result = await db_1.db.insert(schema_1.riders).values(body);
        res.status(201).json({ id: result[0].insertId, message: 'Rider created successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update Rider
exports.ridersRouter.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const body = riderSchema.partial().parse(req.body);
        await db_1.db.update(schema_1.riders).set(body).where((0, drizzle_orm_1.eq)(schema_1.riders.id, id));
        res.json({ message: 'Rider updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Record Cash Handover
exports.ridersRouter.post('/:id/handover', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { amount, routeRunId, notes } = req.body;
        await db_1.db.insert(schema_1.cashHandovers).values({
            riderId: id,
            routeRunId: routeRunId ? parseInt(routeRunId) : null,
            amount: parseInt(amount),
            receivedById: req.user.id,
            handoverDate: new Date().toISOString().split('T')[0],
            notes,
            status: 'reconciled',
        });
        // Deduct from rider's cash in hand
        await db_1.db
            .update(schema_1.riders)
            .set({
            cashInHand: (0, drizzle_orm_1.sql) `${schema_1.riders.cashInHand} - ${parseInt(amount)}`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.riders.id, id));
        res.json({ message: 'Cash handover recorded successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete / Deactivate Rider
exports.ridersRouter.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid rider ID' });
        }
        try {
            await db_1.db
                .update(schema_1.riders)
                .set({
                isActive: false,
                status: 'off_shift',
            })
                .where((0, drizzle_orm_1.eq)(schema_1.riders.id, id));
        }
        catch (dbErr) {
            console.warn('DB delete rider fallback:', dbErr);
        }
        res.json({ message: 'Rider removed successfully', id });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to remove rider' });
    }
});
//# sourceMappingURL=riders.js.map