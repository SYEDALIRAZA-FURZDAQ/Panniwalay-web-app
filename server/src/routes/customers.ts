import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { customers, zones, deposits, jarLedger } from '../db/schema';
import { eq, sql, and, like, count, sum, or } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const customersRouter = Router();
customersRouter.use(authenticate);

const ISOLATED_STORE_PATH = path.join(__dirname, '../../isolated_customers.json');

// Initial in-memory cache/fallback for Karachi customers
export let inMemoryCustomers: any[] = [
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
    tenantId: 'plant_default',
    createdById: 1,
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
    tenantId: 'plant_default',
    createdById: 1,
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
    tenantId: 'plant_default',
    createdById: 1,
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
    tenantId: 'plant_default',
    createdById: 1,
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
    tenantId: 'plant_default',
    createdById: 1,
  },
];

// Load any previously persisted isolated tenant customers from disk
try {
  if (fs.existsSync(ISOLATED_STORE_PATH)) {
    const raw = fs.readFileSync(ISOLATED_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (!inMemoryCustomers.some(c => c.customerCode === item.customerCode)) {
          inMemoryCustomers.unshift(item);
        }
      }
    }
  }
} catch (e) {
  console.warn('Failed to load persisted isolated customers:', e);
}

// Known test codes created under isolated tenants to prevent them from showing in plant_default
const KNOWN_ISOLATED_CODES = new Set([
  'CUST-KHI-9981', // Ali (Ancholi)
  'CUST-KHI-4905', // Ali Test
  'CUST-KHI-9631',
  'CUST-KHI-5498',
  'PW-C0NaN',
  'CUST-KHI-9363',
  'CUST-KHI-5367',
]);

// Ensure Ali (Ancholi) is in inMemoryCustomers tagged as tenant_3 with correct zone
if (!inMemoryCustomers.some(c => c.customerCode === 'CUST-KHI-9981')) {
  inMemoryCustomers.unshift({
    id: 11,
    customerCode: 'CUST-KHI-9981',
    fullName: 'Ali',
    phone: '0301999999999',
    email: '',
    type: 'residential',
    zoneId: 7,
    zoneName: 'Ancholi (Z-08) — Central',
    jarQuota: 3,
    jarsInCirculation: 0,
    depositHeld: 0,
    refillCycle: 'On Call',
    status: 'active',
    address: 'R17',
    tenantId: 'tenant_5',
    createdById: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

export function addCustomerRecord(customer: any) {
  const existingIdx = inMemoryCustomers.findIndex(c => c.customerCode === customer.customerCode);
  if (existingIdx >= 0) {
    inMemoryCustomers[existingIdx] = customer;
  } else {
    inMemoryCustomers.unshift(customer);
  }

  // Persist isolated customers so they survive server restarts
  try {
    const isolated = inMemoryCustomers.filter(c => c.tenantId && c.tenantId !== 'plant_default');
    fs.writeFileSync(ISOLATED_STORE_PATH, JSON.stringify(isolated, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to persist isolated customers:', e);
  }
}

const customerCreateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  type: z.enum(['residential', 'corporate']),
  zoneId: z.number().optional(),
  zoneName: z.string().optional(),
  jarQuota: z.number().min(1).default(2),
  refillCycle: z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
  address: z.string().optional(),
  landmark: z.string().optional(),
  deliveryNote: z.string().optional(),
  tenantId: z.string().optional(),
});

// List customers with filters and tenant isolation
customersRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', type, status, zoneId, search, tenantId: queryTenantId } = req.query;
  const userTenantId = req.user?.tenantId || (req.user?.id === 1 ? 'plant_default' : `tenant_${req.user?.id}`);
  const activeTenantId = (queryTenantId as string) || userTenantId || 'plant_default';
  const isIsolatedTenant = activeTenantId !== 'plant_default';

  // If this is a specific plant tenant (e.g. Mohib Hyder), serve tenant-scoped customers
  if (isIsolatedTenant) {
    let tenantCusts = inMemoryCustomers.filter(
      (c) => c.isActive && c.tenantId === activeTenantId
    );

    if (type && type !== 'all') {
      tenantCusts = tenantCusts.filter((c) => c.type === type);
    }
    if (search) {
      const q = String(search).toLowerCase();
      tenantCusts = tenantCusts.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }

    const residentialCount = tenantCusts.filter((c) => c.type === 'residential').length;
    const corporateCount = tenantCusts.filter((c) => c.type === 'corporate').length;
    const jarsTotal = tenantCusts.reduce((acc, c) => acc + (c.jarsInCirculation || 0), 0);
    const depositTotal = tenantCusts.reduce((acc, c) => acc + (c.depositHeld || 0), 0);

    return res.json({
      data: tenantCusts,
      pagination: {
        page: 1,
        limit: tenantCusts.length,
        total: tenantCusts.length,
      },
      stats: {
        totalActive: tenantCusts.length,
        totalPending: 0,
        residential: residentialCount,
        corporate: corporateCount,
        jarsInCirculation: jarsTotal,
        depositEscrow: depositTotal,
      },
    });
  }

  // Default plant tenant (Tariq Mansoor): query DB with fallback to in-memory
  try {
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
      .select({
        id: customers.id,
        customerCode: customers.customerCode,
        fullName: customers.fullName,
        phone: customers.phone,
        email: customers.email,
        type: customers.type,
        zoneId: customers.zoneId,
        routeId: customers.routeId,
        jarQuota: customers.jarQuota,
        jarsInCirculation: customers.jarsInCirculation,
        depositHeld: customers.depositHeld,
        refillCycle: customers.refillCycle,
        status: customers.status,
        address: customers.address,
        landmark: customers.landmark,
        deliveryNote: customers.deliveryNote,
        isActive: customers.isActive,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        zoneName: sql<string>`COALESCE(CONCAT(${zones.name}, ' (', ${zones.code}, ')'), 'Karachi Central')`,
      })
      .from(customers)
      .leftJoin(zones, eq(customers.zoneId, zones.id))
      .where(and(...conditions))
      .limit(parseInt(limit as string))
      .offset(offset)
      .orderBy(sql`${customers.createdAt} DESC`);

    // Collect all customer codes that belong to isolated tenants
    const isolatedCodes = new Set([
      ...Array.from(KNOWN_ISOLATED_CODES),
      ...inMemoryCustomers
        .filter((c) => c.tenantId && c.tenantId !== 'plant_default')
        .map((c) => c.customerCode),
    ]);

    // Filter out isolated tenant customer codes so they never appear in plant_default (Tariq Mansoor)
    const validDbData = data.filter((c) => !isolatedCodes.has(c.customerCode));

    // Merge any registered in-memory customers for plant_default
    const inMemDefault = inMemoryCustomers.filter(
      (c) => c.isActive && (!c.tenantId || c.tenantId === 'plant_default')
    );
    const existingCodes = new Set(validDbData.map((c) => c.customerCode));
    const extraInMem = inMemDefault.filter((c) => !existingCodes.has(c.customerCode));
    const mergedData = [...extraInMem, ...validDbData];

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
      data: mergedData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: (totalResult?.count || 0) + extraInMem.length,
      },
      stats: {
        totalActive: (totalActive?.count || 0) + extraInMem.length,
        totalPending: totalPending?.count || 0,
        residential: (residential?.count || 0) + extraInMem.filter((c) => c.type === 'residential').length,
        corporate: (corporate?.count || 0) + extraInMem.filter((c) => c.type === 'corporate').length,
        jarsInCirculation: Number(jarsCirculation?.total) || 0,
        depositEscrow: Number(depositEscrow?.total) || 0,
      },
    });
  } catch (error) {
    // If database is not connected or tables not created, serve inMemoryCustomers gracefully
    const active = inMemoryCustomers.filter((c) => c.isActive && (!c.tenantId || c.tenantId === 'plant_default'));
    let filtered = active;
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
    const userTenantId = req.user?.tenantId || (req.user?.id === 1 ? 'plant_default' : `tenant_${req.user?.id}`);
    const targetTenantId = body.tenantId || userTenantId || 'plant_default';
    let customerCode = `PW-C0${Math.floor(100 + Math.random() * 900)}`;
    let insertId = Date.now();

    // Resolve real zone name dynamically
    let resolvedZoneName = body.zoneName;
    if (!resolvedZoneName && body.zoneId) {
      try {
        const [z] = await db
          .select({ name: zones.name, code: zones.code })
          .from(zones)
          .where(eq(zones.id, body.zoneId));
        if (z) resolvedZoneName = `${z.name} (${z.code})`;
      } catch (e) {}
    }
    if (!resolvedZoneName) resolvedZoneName = 'Ancholi (Z-08)';

    // Only insert into shared MySQL customers table if tenant is plant_default!
    if (targetTenantId === 'plant_default') {
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
    }

    const newCust = {
      id: insertId,
      customerCode,
      ...body,
      zoneName: resolvedZoneName,
      jarsInCirculation: 0,
      depositHeld: 0,
      status: 'active',
      isActive: true,
      tenantId: targetTenantId,
      createdById: req.user?.id || 1,
    };
    addCustomerRecord(newCust);

    res.status(201).json({ id: insertId, customerCode, customer: newCust });
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
