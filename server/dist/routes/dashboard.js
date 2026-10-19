"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.use(auth_1.authenticate);
// Get dashboard KPIs
exports.dashboardRouter.get('/kpis', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Active delivery routes today
        const [activeRoutes] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.routeRuns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.routeRuns.runDate} = ${today}`, (0, drizzle_orm_1.sql) `${schema_1.routeRuns.status} IN ('dispatched', 'in_transit')`));
        // Jars out for delivery
        const [jarsOut] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sum)(schema_1.routeRuns.totalJars) })
            .from(schema_1.routeRuns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.routeRuns.runDate} = ${today}`, (0, drizzle_orm_1.sql) `${schema_1.routeRuns.status} IN ('dispatched', 'in_transit', 'completed')`));
        // Active riders
        const [activeRiders] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.riders)
            .where((0, drizzle_orm_1.eq)(schema_1.riders.status, 'on_route'));
        // Empty bottles expected return
        const [emptyReturn] = await db_1.db
            .select({ total: (0, drizzle_orm_1.sum)(schema_1.routeRuns.emptyJarsExpected) })
            .from(schema_1.routeRuns)
            .where((0, drizzle_orm_1.sql) `${schema_1.routeRuns.runDate} = ${today}`);
        // Pending route cash
        const [pendingCash] = await db_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.routeRuns.cashToCollect} - ${schema_1.routeRuns.cashCollected}), 0)`
        })
            .from(schema_1.routeRuns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.routeRuns.runDate} = ${today}`, (0, drizzle_orm_1.sql) `${schema_1.routeRuns.status} != 'cancelled'`));
        // Total customers
        const [totalCustomers] = await db_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, true));
        // Low stock items
        const lowStockItems = await db_1.db
            .select()
            .from(schema_1.inventoryItems)
            .where((0, drizzle_orm_1.sql) `${schema_1.inventoryItems.inPlantQty} < ${schema_1.inventoryItems.minThreshold}`)
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Recent activity
exports.dashboardRouter.get('/activity', async (req, res) => {
    try {
        const recentRuns = await db_1.db
            .select()
            .from(schema_1.routeRuns)
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.routeRuns.createdAt} DESC`)
            .limit(10);
        res.json({ recentRuns });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});
//# sourceMappingURL=dashboard.js.map