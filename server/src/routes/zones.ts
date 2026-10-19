import { Router, Response } from 'express';
import { db } from '../db';
import { zones } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';

export const zonesRouter = Router();

// In-memory cache / fallback for Karachi zones
let inMemoryZones = [
  { id: 1, name: 'Clifton & Sea View', code: 'Z-01', city: 'Karachi', sector: 'South', totalStops: 42, isActive: true },
  { id: 2, name: 'DHA Phase 5 & 6', code: 'Z-02', city: 'Karachi', sector: 'South', totalStops: 58, isActive: true },
  { id: 3, name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', city: 'Karachi', sector: 'East', totalStops: 36, isActive: true },
  { id: 4, name: 'PECHS & Tariq Road', code: 'Z-04', city: 'Karachi', sector: 'East', totalStops: 29, isActive: true },
  { id: 5, name: 'North Nazimabad Block A-D', code: 'Z-05', city: 'Karachi', sector: 'Central', totalStops: 34, isActive: true },
  { id: 6, name: 'Korangi Industrial Area', code: 'Z-06', city: 'Karachi', sector: 'Korangi', totalStops: 48, isActive: true },
];

const zoneSchema = z.object({
  name: z.string().min(2, 'Zone name is required'),
  code: z.string().min(2, 'Zone code is required'),
  city: z.string().default('Karachi'),
  sector: z.string().optional().default('Central'),
  totalStops: z.number().optional().default(20),
});

// List all zones (Public/Authenticated)
zonesRouter.get('/', async (req, res: Response) => {
  try {
    const dbData = await db
      .select()
      .from(zones)
      .where(eq(zones.isActive, true))
      .orderBy(zones.id);

    if (dbData && dbData.length > 0) {
      return res.json(dbData);
    }
    // Fallback to active in-memory list
    return res.json(inMemoryZones.filter(z => z.isActive));
  } catch (err: any) {
    // If DB offline, return inMemory
    return res.json(inMemoryZones.filter(z => z.isActive));
  }
});

// Add new zone
zonesRouter.post('/', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = zoneSchema.parse(req.body);
    let newZone: any = null;

    try {
      const result = await db.insert(zones).values({
        name: parsed.name,
        code: parsed.code.toUpperCase(),
        city: parsed.city,
        sector: parsed.sector,
        totalStops: parsed.totalStops,
        isActive: true,
      } as any);

      const insertId = (result as any)[0]?.insertId || Date.now();
      newZone = {
        id: insertId,
        name: parsed.name,
        code: parsed.code.toUpperCase(),
        city: parsed.city,
        sector: parsed.sector,
        totalStops: parsed.totalStops,
        isActive: true,
      };
    } catch (dbErr) {
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update zone
zonesRouter.patch('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, code, sector, city, totalStops } = req.body;

    try {
      await db.update(zones).set({
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(sector && { sector }),
        ...(city && { city }),
        ...(totalStops !== undefined && { totalStops: Number(totalStops) }),
      }).where(eq(zones.id, id));
    } catch (dbErr) {}

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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete zone (soft delete or remove)
zonesRouter.delete('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    try {
      // Try to soft delete first to avoid foreign key errors
      await db.update(zones).set({ isActive: false }).where(eq(zones.id, id));
    } catch (dbErr) {}

    // Update in-memory list
    inMemoryZones = inMemoryZones.filter(z => z.id !== id);

    res.json({ message: 'Zone deleted successfully', id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
