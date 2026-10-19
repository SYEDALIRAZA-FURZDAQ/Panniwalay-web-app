"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
exports.routesRouter = (0, express_1.Router)();
// Fallback in-memory target routes
let inMemoryTargetRoutes = [
    {
        id: 1,
        routeCode: 'TR-101',
        name: 'Clifton & Sea View Express',
        zoneId: 1,
        zoneName: 'Clifton & Sea View (Z-01)',
        riderId: 1,
        riderName: 'Kamran Akmal (RD-04)',
        vehicleId: 1,
        vehicleReg: 'KC-9821 (Suzuki Bolan)',
        shift: 'morning',
        departureTime: '07:30 AM',
        loadingDockBay: 'Bay #2',
        targetJars: 120,
        targetCash: 26400,
        estStops: 24,
        description: 'Daily morning residential supply for Clifton Block 1-5 and Sea View apartments',
        isActive: true,
    },
    {
        id: 2,
        routeCode: 'TR-102',
        name: 'DHA Phase 5 & 6 Heavy Commercial',
        zoneId: 2,
        zoneName: 'DHA Phase 5 & 6 (Z-02)',
        riderId: 2,
        riderName: 'Muhammad Bilal (RD-07)',
        vehicleId: 2,
        vehicleReg: 'KW-4412 (Hyundai Shehzore)',
        shift: 'morning',
        departureTime: '08:00 AM',
        loadingDockBay: 'Bay #1',
        targetJars: 240,
        targetCash: 52800,
        estStops: 42,
        description: 'Corporate towers, restaurants and high-volume residential compounds in DHA Phase 5/6',
        isActive: true,
    },
    {
        id: 3,
        routeCode: 'TR-103',
        name: 'Gulshan-e-Iqbal Block 1-7 Retail & Homes',
        zoneId: 3,
        zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
        riderId: 3,
        riderName: 'Zubair Ahmed (RD-02)',
        vehicleId: 3,
        vehicleReg: 'KR-1092 (Suzuki Ravi)',
        shift: 'morning',
        departureTime: '07:15 AM',
        loadingDockBay: 'Bay #3',
        targetJars: 100,
        targetCash: 22000,
        estStops: 20,
        description: 'University Road and Gulshan Block 1-7 family residential route',
        isActive: true,
    },
    {
        id: 4,
        routeCode: 'TR-104',
        name: 'Korangi Industrial Bulk Shift',
        zoneId: 6,
        zoneName: 'Korangi Industrial Area (Z-06)',
        riderId: 4,
        riderName: 'Rashid Khan (RD-11)',
        vehicleId: 4,
        vehicleReg: 'KF-3184 (FAW Carrier)',
        shift: 'afternoon',
        departureTime: '01:30 PM',
        loadingDockBay: 'Bay #4',
        targetJars: 160,
        targetCash: 35200,
        estStops: 28,
        description: 'Industrial textile mills, factories and packaging units afternoon refill',
        isActive: true,
    },
];
const targetRouteSchema = zod_1.z.object({
    routeCode: zod_1.z.string().min(2, 'Route code is required'),
    name: zod_1.z.string().min(2, 'Route name is required'),
    zoneId: zod_1.z.number(),
    riderId: zod_1.z.number().optional().nullable(),
    vehicleId: zod_1.z.number().optional().nullable(),
    shift: zod_1.z.enum(['morning', 'afternoon']).default('morning'),
    departureTime: zod_1.z.string().optional().default('07:30 AM'),
    loadingDockBay: zod_1.z.string().optional().default('Bay #1'),
    targetJars: zod_1.z.number().default(120),
    targetCash: zod_1.z.number().default(0),
    estStops: zod_1.z.number().default(20),
    description: zod_1.z.string().optional().nullable(),
});
// ─── TARGET ROUTES ENDPOINTS (BEFORE /:id TO AVOID SHADOWING) ───
// List Target Routes
exports.routesRouter.get('/target-routes', auth_1.authenticate, async (req, res) => {
    try {
        const dbRoutes = await db_1.db
            .select({
            id: schema_1.targetRoutes.id,
            routeCode: schema_1.targetRoutes.routeCode,
            name: schema_1.targetRoutes.name,
            zoneId: schema_1.targetRoutes.zoneId,
            riderId: schema_1.targetRoutes.riderId,
            vehicleId: schema_1.targetRoutes.vehicleId,
            shift: schema_1.targetRoutes.shift,
            departureTime: schema_1.targetRoutes.departureTime,
            loadingDockBay: schema_1.targetRoutes.loadingDockBay,
            targetJars: schema_1.targetRoutes.targetJars,
            targetCash: schema_1.targetRoutes.targetCash,
            estStops: schema_1.targetRoutes.estStops,
            description: schema_1.targetRoutes.description,
            isActive: schema_1.targetRoutes.isActive,
            createdAt: schema_1.targetRoutes.createdAt,
            zoneName: schema_1.zones.name,
            zoneCode: schema_1.zones.code,
            riderName: schema_1.riders.fullName,
            riderCode: schema_1.riders.riderId,
            riderPhone: schema_1.riders.phone,
            vehicleReg: schema_1.vehicles.registrationNo,
            vehicleType: schema_1.vehicles.type,
        })
            .from(schema_1.targetRoutes)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.targetRoutes.zoneId, schema_1.zones.id))
            .leftJoin(schema_1.riders, (0, drizzle_orm_1.eq)(schema_1.targetRoutes.riderId, schema_1.riders.id))
            .leftJoin(schema_1.vehicles, (0, drizzle_orm_1.eq)(schema_1.targetRoutes.vehicleId, schema_1.vehicles.id))
            .where((0, drizzle_orm_1.eq)(schema_1.targetRoutes.isActive, true))
            .orderBy(schema_1.targetRoutes.id);
        if (dbRoutes && dbRoutes.length > 0) {
            return res.json(dbRoutes);
        }
        return res.json(inMemoryTargetRoutes.filter(r => r.isActive));
    }
    catch (error) {
        return res.json(inMemoryTargetRoutes.filter(r => r.isActive));
    }
});
// Create Target Route
exports.routesRouter.post('/target-routes', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const body = targetRouteSchema.parse(req.body);
        let createdRoute = null;
        try {
            const result = await db_1.db.insert(schema_1.targetRoutes).values({
                routeCode: body.routeCode.toUpperCase(),
                name: body.name,
                zoneId: body.zoneId,
                riderId: body.riderId,
                vehicleId: body.vehicleId,
                shift: body.shift,
                departureTime: body.departureTime,
                loadingDockBay: body.loadingDockBay,
                targetJars: body.targetJars,
                targetCash: body.targetCash,
                estStops: body.estStops,
                description: body.description,
                isActive: true,
            });
            const insertId = result[0]?.insertId || Date.now();
            createdRoute = {
                id: insertId,
                ...body,
                routeCode: body.routeCode.toUpperCase(),
                isActive: true,
            };
        }
        catch (dbErr) {
            const newId = inMemoryTargetRoutes.length > 0 ? Math.max(...inMemoryTargetRoutes.map(r => r.id)) + 1 : 1;
            createdRoute = {
                id: newId,
                ...body,
                routeCode: body.routeCode.toUpperCase(),
                isActive: true,
            };
        }
        inMemoryTargetRoutes.push(createdRoute);
        res.status(201).json(createdRoute);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete Target Route
exports.routesRouter.delete('/target-routes/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        try {
            await db_1.db.update(schema_1.targetRoutes).set({ isActive: false }).where((0, drizzle_orm_1.eq)(schema_1.targetRoutes.id, id));
        }
        catch (dbErr) { }
        inMemoryTargetRoutes = inMemoryTargetRoutes.filter(r => r.id !== id);
        res.json({ message: 'Target route deleted successfully', id });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// ─── ROUTE RUNS LIST & CRUD ──────────────────────────────────────
// List route runs
exports.routesRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { status, shift, date, zoneId } = req.query;
        const conditions = [];
        if (status && status !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.routeRuns.status, status));
        }
        if (shift && shift !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.routeRuns.shift, shift));
        }
        if (date) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.routeRuns.runDate, date));
        }
        if (zoneId && zoneId !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.routeRuns.zoneId, parseInt(zoneId)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const data = await db_1.db
            .select({
            id: schema_1.routeRuns.id,
            runNumber: schema_1.routeRuns.runNumber,
            zoneId: schema_1.routeRuns.zoneId,
            riderId: schema_1.routeRuns.riderId,
            vehicleId: schema_1.routeRuns.vehicleId,
            shift: schema_1.routeRuns.shift,
            departureTime: schema_1.routeRuns.departureTime,
            loadingDockBay: schema_1.routeRuns.loadingDockBay,
            totalJars: schema_1.routeRuns.totalJars,
            deliveredJars: schema_1.routeRuns.deliveredJars,
            emptyJarsExpected: schema_1.routeRuns.emptyJarsExpected,
            emptyJarsReturned: schema_1.routeRuns.emptyJarsReturned,
            cashToCollect: schema_1.routeRuns.cashToCollect,
            cashCollected: schema_1.routeRuns.cashCollected,
            status: schema_1.routeRuns.status,
            vehicleCapacity: schema_1.routeRuns.vehicleCapacity,
            payloadUtilization: schema_1.routeRuns.payloadUtilization,
            estCompletionTime: schema_1.routeRuns.estCompletionTime,
            totalStops: schema_1.routeRuns.totalStops,
            completedStops: schema_1.routeRuns.completedStops,
            runDate: schema_1.routeRuns.runDate,
            zoneName: schema_1.zones.name,
            zoneCode: schema_1.zones.code,
            riderName: schema_1.riders.fullName,
            riderCode: schema_1.riders.riderId,
            riderPhone: schema_1.riders.phone,
            vehicleReg: schema_1.vehicles.registrationNo,
            vehicleType: schema_1.vehicles.type,
        })
            .from(schema_1.routeRuns)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.routeRuns.zoneId, schema_1.zones.id))
            .leftJoin(schema_1.riders, (0, drizzle_orm_1.eq)(schema_1.routeRuns.riderId, schema_1.riders.id))
            .leftJoin(schema_1.vehicles, (0, drizzle_orm_1.eq)(schema_1.routeRuns.vehicleId, schema_1.vehicles.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.routeRuns.id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Single Run with all its stops
exports.routesRouter.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [run] = await db_1.db
            .select({
            id: schema_1.routeRuns.id,
            runNumber: schema_1.routeRuns.runNumber,
            zoneId: schema_1.routeRuns.zoneId,
            riderId: schema_1.routeRuns.riderId,
            vehicleId: schema_1.routeRuns.vehicleId,
            shift: schema_1.routeRuns.shift,
            departureTime: schema_1.routeRuns.departureTime,
            loadingDockBay: schema_1.routeRuns.loadingDockBay,
            totalJars: schema_1.routeRuns.totalJars,
            deliveredJars: schema_1.routeRuns.deliveredJars,
            emptyJarsExpected: schema_1.routeRuns.emptyJarsExpected,
            emptyJarsReturned: schema_1.routeRuns.emptyJarsReturned,
            cashToCollect: schema_1.routeRuns.cashToCollect,
            cashCollected: schema_1.routeRuns.cashCollected,
            status: schema_1.routeRuns.status,
            vehicleCapacity: schema_1.routeRuns.vehicleCapacity,
            payloadUtilization: schema_1.routeRuns.payloadUtilization,
            estCompletionTime: schema_1.routeRuns.estCompletionTime,
            totalStops: schema_1.routeRuns.totalStops,
            completedStops: schema_1.routeRuns.completedStops,
            runDate: schema_1.routeRuns.runDate,
            zoneName: schema_1.zones.name,
            zoneCode: schema_1.zones.code,
            riderName: schema_1.riders.fullName,
            riderCode: schema_1.riders.riderId,
            vehicleReg: schema_1.vehicles.registrationNo,
        })
            .from(schema_1.routeRuns)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.routeRuns.zoneId, schema_1.zones.id))
            .leftJoin(schema_1.riders, (0, drizzle_orm_1.eq)(schema_1.routeRuns.riderId, schema_1.riders.id))
            .leftJoin(schema_1.vehicles, (0, drizzle_orm_1.eq)(schema_1.routeRuns.vehicleId, schema_1.vehicles.id))
            .where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
        if (!run)
            return res.status(404).json({ error: 'Route run not found' });
        const stops = await db_1.db
            .select({
            id: schema_1.routeStops.id,
            stopOrder: schema_1.routeStops.stopOrder,
            customerId: schema_1.routeStops.customerId,
            customerName: schema_1.customers.fullName,
            customerCode: schema_1.customers.customerCode,
            phone: schema_1.customers.phone,
            address: schema_1.routeStops.address,
            jarsToDeliver: schema_1.routeStops.jarsToDeliver,
            jarsDelivered: schema_1.routeStops.jarsDelivered,
            emptyJarsCollected: schema_1.routeStops.emptyJarsCollected,
            cashAmount: schema_1.routeStops.cashAmount,
            cashCollected: schema_1.routeStops.cashCollected,
            status: schema_1.routeStops.status,
            notes: schema_1.routeStops.notes,
            completedAt: schema_1.routeStops.completedAt,
        })
            .from(schema_1.routeStops)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.routeStops.customerId, schema_1.customers.id))
            .where((0, drizzle_orm_1.eq)(schema_1.routeStops.routeRunId, id))
            .orderBy(schema_1.routeStops.stopOrder);
        res.json({ run, stops });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Printable manifest data
exports.routesRouter.get('/:id/manifest', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [run] = await db_1.db
            .select({
            id: schema_1.routeRuns.id,
            runNumber: schema_1.routeRuns.runNumber,
            shift: schema_1.routeRuns.shift,
            departureTime: schema_1.routeRuns.departureTime,
            loadingDockBay: schema_1.routeRuns.loadingDockBay,
            totalJars: schema_1.routeRuns.totalJars,
            cashToCollect: schema_1.routeRuns.cashToCollect,
            runDate: schema_1.routeRuns.runDate,
            zoneName: schema_1.zones.name,
            zoneCode: schema_1.zones.code,
            riderName: schema_1.riders.fullName,
            riderCode: schema_1.riders.riderId,
            riderPhone: schema_1.riders.phone,
            vehicleReg: schema_1.vehicles.registrationNo,
        })
            .from(schema_1.routeRuns)
            .leftJoin(schema_1.zones, (0, drizzle_orm_1.eq)(schema_1.routeRuns.zoneId, schema_1.zones.id))
            .leftJoin(schema_1.riders, (0, drizzle_orm_1.eq)(schema_1.routeRuns.riderId, schema_1.riders.id))
            .leftJoin(schema_1.vehicles, (0, drizzle_orm_1.eq)(schema_1.routeRuns.vehicleId, schema_1.vehicles.id))
            .where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
        if (!run)
            return res.status(404).json({ error: 'Route run not found' });
        const stops = await db_1.db
            .select({
            stopOrder: schema_1.routeStops.stopOrder,
            customerName: schema_1.customers.fullName,
            customerCode: schema_1.customers.customerCode,
            phone: schema_1.customers.phone,
            address: schema_1.routeStops.address,
            jarsToDeliver: schema_1.routeStops.jarsToDeliver,
            emptyJarsCollected: schema_1.routeStops.emptyJarsCollected,
            cashAmount: schema_1.routeStops.cashAmount,
            notes: schema_1.routeStops.notes,
            status: schema_1.routeStops.status,
        })
            .from(schema_1.routeStops)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.routeStops.customerId, schema_1.customers.id))
            .where((0, drizzle_orm_1.eq)(schema_1.routeStops.routeRunId, id))
            .orderBy(schema_1.routeStops.stopOrder);
        res.json({
            manifestInfo: run,
            stops,
            generatedAt: new Date().toISOString(),
            plant: 'Plant #4 — Karachi Industrial Area',
            company: 'Panniwalay Mineral Water',
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const createRunSchema = zod_1.z.object({
    runNumber: zod_1.z.string().min(2),
    zoneId: zod_1.z.number(),
    riderId: zod_1.z.number().optional().nullable(),
    vehicleId: zod_1.z.number().optional().nullable(),
    shift: zod_1.z.enum(['morning', 'afternoon']).default('morning'),
    departureTime: zod_1.z.string().optional().nullable(),
    loadingDockBay: zod_1.z.string().optional().nullable(),
    totalJars: zod_1.z.number().default(0),
    vehicleCapacity: zod_1.z.number().default(100),
    payloadUtilization: zod_1.z.string().default('0'),
    estCompletionTime: zod_1.z.string().optional().nullable(),
    runDate: zod_1.z.string(),
    stops: zod_1.z.array(zod_1.z.object({
        customerId: zod_1.z.number(),
        stopOrder: zod_1.z.number(),
        address: zod_1.z.string().optional().nullable(),
        jarsToDeliver: zod_1.z.number().default(1),
        cashAmount: zod_1.z.number().default(0),
        notes: zod_1.z.string().optional().nullable(),
    })).optional(),
});
// Create Run
exports.routesRouter.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const body = createRunSchema.parse(req.body);
        const { stops, ...runData } = body;
        const result = await db_1.db.insert(schema_1.routeRuns).values({
            ...runData,
            totalStops: stops ? stops.length : 0,
            status: 'pending',
        });
        const runId = result[0].insertId;
        if (stops && stops.length > 0) {
            await db_1.db.insert(schema_1.routeStops).values(stops.map((s) => ({
                routeRunId: runId,
                customerId: s.customerId,
                stopOrder: s.stopOrder,
                address: s.address,
                jarsToDeliver: s.jarsToDeliver,
                cashAmount: s.cashAmount,
                notes: s.notes,
                status: 'pending',
            })));
        }
        res.status(201).json({ id: runId, message: 'Route run created successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update Run status
exports.routesRouter.patch('/:id/status', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        await db_1.db.update(schema_1.routeRuns).set({ status }).where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
        // If dispatched, update rider status
        if (status === 'dispatched' || status === 'in_transit') {
            const [run] = await db_1.db.select({ riderId: schema_1.routeRuns.riderId }).from(schema_1.routeRuns).where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
            if (run?.riderId) {
                await db_1.db.update(schema_1.riders).set({ status: 'on_route' }).where((0, drizzle_orm_1.eq)(schema_1.riders.id, run.riderId));
            }
        }
        else if (status === 'completed') {
            const [run] = await db_1.db.select({ riderId: schema_1.routeRuns.riderId }).from(schema_1.routeRuns).where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
            if (run?.riderId) {
                await db_1.db.update(schema_1.riders).set({ status: 'available' }).where((0, drizzle_orm_1.eq)(schema_1.riders.id, run.riderId));
            }
        }
        res.json({ message: 'Status updated' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update Stop status
exports.routesRouter.patch('/:runId/stops/:stopId', auth_1.authenticate, async (req, res) => {
    try {
        const stopId = parseInt(req.params.stopId);
        const runId = parseInt(req.params.runId);
        const { status, jarsDelivered, emptyJarsCollected, cashCollected, notes } = req.body;
        await db_1.db.update(schema_1.routeStops).set({
            ...(status && { status }),
            ...(jarsDelivered !== undefined && { jarsDelivered }),
            ...(emptyJarsCollected !== undefined && { emptyJarsCollected }),
            ...(cashCollected !== undefined && { cashCollected }),
            ...(notes && { notes }),
            ...(status === 'completed' ? { completedAt: new Date() } : {}),
        }).where((0, drizzle_orm_1.eq)(schema_1.routeStops.id, stopId));
        // Recalculate routeRun completed stops and totals
        const allStops = await db_1.db.select().from(schema_1.routeStops).where((0, drizzle_orm_1.eq)(schema_1.routeStops.routeRunId, runId));
        const completedCount = allStops.filter(s => s.status === 'completed').length;
        const deliveredSum = allStops.reduce((acc, s) => acc + (s.jarsDelivered || 0), 0);
        const emptySum = allStops.reduce((acc, s) => acc + (s.emptyJarsCollected || 0), 0);
        const cashSum = allStops.filter(s => s.cashCollected).reduce((acc, s) => acc + (s.cashAmount || 0), 0);
        await db_1.db.update(schema_1.routeRuns).set({
            completedStops: completedCount,
            deliveredJars: deliveredSum,
            emptyJarsReturned: emptySum,
            cashCollected: cashSum,
        }).where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, runId));
        res.json({ message: 'Stop updated' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete Route Run
exports.routesRouter.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'manager', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        try {
            // First delete associated stops
            await db_1.db.delete(schema_1.routeStops).where((0, drizzle_orm_1.eq)(schema_1.routeStops.routeRunId, id));
            // Then delete run
            await db_1.db.delete(schema_1.routeRuns).where((0, drizzle_orm_1.eq)(schema_1.routeRuns.id, id));
        }
        catch (dbErr) { }
        res.json({ message: 'Route run deleted successfully', id });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//# sourceMappingURL=routeRuns.js.map