"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const fast_csv_1 = require("fast-csv");
exports.inventoryRouter = (0, express_1.Router)();
exports.inventoryRouter.use(auth_1.authenticate);
const itemCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    sku: zod_1.z.string().min(2),
    category: zod_1.z.enum(['bottled_water', 'dispensers_coolers', 'caps_seals_accessories', 'accessories']),
    description: zod_1.z.string().optional(),
    inPlantQty: zod_1.z.number().min(0).default(0),
    withClientsQty: zod_1.z.number().min(0).default(0),
    unitCost: zod_1.z.number().min(0).default(0),
    salePrice: zod_1.z.number().min(0).default(0),
    refundableDeposit: zod_1.z.number().min(0).default(0),
    batchLot: zod_1.z.string().optional(),
    bay: zod_1.z.string().optional(),
    minThreshold: zod_1.z.number().min(0).default(10),
});
// List inventory items
exports.inventoryRouter.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '10', category, search, stockStatus } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let conditions = [(0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true)];
        if (category && category !== 'all')
            conditions.push((0, drizzle_orm_1.eq)(schema_1.inventoryItems.category, category));
        if (stockStatus && stockStatus !== 'all')
            conditions.push((0, drizzle_orm_1.eq)(schema_1.inventoryItems.stockStatus, stockStatus));
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.inventoryItems.name, `%${search}%`));
        }
        const [totalResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.and)(...conditions));
        const data = await db_1.db
            .select()
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(parseInt(limit))
            .offset(offset);
        // Stats
        const [totalValuation] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sql) `SUM(${schema_1.inventoryItems.inPlantQty} * ${schema_1.inventoryItems.unitCost})` })
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true));
        const [filledReady] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sum)(schema_1.inventoryItems.inPlantQty) })
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true), (0, drizzle_orm_1.eq)(schema_1.inventoryItems.category, 'bottled_water')));
        const [circulation] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sql) `SUM(${schema_1.inventoryItems.inPlantQty} + ${schema_1.inventoryItems.withClientsQty})` })
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true));
        const [lowStock] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true), (0, drizzle_orm_1.sql) `${schema_1.inventoryItems.inPlantQty} < ${schema_1.inventoryItems.minThreshold}`));
        res.json({
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalResult?.count || 0,
            },
            stats: {
                totalValuation: Number(totalValuation?.total) || 0,
                filledReady: Number(filledReady?.total) || 0,
                totalCirculation: Number(circulation?.total) || 0,
                lowStockCount: lowStock?.count || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
// Create item
exports.inventoryRouter.post('/', (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const body = itemCreateSchema.parse(req.body);
        const result = await db_1.db.insert(schema_1.inventoryItems).values(body);
        res.status(201).json({ id: result[0].insertId });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create item' });
    }
});
// Update item
exports.inventoryRouter.put('/:id', (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        await db_1.db.update(schema_1.inventoryItems).set(req.body).where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, parseInt(req.params.id)));
        res.json({ message: 'Item updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});
// Delete item
exports.inventoryRouter.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inventory item ID' });
        }
        try {
            await db_1.db
                .update(schema_1.inventoryItems)
                .set({ isActive: false })
                .where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.id, id));
        }
        catch (dbErr) {
            console.warn('DB delete inventory item fallback:', dbErr);
        }
        res.json({ message: 'Inventory item deleted successfully', id });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
});
// Stock movements
exports.inventoryRouter.get('/movements', async (req, res) => {
    try {
        const { page = '1', limit = '20', itemId } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let conditions = [];
        if (itemId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.stockMovements.itemId, parseInt(itemId)));
        const data = await db_1.db
            .select()
            .from(schema_1.stockMovements)
            .where(conditions.length ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .limit(parseInt(limit))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.stockMovements.createdAt} DESC`);
        res.json({ data });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch movements' });
    }
});
// Export CSV
exports.inventoryRouter.get('/export/csv', async (req, res) => {
    try {
        const data = await db_1.db.select().from(schema_1.inventoryItems).where((0, drizzle_orm_1.eq)(schema_1.inventoryItems.isActive, true));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
        const csvStream = (0, fast_csv_1.format)({ headers: true });
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export' });
    }
});
//# sourceMappingURL=inventory.js.map