import { Router, Response } from 'express';
import { db } from '../db';
import { routeRuns, routeStops, riders, vehicles, zones, customers, targetRoutes } from '../db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';

export const routesRouter = Router();

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
    shift: 'morning' as const,
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
    shift: 'morning' as const,
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
    shift: 'morning' as const,
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
    shift: 'afternoon' as const,
    departureTime: '01:30 PM',
    loadingDockBay: 'Bay #4',
    targetJars: 160,
    targetCash: 35200,
    estStops: 28,
    description: 'Industrial textile mills, factories and packaging units afternoon refill',
    isActive: true,
  },
];

const targetRouteSchema = z.object({
  routeCode: z.string().min(2, 'Route code is required'),
  name: z.string().min(2, 'Route name is required'),
  zoneId: z.number(),
  riderId: z.number().optional().nullable(),
  vehicleId: z.number().optional().nullable(),
  shift: z.enum(['morning', 'afternoon']).default('morning'),
  departureTime: z.string().optional().default('07:30 AM'),
  loadingDockBay: z.string().optional().default('Bay #1'),
  targetJars: z.number().default(120),
  targetCash: z.number().default(0),
  estStops: z.number().default(20),
  description: z.string().optional().nullable(),
});

// ─── TARGET ROUTES ENDPOINTS (BEFORE /:id TO AVOID SHADOWING) ───

// List Target Routes
routesRouter.get('/target-routes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dbRoutes = await db
      .select({
        id: targetRoutes.id,
        routeCode: targetRoutes.routeCode,
        name: targetRoutes.name,
        zoneId: targetRoutes.zoneId,
        riderId: targetRoutes.riderId,
        vehicleId: targetRoutes.vehicleId,
        shift: targetRoutes.shift,
        departureTime: targetRoutes.departureTime,
        loadingDockBay: targetRoutes.loadingDockBay,
        targetJars: targetRoutes.targetJars,
        targetCash: targetRoutes.targetCash,
        estStops: targetRoutes.estStops,
        description: targetRoutes.description,
        isActive: targetRoutes.isActive,
        createdAt: targetRoutes.createdAt,
        zoneName: zones.name,
        zoneCode: zones.code,
        riderName: riders.fullName,
        riderCode: riders.riderId,
        riderPhone: riders.phone,
        vehicleReg: vehicles.registrationNo,
        vehicleType: vehicles.type,
      })
      .from(targetRoutes)
      .leftJoin(zones, eq(targetRoutes.zoneId, zones.id))
      .leftJoin(riders, eq(targetRoutes.riderId, riders.id))
      .leftJoin(vehicles, eq(targetRoutes.vehicleId, vehicles.id))
      .where(eq(targetRoutes.isActive, true))
      .orderBy(targetRoutes.id);

    if (dbRoutes && dbRoutes.length > 0) {
      return res.json(dbRoutes);
    }
    return res.json(inMemoryTargetRoutes.filter(r => r.isActive));
  } catch (error: any) {
    return res.json(inMemoryTargetRoutes.filter(r => r.isActive));
  }
});

// Create Target Route
routesRouter.post('/target-routes', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = targetRouteSchema.parse(req.body);
    let createdRoute: any = null;

    try {
      const result = await db.insert(targetRoutes).values({
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
      } as any);

      const insertId = (result as any)[0]?.insertId || Date.now();
      createdRoute = {
        id: insertId,
        ...body,
        routeCode: body.routeCode.toUpperCase(),
        isActive: true,
      };
    } catch (dbErr) {
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Target Route
routesRouter.delete('/target-routes/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    try {
      await db.update(targetRoutes).set({ isActive: false }).where(eq(targetRoutes.id, id));
    } catch (dbErr) {}

    inMemoryTargetRoutes = inMemoryTargetRoutes.filter(r => r.id !== id);

    res.json({ message: 'Target route deleted successfully', id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── ROUTE RUNS LIST & CRUD ──────────────────────────────────────

// List route runs
routesRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, shift, date, zoneId } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (status && status !== 'all') {
      conditions.push(eq(routeRuns.status, status as any));
    }
    if (shift && shift !== 'all') {
      conditions.push(eq(routeRuns.shift, shift as any));
    }
    if (date) {
      conditions.push(eq(routeRuns.runDate, date as any));
    }
    if (zoneId && zoneId !== 'all') {
      conditions.push(eq(routeRuns.zoneId, parseInt(zoneId)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: routeRuns.id,
        runNumber: routeRuns.runNumber,
        zoneId: routeRuns.zoneId,
        riderId: routeRuns.riderId,
        vehicleId: routeRuns.vehicleId,
        shift: routeRuns.shift,
        departureTime: routeRuns.departureTime,
        loadingDockBay: routeRuns.loadingDockBay,
        totalJars: routeRuns.totalJars,
        deliveredJars: routeRuns.deliveredJars,
        emptyJarsExpected: routeRuns.emptyJarsExpected,
        emptyJarsReturned: routeRuns.emptyJarsReturned,
        cashToCollect: routeRuns.cashToCollect,
        cashCollected: routeRuns.cashCollected,
        status: routeRuns.status,
        vehicleCapacity: routeRuns.vehicleCapacity,
        payloadUtilization: routeRuns.payloadUtilization,
        estCompletionTime: routeRuns.estCompletionTime,
        totalStops: routeRuns.totalStops,
        completedStops: routeRuns.completedStops,
        runDate: routeRuns.runDate,
        zoneName: zones.name,
        zoneCode: zones.code,
        riderName: riders.fullName,
        riderCode: riders.riderId,
        riderPhone: riders.phone,
        vehicleReg: vehicles.registrationNo,
        vehicleType: vehicles.type,
      })
      .from(routeRuns)
      .leftJoin(zones, eq(routeRuns.zoneId, zones.id))
      .leftJoin(riders, eq(routeRuns.riderId, riders.id))
      .leftJoin(vehicles, eq(routeRuns.vehicleId, vehicles.id))
      .where(whereClause)
      .orderBy(desc(routeRuns.id));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Run with all its stops
routesRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [run] = await db
      .select({
        id: routeRuns.id,
        runNumber: routeRuns.runNumber,
        zoneId: routeRuns.zoneId,
        riderId: routeRuns.riderId,
        vehicleId: routeRuns.vehicleId,
        shift: routeRuns.shift,
        departureTime: routeRuns.departureTime,
        loadingDockBay: routeRuns.loadingDockBay,
        totalJars: routeRuns.totalJars,
        deliveredJars: routeRuns.deliveredJars,
        emptyJarsExpected: routeRuns.emptyJarsExpected,
        emptyJarsReturned: routeRuns.emptyJarsReturned,
        cashToCollect: routeRuns.cashToCollect,
        cashCollected: routeRuns.cashCollected,
        status: routeRuns.status,
        vehicleCapacity: routeRuns.vehicleCapacity,
        payloadUtilization: routeRuns.payloadUtilization,
        estCompletionTime: routeRuns.estCompletionTime,
        totalStops: routeRuns.totalStops,
        completedStops: routeRuns.completedStops,
        runDate: routeRuns.runDate,
        zoneName: zones.name,
        zoneCode: zones.code,
        riderName: riders.fullName,
        riderCode: riders.riderId,
        vehicleReg: vehicles.registrationNo,
      })
      .from(routeRuns)
      .leftJoin(zones, eq(routeRuns.zoneId, zones.id))
      .leftJoin(riders, eq(routeRuns.riderId, riders.id))
      .leftJoin(vehicles, eq(routeRuns.vehicleId, vehicles.id))
      .where(eq(routeRuns.id, id));

    if (!run) return res.status(404).json({ error: 'Route run not found' });

    const stops = await db
      .select({
        id: routeStops.id,
        stopOrder: routeStops.stopOrder,
        customerId: routeStops.customerId,
        customerName: customers.fullName,
        customerCode: customers.customerCode,
        phone: customers.phone,
        address: routeStops.address,
        jarsToDeliver: routeStops.jarsToDeliver,
        jarsDelivered: routeStops.jarsDelivered,
        emptyJarsCollected: routeStops.emptyJarsCollected,
        cashAmount: routeStops.cashAmount,
        cashCollected: routeStops.cashCollected,
        status: routeStops.status,
        notes: routeStops.notes,
        completedAt: routeStops.completedAt,
      })
      .from(routeStops)
      .leftJoin(customers, eq(routeStops.customerId, customers.id))
      .where(eq(routeStops.routeRunId, id))
      .orderBy(routeStops.stopOrder);

    res.json({ run, stops });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Printable manifest data
routesRouter.get('/:id/manifest', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [run] = await db
      .select({
        id: routeRuns.id,
        runNumber: routeRuns.runNumber,
        shift: routeRuns.shift,
        departureTime: routeRuns.departureTime,
        loadingDockBay: routeRuns.loadingDockBay,
        totalJars: routeRuns.totalJars,
        cashToCollect: routeRuns.cashToCollect,
        runDate: routeRuns.runDate,
        zoneName: zones.name,
        zoneCode: zones.code,
        riderName: riders.fullName,
        riderCode: riders.riderId,
        riderPhone: riders.phone,
        vehicleReg: vehicles.registrationNo,
      })
      .from(routeRuns)
      .leftJoin(zones, eq(routeRuns.zoneId, zones.id))
      .leftJoin(riders, eq(routeRuns.riderId, riders.id))
      .leftJoin(vehicles, eq(routeRuns.vehicleId, vehicles.id))
      .where(eq(routeRuns.id, id));

    if (!run) return res.status(404).json({ error: 'Route run not found' });

    const stops = await db
      .select({
        stopOrder: routeStops.stopOrder,
        customerName: customers.fullName,
        customerCode: customers.customerCode,
        phone: customers.phone,
        address: routeStops.address,
        jarsToDeliver: routeStops.jarsToDeliver,
        emptyJarsCollected: routeStops.emptyJarsCollected,
        cashAmount: routeStops.cashAmount,
        notes: routeStops.notes,
        status: routeStops.status,
      })
      .from(routeStops)
      .leftJoin(customers, eq(routeStops.customerId, customers.id))
      .where(eq(routeStops.routeRunId, id))
      .orderBy(routeStops.stopOrder);

    res.json({
      manifestInfo: run,
      stops,
      generatedAt: new Date().toISOString(),
      plant: 'Plant #4 — Karachi Industrial Area',
      company: 'Panniwalay Mineral Water',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const createRunSchema = z.object({
  runNumber: z.string().min(2),
  zoneId: z.number(),
  riderId: z.number().optional().nullable(),
  vehicleId: z.number().optional().nullable(),
  shift: z.enum(['morning', 'afternoon']).default('morning'),
  departureTime: z.string().optional().nullable(),
  loadingDockBay: z.string().optional().nullable(),
  totalJars: z.number().default(0),
  vehicleCapacity: z.number().default(100),
  payloadUtilization: z.string().default('0'),
  estCompletionTime: z.string().optional().nullable(),
  runDate: z.string(),
  stops: z.array(z.object({
    customerId: z.number(),
    stopOrder: z.number(),
    address: z.string().optional().nullable(),
    jarsToDeliver: z.number().default(1),
    cashAmount: z.number().default(0),
    notes: z.string().optional().nullable(),
  })).optional(),
});

// Create Run
routesRouter.post('/', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = createRunSchema.parse(req.body);
    const { stops, ...runData } = body;

    const result = await db.insert(routeRuns).values({
      ...runData,
      totalStops: stops ? stops.length : 0,
      status: 'pending',
    } as any);

    const runId = (result as any)[0].insertId;

    if (stops && stops.length > 0) {
      await db.insert(routeStops).values(
        stops.map((s) => ({
          routeRunId: runId,
          customerId: s.customerId,
          stopOrder: s.stopOrder,
          address: s.address,
          jarsToDeliver: s.jarsToDeliver,
          cashAmount: s.cashAmount,
          notes: s.notes,
          status: 'pending',
        })) as any
      );
    }

    res.status(201).json({ id: runId, message: 'Route run created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update Run status
routesRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    await db.update(routeRuns).set({ status }).where(eq(routeRuns.id, id));

    // If dispatched, update rider status
    if (status === 'dispatched' || status === 'in_transit') {
      const [run] = await db.select({ riderId: routeRuns.riderId }).from(routeRuns).where(eq(routeRuns.id, id));
      if (run?.riderId) {
        await db.update(riders).set({ status: 'on_route' }).where(eq(riders.id, run.riderId));
      }
    } else if (status === 'completed') {
      const [run] = await db.select({ riderId: routeRuns.riderId }).from(routeRuns).where(eq(routeRuns.id, id));
      if (run?.riderId) {
        await db.update(riders).set({ status: 'available' }).where(eq(riders.id, run.riderId));
      }
    }

    res.json({ message: 'Status updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update Stop status
routesRouter.patch('/:runId/stops/:stopId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stopId = parseInt(req.params.stopId);
    const runId = parseInt(req.params.runId);
    const { status, jarsDelivered, emptyJarsCollected, cashCollected, notes } = req.body;

    await db.update(routeStops).set({
      ...(status && { status }),
      ...(jarsDelivered !== undefined && { jarsDelivered }),
      ...(emptyJarsCollected !== undefined && { emptyJarsCollected }),
      ...(cashCollected !== undefined && { cashCollected }),
      ...(notes && { notes }),
      ...(status === 'completed' ? { completedAt: new Date() } : {}),
    }).where(eq(routeStops.id, stopId));

    // Recalculate routeRun completed stops and totals
    const allStops = await db.select().from(routeStops).where(eq(routeStops.routeRunId, runId));
    const completedCount = allStops.filter(s => s.status === 'completed').length;
    const deliveredSum = allStops.reduce((acc, s) => acc + (s.jarsDelivered || 0), 0);
    const emptySum = allStops.reduce((acc, s) => acc + (s.emptyJarsCollected || 0), 0);
    const cashSum = allStops.filter(s => s.cashCollected).reduce((acc, s) => acc + (s.cashAmount || 0), 0);

    await db.update(routeRuns).set({
      completedStops: completedCount,
      deliveredJars: deliveredSum,
      emptyJarsReturned: emptySum,
      cashCollected: cashSum,
    }).where(eq(routeRuns.id, runId));

    res.json({ message: 'Stop updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Route Run
routesRouter.delete('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    try {
      // First delete associated stops
      await db.delete(routeStops).where(eq(routeStops.routeRunId, id));
      // Then delete run
      await db.delete(routeRuns).where(eq(routeRuns.id, id));
    } catch (dbErr) {}

    res.json({ message: 'Route run deleted successfully', id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
