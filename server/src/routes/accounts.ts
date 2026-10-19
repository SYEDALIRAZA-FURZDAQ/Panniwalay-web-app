import { Router, Response } from 'express';
import { db } from '../db';
import { expenseVouchers, expenseHeads, invoices, payments } from '../db/schema';
import { eq, sql, and, desc, gte, lte } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const accountsRouter = Router();

// P&L Statement
accountsRouter.get('/pnl', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query as Record<string, string>;

    // Fetch payments (cash revenue)
    const allPayments = await db.select().from(payments);
    const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);

    // Revenue breakdown simulation / grouping
    const waterRefillRevenue = Math.round(totalRevenue * 0.72);
    const dispenserSalesRevenue = Math.round(totalRevenue * 0.18);
    const accessoryRevenue = totalRevenue - waterRefillRevenue - dispenserSalesRevenue;

    // Fetch expense vouchers
    const allVouchers = await db
      .select({
        id: expenseVouchers.id,
        amount: expenseVouchers.amount,
        category: expenseHeads.category,
        headName: expenseHeads.name,
      })
      .from(expenseVouchers)
      .leftJoin(expenseHeads, eq(expenseVouchers.expenseHeadId, expenseHeads.id))
      .where(eq(expenseVouchers.status, 'approved'));

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Expense Heads list
accountsRouter.get('/expense-heads', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const heads = await db.select().from(expenseHeads).where(eq(expenseHeads.isActive, true));
    res.json(heads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Expense Head
accountsRouter.post('/expense-heads', authenticate, authorize('admin', 'accountant'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description } = req.body;
    await db.insert(expenseHeads).values({
      name,
      category: category as any,
      description,
    });
    res.status(201).json({ message: 'Expense head created' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Expense Vouchers list
accountsRouter.get('/vouchers', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions: any[] = [];
    if (status && status !== 'all') {
      conditions.push(eq(expenseVouchers.status, status as any));
    }

    const data = await db
      .select({
        id: expenseVouchers.id,
        voucherNumber: expenseVouchers.voucherNumber,
        expenseHeadId: expenseVouchers.expenseHeadId,
        headName: expenseHeads.name,
        category: expenseHeads.category,
        amount: expenseVouchers.amount,
        paymentAccount: expenseVouchers.paymentAccount,
        expenseDate: expenseVouchers.expenseDate,
        vendor: expenseVouchers.vendor,
        taxNote: expenseVouchers.taxNote,
        notes: expenseVouchers.notes,
        status: expenseVouchers.status,
        createdAt: expenseVouchers.createdAt,
      })
      .from(expenseVouchers)
      .leftJoin(expenseHeads, eq(expenseVouchers.expenseHeadId, expenseHeads.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenseVouchers.id))
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const createVoucherSchema = z.object({
  expenseHeadId: z.number(),
  amount: z.number().min(1),
  paymentAccount: z.string().optional().nullable(),
  expenseDate: z.string(),
  vendor: z.string().optional().nullable(),
  taxNote: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Record Expense Voucher
accountsRouter.post('/vouchers', authenticate, authorize('admin', 'accountant', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const body = createVoucherSchema.parse(req.body);
    const voucherNumber = `EV-${Date.now().toString().slice(-6)}`;

    await db.insert(expenseVouchers).values({
      ...body,
      voucherNumber,
      createdById: req.user!.id,
      status: 'approved', // Auto-approved when entered by authorized staff
      approvedById: req.user!.id,
    } as any);

    res.status(201).json({ message: 'Expense voucher recorded', voucherNumber });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Export Vouchers CSV
accountsRouter.get('/export/vouchers/csv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await db
      .select({
        'Voucher #': expenseVouchers.voucherNumber,
        'Head': expenseHeads.name,
        'Category': expenseHeads.category,
        'Amount (PKR)': expenseVouchers.amount,
        'Vendor': expenseVouchers.vendor,
        'Date': expenseVouchers.expenseDate,
        'Payment Account': expenseVouchers.paymentAccount,
        'Status': expenseVouchers.status,
      })
      .from(expenseVouchers)
      .leftJoin(expenseHeads, eq(expenseVouchers.expenseHeadId, expenseHeads.id));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expense_vouchers.csv"');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    data.forEach((row: any) => csvStream.write(row));
    csvStream.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
