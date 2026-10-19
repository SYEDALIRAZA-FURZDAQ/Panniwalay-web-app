"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const fast_csv_1 = require("fast-csv");
exports.accountsRouter = (0, express_1.Router)();
// P&L Statement
exports.accountsRouter.get('/pnl', auth_1.authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Fetch payments (cash revenue)
        const allPayments = await db_1.db.select().from(schema_1.payments);
        const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);
        // Revenue breakdown simulation / grouping
        const waterRefillRevenue = Math.round(totalRevenue * 0.72);
        const dispenserSalesRevenue = Math.round(totalRevenue * 0.18);
        const accessoryRevenue = totalRevenue - waterRefillRevenue - dispenserSalesRevenue;
        // Fetch expense vouchers
        const allVouchers = await db_1.db
            .select({
            id: schema_1.expenseVouchers.id,
            amount: schema_1.expenseVouchers.amount,
            category: schema_1.expenseHeads.category,
            headName: schema_1.expenseHeads.name,
        })
            .from(schema_1.expenseVouchers)
            .leftJoin(schema_1.expenseHeads, (0, drizzle_orm_1.eq)(schema_1.expenseVouchers.expenseHeadId, schema_1.expenseHeads.id))
            .where((0, drizzle_orm_1.eq)(schema_1.expenseVouchers.status, 'approved'));
        const cogs = allVouchers
            .filter(v => v.category === 'cogs')
            .reduce((acc, v) => acc + v.amount, 0);
        const opex = allVouchers
            .filter(v => v.category === 'opex')
            .reduce((acc, v) => acc + v.amount, 0);
        const capex = allVouchers
            .filter(v => v.category === 'capex')
            .reduce((acc, v) => acc + v.amount, 0);
        const grossProfit = totalRevenue - cogs;
        const grossMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
        const ebitda = grossProfit - opex;
        const netProfit = ebitda - Math.round(capex * 0.1); // approx depreciation
        const netMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
        res.json({
            revenue: {
                total: totalRevenue,
                waterRefills: waterRefillRevenue,
                dispensers: dispenserSalesRevenue,
                accessories: accessoryRevenue,
            },
            cogs: {
                total: cogs,
            },
            grossProfit,
            grossMarginPercent,
            opex: {
                total: opex,
            },
            ebitda,
            netProfit,
            netMarginPercent,
            period: {
                startDate: startDate || '2026-01-01',
                endDate: endDate || new Date().toISOString().split('T')[0],
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Expense Heads list
exports.accountsRouter.get('/expense-heads', auth_1.authenticate, async (req, res) => {
    try {
        const heads = await db_1.db.select().from(schema_1.expenseHeads).where((0, drizzle_orm_1.eq)(schema_1.expenseHeads.isActive, true));
        res.json(heads);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create Expense Head
exports.accountsRouter.post('/expense-heads', auth_1.authenticate, (0, auth_1.authorize)('admin', 'accountant'), async (req, res) => {
    try {
        const { name, category, description } = req.body;
        await db_1.db.insert(schema_1.expenseHeads).values({
            name,
            category: category,
            description,
        });
        res.status(201).json({ message: 'Expense head created' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Expense Vouchers list
exports.accountsRouter.get('/vouchers', auth_1.authenticate, async (req, res) => {
    try {
        const { category, status, page = '1', limit = '50' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [];
        if (status && status !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.expenseVouchers.status, status));
        }
        const data = await db_1.db
            .select({
            id: schema_1.expenseVouchers.id,
            voucherNumber: schema_1.expenseVouchers.voucherNumber,
            expenseHeadId: schema_1.expenseVouchers.expenseHeadId,
            headName: schema_1.expenseHeads.name,
            category: schema_1.expenseHeads.category,
            amount: schema_1.expenseVouchers.amount,
            paymentAccount: schema_1.expenseVouchers.paymentAccount,
            expenseDate: schema_1.expenseVouchers.expenseDate,
            vendor: schema_1.expenseVouchers.vendor,
            taxNote: schema_1.expenseVouchers.taxNote,
            notes: schema_1.expenseVouchers.notes,
            status: schema_1.expenseVouchers.status,
            createdAt: schema_1.expenseVouchers.createdAt,
        })
            .from(schema_1.expenseVouchers)
            .leftJoin(schema_1.expenseHeads, (0, drizzle_orm_1.eq)(schema_1.expenseVouchers.expenseHeadId, schema_1.expenseHeads.id))
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.expenseVouchers.id))
            .limit(parseInt(limit))
            .offset(offset);
        res.json({ data, page: parseInt(page), limit: parseInt(limit) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const createVoucherSchema = zod_1.z.object({
    expenseHeadId: zod_1.z.number(),
    amount: zod_1.z.number().min(1),
    paymentAccount: zod_1.z.string().optional().nullable(),
    expenseDate: zod_1.z.string(),
    vendor: zod_1.z.string().optional().nullable(),
    taxNote: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
// Record Expense Voucher
exports.accountsRouter.post('/vouchers', auth_1.authenticate, (0, auth_1.authorize)('admin', 'accountant', 'manager'), async (req, res) => {
    try {
        const body = createVoucherSchema.parse(req.body);
        const voucherNumber = `EV-${Date.now().toString().slice(-6)}`;
        await db_1.db.insert(schema_1.expenseVouchers).values({
            ...body,
            voucherNumber,
            createdById: req.user.id,
            status: 'approved', // Auto-approved when entered by authorized staff
            approvedById: req.user.id,
        });
        res.status(201).json({ message: 'Expense voucher recorded', voucherNumber });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Export Vouchers CSV
exports.accountsRouter.get('/export/vouchers/csv', auth_1.authenticate, async (req, res) => {
    try {
        const data = await db_1.db
            .select({
            'Voucher #': schema_1.expenseVouchers.voucherNumber,
            'Head': schema_1.expenseHeads.name,
            'Category': schema_1.expenseHeads.category,
            'Amount (PKR)': schema_1.expenseVouchers.amount,
            'Vendor': schema_1.expenseVouchers.vendor,
            'Date': schema_1.expenseVouchers.expenseDate,
            'Payment Account': schema_1.expenseVouchers.paymentAccount,
            'Status': schema_1.expenseVouchers.status,
        })
            .from(schema_1.expenseVouchers)
            .leftJoin(schema_1.expenseHeads, (0, drizzle_orm_1.eq)(schema_1.expenseVouchers.expenseHeadId, schema_1.expenseHeads.id));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="expense_vouchers.csv"');
        const csvStream = (0, fast_csv_1.format)({ headers: true });
        csvStream.pipe(res);
        data.forEach((row) => csvStream.write(row));
        csvStream.end();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=accounts.js.map