import { Router, Response } from 'express';
import { db } from '../db';
import { customers, zones, deposits, jarLedger } from '../db/schema';
import { eq, sql, and, like, count, sum, or } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const customersRouter = Router();
customersRouter.use(authenticate);

const customerCreateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  type: z.enum(['residential', 'corporate']),
  zoneId: z.number().optional(),
  jarQuota: z.number().min(1).default(2),
  refillCycle: z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
  address: z.string().optional(),
  landmark: z.string().optional(),
  deliveryNote: z.string().optional(),
});

// List customers with filters
customersRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', type, status, zoneId, search } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let conditions: any[] = [eq(customers.isActive, true)];
    
    if (type && type !== 'all') conditions.push(eq(customers.type, type as any));
    if (status && status !== 'all') conditions.push(eq(customers.status, status as any));
    if (zoneId) conditions.push(eq(customers.zoneId, parseInt(zoneId as string)));
    if (search) {
      conditions.push(
        or(
          like(customers.fullName, `%${search}%`),
          like(customers.phone, `%${search}%`),
          like(customers.customerCode, `%${search}%`)
        )
      );
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .limit(parseInt(limit as string))
      .offset(offset)
      .orderBy(sql`${customers.createdAt} DESC`);

    // Get stats
    const [totalActive] = await db.select({ count: count() }).from(customers).where(eq(customers.status, 'active'));
    const [totalPending] = await db.select({ count: count() }).from(customers).where(eq(customers.status, 'pending_verification'));
    const [residential] = await db.select({ count: count() }).from(customers).where(and(eq(customers.type, 'residential'), eq(customers.isActive, true)));
    const [corporate] = await db.select({ count: count() }).from(customers).where(and(eq(customers.type, 'corporate'), eq(customers.isActive, true)));
    
    const [jarsCirculation] = await db
      .select({ total: sum(customers.jarsInCirculation) })
      .from(customers)
      .where(eq(customers.isActive, true));

    const [depositEscrow] = await db
      .select({ total: sum(customers.depositHeld) })
      .from(customers)
      .where(eq(customers.isActive, true));

    res.json({
      data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalResult?.count || 0,
      },
      stats: {
        totalActive: totalActive?.count || 0,
        totalPending: totalPending?.count || 0,
        residential: residential?.count || 0,
        corporate: corporate?.count || 0,
        jarsInCirculation: Number(jarsCirculation?.total) || 0,
        depositEscrow: Number(depositEscrow?.total) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer
customersRouter.post('/', authorize('admin', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = customerCreateSchema.parse(req.body);
    
    // Generate customer code
    const [lastCustomer] = await db
      .select({ customerCode: customers.customerCode })
      .from(customers)
      .orderBy(sql`${customers.id} DESC`)
      .limit(1);
    
    const lastNum = lastCustomer ? parseInt(lastCustomer.customerCode.replace('PW-C', '')) : 0;
    const customerCode = `PW-C${String(lastNum + 1).padStart(4, '0')}`;

    const result = await db.insert(customers).values({
      customerCode,
      ...body,
    });

    res.status(201).json({ id: result[0].insertId, customerCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get customer by ID
customersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, parseInt(req.params.id)))
      .limit(1);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update customer
customersRouter.put('/:id', authorize('admin', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    await db.update(customers).set(req.body).where(eq(customers.id, parseInt(req.params.id)));
    res.json({ message: 'Customer updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Export CSV
customersRouter.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const data = await db.select().from(customers).where(eq(customers.isActive, true));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    data.forEach(row => {
      csvStream.write({
        Code: row.customerCode,
        Name: row.fullName,
        Phone: row.phone,
        Type: row.type,
        Zone: row.zoneId,
        Status: row.status,
        'Jars in Circulation': row.jarsInCirculation,
        'Deposit Held (PKR)': row.depositHeld,
        'Refill Cycle': row.refillCycle,
      });
    });

    csvStream.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to export' });
  }
});
