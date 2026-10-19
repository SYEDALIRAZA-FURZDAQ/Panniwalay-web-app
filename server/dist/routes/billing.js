"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const fast_csv_1 = require("fast-csv");
exports.billingRouter = (0, express_1.Router)();
// Billing Stats
exports.billingRouter.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const allInvoices = await db_1.db.select().from(schema_1.invoices);
        const allDeposits = await db_1.db.select().from(schema_1.deposits);
        const totalInvoiced = allInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        const totalPaid = allInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
        const outstanding = totalInvoiced - totalPaid;
        const overdue = allInvoices.filter(inv => inv.status === 'overdue').reduce((acc, inv) => acc + (inv.totalAmount - (inv.paidAmount || 0)), 0);
        const totalEscrowHeld = allDeposits.reduce((acc, dep) => {
            return dep.type === 'collect' ? acc + dep.amount : acc - dep.amount;
        }, 0);
        res.json({
            totalInvoiced,
            totalPaid,
            outstanding,
            overdue,
            totalEscrowHeld,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// List Invoices
exports.billingRouter.get('/invoices', auth_1.authenticate, async (req, res) => {
    try {
        const { status, customerId, page = '1', limit = '50' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [];
        if (status && status !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.invoices.status, status));
        }
        if (customerId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.invoices.customerId, parseInt(customerId)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const data = await db_1.db
            .select({
            id: schema_1.invoices.id,
            invoiceNumber: schema_1.invoices.invoiceNumber,
            customerId: schema_1.invoices.customerId,
            totalAmount: schema_1.invoices.totalAmount,
            paidAmount: schema_1.invoices.paidAmount,
            status: schema_1.invoices.status,
            dueDate: schema_1.invoices.dueDate,
            notes: schema_1.invoices.notes,
            createdAt: schema_1.invoices.createdAt,
            customerName: schema_1.customers.fullName,
            customerCode: schema_1.customers.customerCode,
            phone: schema_1.customers.phone,
        })
            .from(schema_1.invoices)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.invoices.customerId, schema_1.customers.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.invoices.id))
            .limit(parseInt(limit))
            .offset(offset);
        res.json({ data, page: parseInt(page), limit: parseInt(limit) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Single Invoice with payments
exports.billingRouter.get('/invoices/:id', auth_1.authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [invoice] = await db_1.db
            .select({
            id: schema_1.invoices.id,
            invoiceNumber: schema_1.invoices.invoiceNumber,
            customerId: schema_1.invoices.customerId,
            totalAmount: schema_1.invoices.totalAmount,
            paidAmount: schema_1.invoices.paidAmount,
            status: schema_1.invoices.status,
            dueDate: schema_1.invoices.dueDate,
            notes: schema_1.invoices.notes,
            createdAt: schema_1.invoices.createdAt,
            customerName: schema_1.customers.fullName,
            customerCode: schema_1.customers.customerCode,
            address: schema_1.customers.address,
            phone: schema_1.customers.phone,
        })
            .from(schema_1.invoices)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.invoices.customerId, schema_1.customers.id))
            .where((0, drizzle_orm_1.eq)(schema_1.invoices.id, id));
        if (!invoice)
            return res.status(404).json({ error: 'Invoice not found' });
        const invoicePayments = await db_1.db
            .select()
            .from(schema_1.payments)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.invoiceId, id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.payments.paymentDate));
        res.json({ invoice, payments: invoicePayments });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record Payment
exports.billingRouter.post('/payments', auth_1.authenticate, async (req, res) => {
    try {
        const { invoiceId, customerId, amount, method, referenceNo, notes } = req.body;
        const parsedAmount = parseInt(amount);
        await db_1.db.insert(schema_1.payments).values({
            invoiceId: invoiceId ? parseInt(invoiceId) : null,
            customerId: parseInt(customerId),
            amount: parsedAmount,
            method: method || 'cash',
            referenceNo,
            receivedById: req.user.id,
            notes,
            paymentDate: new Date().toISOString().split('T')[0],
        });
        if (invoiceId) {
            const [invoice] = await db_1.db.select().from(schema_1.invoices).where((0, drizzle_orm_1.eq)(schema_1.invoices.id, parseInt(invoiceId)));
            if (invoice) {
                const newPaid = (invoice.paidAmount || 0) + parsedAmount;
                const newStatus = newPaid >= invoice.totalAmount ? 'paid' : 'partial';
                await db_1.db.update(schema_1.invoices).set({ paidAmount: newPaid, status: newStatus }).where((0, drizzle_orm_1.eq)(schema_1.invoices.id, parseInt(invoiceId)));
            }
        }
        res.json({ message: 'Payment recorded successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Deposits List
exports.billingRouter.get('/deposits', auth_1.authenticate, async (req, res) => {
    try {
        const { customerId, type } = req.query;
        const conditions = [];
        if (customerId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.deposits.customerId, parseInt(customerId)));
        }
        if (type && type !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.deposits.type, type));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const data = await db_1.db
            .select({
            id: schema_1.deposits.id,
            customerId: schema_1.deposits.customerId,
            customerName: schema_1.customers.fullName,
            customerCode: schema_1.customers.customerCode,
            amount: schema_1.deposits.amount,
            type: schema_1.deposits.type,
            method: schema_1.deposits.method,
            referenceNo: schema_1.deposits.referenceNo,
            notes: schema_1.deposits.notes,
            createdAt: schema_1.deposits.createdAt,
        })
            .from(schema_1.deposits)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.deposits.customerId, schema_1.customers.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.deposits.id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Record Deposit Collect / Refund
exports.billingRouter.post('/deposits', auth_1.authenticate, async (req, res) => {
    try {
        const { customerId, amount, type, method, referenceNo, notes } = req.body;
        const parsedAmount = parseInt(amount);
        const parsedCustId = parseInt(customerId);
        await db_1.db.insert(schema_1.deposits).values({
            customerId: parsedCustId,
            amount: parsedAmount,
            type: type,
            method: method || 'cash',
            referenceNo,
            notes,
        });
        // Update customer deposit held
        const adjustment = type === 'collect' ? parsedAmount : -parsedAmount;
        await db_1.db
            .update(schema_1.customers)
            .set({
            depositHeld: (0, drizzle_orm_1.sql) `${schema_1.customers.depositHeld} + ${adjustment}`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.customers.id, parsedCustId));
        res.json({ message: `Deposit ${type} recorded successfully` });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Export Invoices CSV
exports.billingRouter.get('/export/invoices/csv', auth_1.authenticate, async (req, res) => {
    try {
        const data = await db_1.db
            .select({
            'Invoice #': schema_1.invoices.invoiceNumber,
            'Customer': schema_1.customers.fullName,
            'Total (PKR)': schema_1.invoices.totalAmount,
            'Paid (PKR)': schema_1.invoices.paidAmount,
            'Status': schema_1.invoices.status,
            'Due Date': schema_1.invoices.dueDate,
            'Created At': schema_1.invoices.createdAt,
        })
            .from(schema_1.invoices)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.invoices.customerId, schema_1.customers.id));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
        const csvStream = (0, fast_csv_1.format)({ headers: true });
        csvStream.pipe(res);
        data.forEach((row) => csvStream.write(row));
        csvStream.end();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=billing.js.map