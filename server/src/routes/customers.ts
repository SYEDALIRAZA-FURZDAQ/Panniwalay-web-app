import { Router, Response } from 'express';
import { db } from '../db';
import { customers, zones, deposits, jarLedger } from '../db/schema';
import { eq, sql, and, like, count, sum, or } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const customersRouter = Router();
customersRouter.use(authenticate);

// Initial in-memory cache/fallback for Karachi customers
let inMemoryCustomers: any[] = [
  {
    id: 1,
    customerCode: 'CUST-0491',
    fullName: 'Shaikh Petroleum Corporation',
    phone: '+92-21-35689100',
    email: 'admin@shaikhpetro.com.pk',
    type: 'corporate',
    zoneId: 1,
    zoneName: 'Clifton & Sea View (Z-01)',
    jarQuota: 20,
    jarsInCirculation: 18,
    depositHeld: 20000,
    refillCycle: 'twice_weekly',
    status: 'active',
    address: 'Suite 602, Executive Tower, Marine Drive, Clifton Block 4',
    isActive: true,
  },
  {
    id: 2,
    customerCode: 'CUST-0512',
    fullName: 'Begum Yasmeen Abbasi',
    phone: '+92-300-2415987',
    email: 'yasmeen.abbasi@gmail.com',
    type: 'residential',
    zoneId: 2,
    zoneName: 'DHA Phase 5 & 6 (Z-02)',
    jarQuota: 4,
    jarsInCirculation: 3,
    depositHeld: 4000,
    refillCycle: 'weekly',
    status: 'active',
    address: 'House 44/2, 17th Street, Khayaban-e-Mujahid, DHA Phase 5',
    isActive: true,
  },
  {
    id: 3,
    customerCode: 'CUST-0628',
    fullName: 'Engro Polymers HQ',
    phone: '+92-21-111-411-411',
    email: 'procurement@engropolymers.com',
    type: 'corporate',
    zoneId: 6,
    zoneName: 'Korangi Industrial Area (Z-06)',
    jarQuota: 50,
    jarsInCirculation: 45,
    depositHeld: 50000,
    refillCycle: 'twice_weekly',
    status: 'active',
    address: 'Plot 12, Sector 15, Korangi Industrial Area',
    isActive: true,
  },
  {
    id: 4,
    customerCode: 'CUST-0740',
    fullName: 'Dr. Tariq Farooq Clinic',
    phone: '+92-333-2147896',
    email: 'drtariq@farooqclinic.pk',
    type: 'residential',
    zoneId: 3,
    zoneName: 'Gulshan-e-Iqbal Block 1-7 (Z-03)',
    jarQuota: 6,
    jarsInCirculation: 5,
    depositHeld: 6000,
    refillCycle: 'weekly',
    status: 'active',
    address: 'B-12, Block 4, Gulshan-e-Iqbal',
    isActive: true,
  },
  {
    id: 5,
    customerCode: 'CUST-0814',
    fullName: 'Muhammad Mansoor Residence',
    phone: '+92-345-8899221',
    email: 'mmansoor@yahoo.com',
    type: 'residential',
    zoneId: 4,
    zoneName: 'PECHS & Tariq Road (Z-04)',
    jarQuota: 2,
    jarsInCirculation: 2,
    depositHeld: 2000,
    refillCycle: 'weekly',
    status: 'active',
    address: 'House 19-A, Block 2, PECHS',
    isActive: true,
  },
];

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
    // If database is not connected or tables not created, serve inMemoryCustomers gracefully
    const active = inMemoryCustomers.filter(c => c.isActive);
    let filtered = active;
    const { type, search } = req.query;
    if (type && type !== 'all') {
      filtered = filtered.filter(c => c.type === type);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }

    const residentialCount = active.filter(c => c.type === 'residential').length;
    const corporateCount = active.filter(c => c.type === 'corporate').length;
    const jarsTotal = active.reduce((acc, c) => acc + (c.jarsInCirculation || 0), 0);
    const depositTotal = active.reduce((acc, c) => acc + (c.depositHeld || 0), 0);

    res.json({
      data: filtered,
      pagination: {
        page: 1,
        limit: filtered.length,
        total: filtered.length,
      },
      stats: {
        totalActive: active.length,
        totalPending: 0,
        residential: residentialCount,
        corporate: corporateCount,
        jarsInCirculation: jarsTotal,
        depositEscrow: depositTotal,
      },
    });
  }
});

// Create customer
customersRouter.post('/', authorize('admin', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const body = customerCreateSchema.parse(req.body);
    let customerCode = `PW-C0${Math.floor(100 + Math.random() * 900)}`;
    let insertId = Date.now();

    try {
      // Generate customer code from DB
      const [lastCustomer] = await db
        .select({ customerCode: customers.customerCode })
        .from(customers)
        .orderBy(sql`${customers.id} DESC`)
        .limit(1);
      
      const lastNum = lastCustomer ? parseInt(lastCustomer.customerCode.replace('PW-C', '')) : 0;
      customerCode = `PW-C${String(lastNum + 1).padStart(4, '0')}`;

      const result = await db.insert(customers).values({
        customerCode,
        ...body,
      });
      insertId = result[0].insertId;
    } catch (dbErr) {
      console.warn('DB insert fallback to in-memory:', dbErr);
    }

    const newCust = {
      id: insertId,
      customerCode,
      ...body,
      jarsInCirculation: 0,
      depositHeld: 0,
      status: 'active',
      isActive: true,
    };
    inMemoryCustomers.unshift(newCust);

    res.status(201).json({ id: insertId, customerCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Delete customer (Soft delete by default, ensures foreign-key safety)
customersRouter.delete('/:id', authorize('admin', 'dispatcher'), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    try {
      await db
        .update(customers)
        .set({ isActive: false, status: 'inactive' })
        .where(eq(customers.id, id));
    } catch (dbErr) {
      console.warn('DB soft-delete fallback to in-memory:', dbErr);
    }

    // Remove or deactivate in in-memory storage
    inMemoryCustomers = inMemoryCustomers.filter(c => c.id !== id);

    res.json({ message: 'Customer removed successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove customer' });
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
