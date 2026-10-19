import { Router, Response } from 'express';
import { db } from '../db';
import { invoices, payments, deposits, customers } from '../db/schema';
import { eq, sql, and, desc, like } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { z } from 'zod';
import { format } from 'fast-csv';

export const billingRouter = Router();

// Billing Stats
billingRouter.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allInvoices = await db.select().from(invoices);
    const allDeposits = await db.select().from(deposits);

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List Invoices
billingRouter.get('/invoices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, customerId, page = '1', limit = '50' } = req.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions: any[] = [];
    if (status && status !== 'all') {
      conditions.push(eq(invoices.status, status as any));
    }
    if (customerId) {
      conditions.push(eq(invoices.customerId, parseInt(customerId)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        customerName: customers.fullName,
        customerCode: customers.customerCode,
        phone: customers.phone,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(invoices.id))
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Invoice with payments
billingRouter.get('/invoices/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        customerName: customers.fullName,
        customerCode: customers.customerCode,
        address: customers.address,
        phone: customers.phone,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id));

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const invoicePayments = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id))
      .orderBy(desc(payments.paymentDate));

    res.json({ invoice, payments: invoicePayments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record Payment
billingRouter.post('/payments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, customerId, amount, method, referenceNo, notes } = req.body;

    const parsedAmount = parseInt(amount);

    await db.insert(payments).values({
      invoiceId: invoiceId ? parseInt(invoiceId) : null,
      customerId: parseInt(customerId),
      amount: parsedAmount,
      method: method || 'cash',
      referenceNo,
      receivedById: req.user!.id,
      notes,
      paymentDate: new Date().toISOString().split('T')[0] as any,
    });

    if (invoiceId) {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, parseInt(invoiceId)));
      if (invoice) {
        const newPaid = (invoice.paidAmount || 0) + parsedAmount;
        const newStatus = newPaid >= invoice.totalAmount ? 'paid' : 'partial';
        await db.update(invoices).set({ paidAmount: newPaid, status: newStatus }).where(eq(invoices.id, parseInt(invoiceId)));
      }
    }

    res.json({ message: 'Payment recorded successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Deposits List
billingRouter.get('/deposits', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, type } = req.query as Record<string, string>;
    const conditions: any[] = [];

    if (customerId) {
      conditions.push(eq(deposits.customerId, parseInt(customerId)));
    }
    if (type && type !== 'all') {
      conditions.push(eq(deposits.type, type as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: deposits.id,
        customerId: deposits.customerId,
        customerName: customers.fullName,
        customerCode: customers.customerCode,
        amount: deposits.amount,
        type: deposits.type,
        method: deposits.method,
        referenceNo: deposits.referenceNo,
        notes: deposits.notes,
        createdAt: deposits.createdAt,
      })
      .from(deposits)
      .leftJoin(customers, eq(deposits.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(deposits.id));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record Deposit Collect / Refund
billingRouter.post('/deposits', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, amount, type, method, referenceNo, notes } = req.body;
    const parsedAmount = parseInt(amount);
    const parsedCustId = parseInt(customerId);

    await db.insert(deposits).values({
      customerId: parsedCustId,
      amount: parsedAmount,
      type: type as any,
      method: method || 'cash',
      referenceNo,
      notes,
    });

    // Update customer deposit held
    const adjustment = type === 'collect' ? parsedAmount : -parsedAmount;
    await db
      .update(customers)
      .set({
        depositHeld: sql`${customers.depositHeld} + ${adjustment}`,
      })
      .where(eq(customers.id, parsedCustId));

    res.json({ message: `Deposit ${type} recorded successfully` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Export Invoices CSV
billingRouter.get('/export/invoices/csv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await db
      .select({
        'Invoice #': invoices.invoiceNumber,
        'Customer': customers.fullName,
        'Total (PKR)': invoices.totalAmount,
        'Paid (PKR)': invoices.paidAmount,
        'Status': invoices.status,
        'Due Date': invoices.dueDate,
        'Created At': invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    data.forEach((row: any) => csvStream.write(row));
    csvStream.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
