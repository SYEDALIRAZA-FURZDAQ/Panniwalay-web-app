import { Router, Response } from 'express';
import { db } from '../db';
import { riders, vehicles, zones, cashHandovers } from '../db/schema';
import { eq, sql, and, like, or } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const ridersRouter = Router();

// KPI Stats
ridersRouter.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allRiders = await db.select().from(riders);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List riders with filtering
ridersRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, zoneId, search, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions: any[] = [];
    if (status && status !== 'all') {
      conditions.push(eq(riders.status, status as any));
    }
    if (zoneId && zoneId !== 'all') {
      conditions.push(eq(riders.zoneId, parseInt(zoneId)));
    }
    if (search) {
      conditions.push(
        or(
          like(riders.fullName, `%${search}%`),
          like(riders.riderId, `%${search}%`),
          like(riders.phone, `%${search}%`),
          like(riders.cnic, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: riders.id,
        riderId: riders.riderId,
        fullName: riders.fullName,
        phone: riders.phone,
        cnic: riders.cnic,
        zoneId: riders.zoneId,
        vehicleId: riders.vehicleId,
        depositAmount: riders.depositAmount,
        commissionRate: riders.commissionRate,
        status: riders.status,
        dailyJarQuota: riders.dailyJarQuota,
        dailyJarsDelivered: riders.dailyJarsDelivered,
        cashInHand: riders.cashInHand,
        rating: riders.rating,
        avatarUrl: riders.avatarUrl,
        gpsStatus: riders.gpsStatus,
        isActive: riders.isActive,
        zoneName: zones.name,
        zoneCode: zones.code,
        vehicleReg: vehicles.registrationNo,
        vehicleType: vehicles.type,
      })
      .from(riders)
      .leftJoin(zones, eq(riders.zoneId, zones.id))
      .leftJoin(vehicles, eq(riders.vehicleId, vehicles.id))
      .where(whereClause)
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export
ridersRouter.get('/export/csv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await db
      .select({
        'Rider ID': riders.riderId,
        'Full Name': riders.fullName,
        'Phone': riders.phone,
        'CNIC': riders.cnic,
        'Status': riders.status,
        'Deposit (PKR)': riders.depositAmount,
        'Cash in Hand (PKR)': riders.cashInHand,
        'Daily Quota': riders.dailyJarQuota,
        'Delivered Today': riders.dailyJarsDelivered,
        'Rating': riders.rating,
      })
      .from(riders);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="riders.csv"');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    data.forEach((row: any) => csvStream.write(row));
    csvStream.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Rider
ridersRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [rider] = await db
      .select()
      .from(riders)
      .where(eq(riders.id, id));

    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    const handovers = await db
      .select()
      .from(cashHandovers)
      .where(eq(cashHandovers.riderId, id))
      .orderBy(sql`${cashHandovers.handoverDate} DESC`)
      .limit(10);

    res.json({ rider, handovers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const riderSchema = z.object({
  riderId: z.string().min(2),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  cnic: z.string().min(13),
  zoneId: z.number().optional().nullable(),
  vehicleId: z.number().optional().nullable(),
  depositAmount: z.number().default(0),
  commissionRate: z.string().default('0'),
  dailyJarQuota: z.number().default(0),
  status: z.enum(['on_route', 'available', 'rest_day', 'off_shift']).default('available'),
  avatarUrl: z.string().optional().nullable(),
});

// Create Rider
ridersRouter.post('/', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = riderSchema.parse(req.body);
    const result = await db.insert(riders).values(body as any);
    res.status(201).json({ id: (result as any)[0].insertId, message: 'Rider created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update Rider
ridersRouter.put('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const body = riderSchema.partial().parse(req.body);
    await db.update(riders).set(body as any).where(eq(riders.id, id));
    res.json({ message: 'Rider updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Record Cash Handover
ridersRouter.post('/:id/handover', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, routeRunId, notes } = req.body;

    await db.insert(cashHandovers).values({
      riderId: id,
      routeRunId: routeRunId ? parseInt(routeRunId) : null,
      amount: parseInt(amount),
      receivedById: req.user!.id,
      handoverDate: new Date().toISOString().split('T')[0] as any,
      notes,
      status: 'reconciled',
    });

    // Deduct from rider's cash in hand
    await db
      .update(riders)
      .set({
        cashInHand: sql`${riders.cashInHand} - ${parseInt(amount)}`,
      })
      .where(eq(riders.id, id));

    res.json({ message: 'Cash handover recorded successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
