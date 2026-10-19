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
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});
// Create customer
exports.customersRouter.post('/', (0, auth_1.authorize)('admin', 'dispatcher'), async (req, res) => {
    try {
        const body = customerCreateSchema.parse(req.body);
        // Generate customer code
        const [lastCustomer] = await db_1.db
            .select({ customerCode: schema_1.customers.customerCode })
            .from(schema_1.customers)
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.customers.id} DESC`)
            .limit(1);
        const lastNum = lastCustomer ? parseInt(lastCustomer.customerCode.replace('PW-C', '')) : 0;
        const customerCode = `PW-C${String(lastNum + 1).padStart(4, '0')}`;
        const result = await db_1.db.insert(schema_1.customers).values({
            customerCode,
            ...body,
        });
        res.status(201).json({ id: result[0].insertId, customerCode });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create customer' });
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