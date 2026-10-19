import { Router, Response } from 'express';
import { db } from '../db';
import { routeRuns, routeStops, riders, vehicles, zones, customers } from '../db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';

export const routesRouter = Router();

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
