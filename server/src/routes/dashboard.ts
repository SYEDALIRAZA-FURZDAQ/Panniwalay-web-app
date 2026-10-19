import { Router, Response } from 'express';
import { db } from '../db';
import { routeRuns, riders, inventoryItems, customers, deposits, cashHandovers, routeStops } from '../db/schema';
import { eq, sql, and, gte, lte, count, sum } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

// Get dashboard KPIs
dashboardRouter.get('/kpis', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Active delivery routes today
    const [activeRoutes] = await db
      .select({ count: count() })
      .from(routeRuns)
      .where(and(
        sql`${routeRuns.runDate} = ${today}`,
        sql`${routeRuns.status} IN ('dispatched', 'in_transit')`
      ));

    // Jars out for delivery
    const [jarsOut] = await db
      .select({ total: sum(routeRuns.totalJars) })
      .from(routeRuns)
      .where(and(
        sql`${routeRuns.runDate} = ${today}`,
        sql`${routeRuns.status} IN ('dispatched', 'in_transit', 'completed')`
      ));

    // Active riders
    const [activeRiders] = await db
      .select({ count: count() })
      .from(riders)
      .where(eq(riders.status, 'on_route'));

    // Empty bottles expected return
    const [emptyReturn] = await db
      .select({ total: sum(routeRuns.emptyJarsExpected) })
      .from(routeRuns)
      .where(sql`${routeRuns.runDate} = ${today}`);

    // Pending route cash
    const [pendingCash] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${routeRuns.cashToCollect} - ${routeRuns.cashCollected}), 0)` 
      })
      .from(routeRuns)
      .where(and(
        sql`${routeRuns.runDate} = ${today}`,
        sql`${routeRuns.status} != 'cancelled'`
      ));

    // Total customers
    const [totalCustomers] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.isActive, true));

    // Low stock items
    const lowStockItems = await db
      .select()
      .from(inventoryItems)
      .where(sql`${inventoryItems.inPlantQty} < ${inventoryItems.minThreshold}`)
      .limit(5);

    res.json({
      activeRoutes: activeRoutes?.count || 0,
      jarsOutForDelivery: Number(jarsOut?.total) || 0,
      activeRiders: activeRiders?.count || 0,
      emptyBottlesExpected: Number(emptyReturn?.total) || 0,
      pendingCash: Number(pendingCash?.total) || 0,
      totalCustomers: totalCustomers?.count || 0,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Recent activity
dashboardRouter.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const recentRuns = await db
      .select()
      .from(routeRuns)
      .orderBy(sql`${routeRuns.createdAt} DESC`)
      .limit(10);

    res.json({ recentRuns });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});
