import { Router, Response } from 'express';
import { db } from '../db';
import { inventoryItems, stockMovements } from '../db/schema';
import { eq, sql, and, like, count, sum } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const inventoryRouter = Router();
inventoryRouter.use(authenticate);

const itemCreateSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.enum(['bottled_water', 'dispensers_coolers', 'caps_seals_accessories', 'accessories']),
  description: z.string().optional(),
  inPlantQty: z.number().min(0).default(0),
  withClientsQty: z.number().min(0).default(0),
  unitCost: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  refundableDeposit: z.number().min(0).default(0),
  batchLot: z.string().optional(),
  bay: z.string().optional(),
  minThreshold: z.number().min(0).default(10),
});

// List inventory items
inventoryRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', category, search, stockStatus } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let conditions: any[] = [eq(inventoryItems.isActive, true)];
    
    if (category && category !== 'all') conditions.push(eq(inventoryItems.category, category as any));
    if (stockStatus && stockStatus !== 'all') conditions.push(eq(inventoryItems.stockStatus, stockStatus as any));
    if (search) {
      conditions.push(like(inventoryItems.name, `%${search}%`));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(inventoryItems)
      .where(and(...conditions))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Stats
    const [totalValuation] = await db
      .select({ total: sql<number>`SUM(${inventoryItems.inPlantQty} * ${inventoryItems.unitCost})` })
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true));

    const [filledReady] = await db
      .select({ total: sum(inventoryItems.inPlantQty) })
      .from(inventoryItems)
      .where(and(eq(inventoryItems.isActive, true), eq(inventoryItems.category, 'bottled_water')));

    const [circulation] = await db
      .select({ total: sql<number>`SUM(${inventoryItems.inPlantQty} + ${inventoryItems.withClientsQty})` })
      .from(inventoryItems)
      .where(eq(inventoryItems.isActive, true));

    const [lowStock] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        sql`${inventoryItems.inPlantQty} < ${inventoryItems.minThreshold}`
      ));

    res.json({
      data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalResult?.count || 0,
      },
      stats: {
        totalValuation: Number(totalValuation?.total) || 0,
        filledReady: Number(filledReady?.total) || 0,
        totalCirculation: Number(circulation?.total) || 0,
        lowStockCount: lowStock?.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Create item
inventoryRouter.post('/', authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const body = itemCreateSchema.parse(req.body);
    const result = await db.insert(inventoryItems).values(body);
    res.status(201).json({ id: result[0].insertId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
inventoryRouter.put('/:id', authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await db.update(inventoryItems).set(req.body).where(eq(inventoryItems.id, parseInt(req.params.id)));
    res.json({ message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Stock movements
inventoryRouter.get('/movements', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', itemId } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let conditions: any[] = [];
    if (itemId) conditions.push(eq(stockMovements.itemId, parseInt(itemId as string)));

    const data = await db
      .select()
      .from(stockMovements)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(parseInt(limit as string))
      .offset(offset)
      .orderBy(sql`${stockMovements.createdAt} DESC`);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// Export CSV
inventoryRouter.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const data = await db.select().from(inventoryItems).where(eq(inventoryItems.isActive, true));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    data.forEach(row => {
      csvStream.write({
        SKU: row.sku,
        Name: row.name,
        Category: row.category,
        'In Plant': row.inPlantQty,
        'With Clients': row.withClientsQty,
        'Unit Cost (PKR)': row.unitCost,
        'Sale Price (PKR)': row.salePrice,
        'Deposit (PKR)': row.refundableDeposit,
        'Batch/Lot': row.batchLot,
        Bay: row.bay,
      });
    });

    csvStream.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to export' });
  }
});
