"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const fast_csv_1 = require("fast-csv");
exports.customersRouter = (0, express_1.Router)();
exports.customersRouter.use(auth_1.authenticate);
// Initial in-memory cache/fallback for Karachi customers
let inMemoryCustomers = [
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
const customerCreateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    email: zod_1.z.string().email().optional(),
    type: zod_1.z.enum(['residential', 'corporate']),
    zoneId: zod_1.z.number().optional(),
    jarQuota: zod_1.z.number().min(1).default(2),
    refillCycle: zod_1.z.enum(['weekly', 'twice_weekly', 'on_call']).default('weekly'),
    address: zod_1.z.string().optional(),
    landmark: zod_1.z.string().optional(),
    deliveryNote: zod_1.z.string().optional(),
});
// List customers with filters
exports.customersRouter.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '20', type, status, zoneId, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let conditions = [(0, drizzle_orm_1.eq)(schema_1.customers.isActive, true)];
        if (type && type !== 'all')
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.type, type));
        if (status && status !== 'all')
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.status, status));
        if (zoneId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.zoneId, parseInt(zoneId)));
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.customers.fullName, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.customers.phone, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.customers.customerCode, `%${search}%`)));
        }
        const [totalResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)(...conditions));
        const data = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(parseInt(limit))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.customers.createdAt} DESC`);
        // Get stats
        const [totalActive] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.status, 'active'));
        const [totalPending] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.status, 'pending_verification'));
        const [residential] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.customers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.type, 'residential'), (0, drizzle_orm_1.eq)(schema_1.customers.isActive, true)));
        const [corporate] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.customers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.type, 'corporate'), (0, drizzle_orm_1.eq)(schema_1.customers.isActive, true)));
        const [jarsCirculation] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sum)(schema_1.customers.jarsInCirculation) })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, true));
        const [depositEscrow] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sum)(schema_1.customers.depositHeld) })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, true));
        res.json({
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
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
    }
    catch (error) {
        // If database is not connected or tables not created, serve inMemoryCustomers gracefully
        const active = inMemoryCustomers.filter(c => c.isActive);
        let filtered = active;
        const { type, search } = req.query;
        if (type && type !== 'all') {
            filtered = filtered.filter(c => c.type === type);
        }
        if (search) {
            const q = String(search).toLowerCase();
            filtered = filtered.filter(c => c.fullName.toLowerCase().includes(q) ||
                c.customerCode.toLowerCase().includes(q) ||
                c.phone.toLowerCase().includes(q));
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
exports.customersRouter.post('/', (0, auth_1.authorize)('admin', 'dispatcher'), async (req, res) => {
    try {
        const body = customerCreateSchema.parse(req.body);
        let customerCode = `PW-C0${Math.floor(100 + Math.random() * 900)}`;
        let insertId = Date.now();
        try {
            // Generate customer code from DB
            const [lastCustomer] = await db_1.db
                .select({ customerCode: schema_1.customers.customerCode })
                .from(schema_1.customers)
                .orderBy((0, drizzle_orm_1.sql) `${schema_1.customers.id} DESC`)
                .limit(1);
            const lastNum = lastCustomer ? parseInt(lastCustomer.customerCode.replace('PW-C', '')) : 0;
            customerCode = `PW-C${String(lastNum + 1).padStart(4, '0')}`;
            const result = await db_1.db.insert(schema_1.customers).values({
                customerCode,
                ...body,
            });
            insertId = result[0].insertId;
        }
        catch (dbErr) {
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create customer' });
    }
});
// Delete customer (Soft delete by default, ensures foreign-key safety)
exports.customersRouter.delete('/:id', (0, auth_1.authorize)('admin', 'dispatcher'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid customer ID' });
        }
        try {
            await db_1.db
                .update(schema_1.customers)
                .set({ isActive: false, status: 'inactive' })
                .where((0, drizzle_orm_1.eq)(schema_1.customers.id, id));
        }
        catch (dbErr) {
            console.warn('DB soft-delete fallback to in-memory:', dbErr);
        }
        // Remove or deactivate in in-memory storage
        inMemoryCustomers = inMemoryCustomers.filter(c => c.id !== id);
        res.json({ message: 'Customer removed successfully', id });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove customer' });
    }
});
// Get customer by ID
exports.customersRouter.get('/:id', async (req, res) => {
    try {
        const [customer] = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.id, parseInt(req.params.id)))
            .limit(1);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});
// Update customer
exports.customersRouter.put('/:id', (0, auth_1.authorize)('admin', 'dispatcher'), async (req, res) => {
    try {
        await db_1.db.update(schema_1.customers).set(req.body).where((0, drizzle_orm_1.eq)(schema_1.customers.id, parseInt(req.params.id)));
        res.json({ message: 'Customer updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
});
// Export CSV
exports.customersRouter.get('/export/csv', async (req, res) => {
    try {
        const data = await db_1.db.select().from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, true));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
        const csvStream = (0, fast_csv_1.format)({ headers: true });
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export' });
    }
});
//# sourceMappingURL=customers.js.map