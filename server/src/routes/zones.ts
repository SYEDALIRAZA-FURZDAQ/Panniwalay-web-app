import { Router, Response } from 'express';
import { db } from '../db';
import { zones } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';

export const zonesRouter = Router();

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

    return res.json(dbData);
  } catch (err: any) {
    console.error('Failed to fetch zones:', err.message);
    return res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// Add new zone
zonesRouter.post('/', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = zoneSchema.parse(req.body);

    const result = await db.insert(zones).values({
      name: parsed.name,
      code: parsed.code.toUpperCase(),
      city: parsed.city,
      sector: parsed.sector,
      totalStops: parsed.totalStops,
      isActive: true,
    } as any);

    const insertId = (result as any)[0]?.insertId || Date.now();
    const newZone = {
      id: insertId,
      name: parsed.name,
      code: parsed.code.toUpperCase(),
      city: parsed.city,
      sector: parsed.sector,
      totalStops: parsed.totalStops,
      isActive: true,
    };

    res.status(201).json(newZone);
  } catch (error: any) {
    console.error('Failed to create zone:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update zone
zonesRouter.patch('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, code, sector, city, totalStops } = req.body;

    await db.update(zones).set({
      ...(name && { name }),
      ...(code && { code: code.toUpperCase() }),
      ...(sector && { sector }),
      ...(city && { city }),
      ...(totalStops !== undefined && { totalStops: Number(totalStops) }),
    }).where(eq(zones.id, id));

    res.json({ message: 'Zone updated successfully' });
  } catch (error: any) {
    console.error('Failed to update zone:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Delete zone (soft delete)
zonesRouter.delete('/:id', authenticate, authorize('admin', 'manager', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Soft delete to avoid foreign key constraint errors
    await db.update(zones).set({ isActive: false }).where(eq(zones.id, id));

    res.json({ message: 'Zone deleted successfully', id });
  } catch (error: any) {
    console.error('Failed to delete zone:', error.message);
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});
