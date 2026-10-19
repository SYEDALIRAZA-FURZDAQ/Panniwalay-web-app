"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseVouchersRelations = exports.paymentsRelations = exports.invoicesRelations = exports.routeStopsRelations = exports.routeRunsRelations = exports.customersRelations = exports.ridersRelations = exports.usersRelations = exports.exchangeRates = exports.settings = exports.cashHandovers = exports.expenseVouchers = exports.expenseHeads = exports.payments = exports.invoices = exports.deposits = exports.jarLedger = exports.deliveryItems = exports.deliveries = exports.routeStops = exports.routeRuns = exports.stockMovements = exports.inventoryItems = exports.customerInvites = exports.customers = exports.riders = exports.vehicles = exports.zones = exports.auditLogs = exports.users = exports.roles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
// ─── ROLES ────────────────────────────────────────────────────────
exports.roles = (0, mysql_core_1.mysqlTable)('roles', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 50 }).notNull().unique(),
    description: (0, mysql_core_1.varchar)('description', { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── USERS ────────────────────────────────────────────────────────
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    fullName: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)('phone', { length: 20 }),
    roleId: (0, mysql_core_1.int)('role_id').notNull().references(() => exports.roles.id),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    lastLoginAt: (0, mysql_core_1.timestamp)('last_login_at'),
    refreshToken: (0, mysql_core_1.varchar)('refresh_token', { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── AUDIT LOGS ───────────────────────────────────────────────────
exports.auditLogs = (0, mysql_core_1.mysqlTable)('audit_logs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)('user_id').references(() => exports.users.id),
    action: (0, mysql_core_1.varchar)('action', { length: 100 }).notNull(),
    entity: (0, mysql_core_1.varchar)('entity', { length: 100 }),
    entityId: (0, mysql_core_1.int)('entity_id'),
    details: (0, mysql_core_1.text)('details'),
    ipAddress: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ─── ZONES ────────────────────────────────────────────────────────
exports.zones = (0, mysql_core_1.mysqlTable)('zones', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    code: (0, mysql_core_1.varchar)('code', { length: 20 }).notNull().unique(),
    city: (0, mysql_core_1.varchar)('city', { length: 100 }).default('Karachi').notNull(),
    sector: (0, mysql_core_1.varchar)('sector', { length: 100 }),
    totalStops: (0, mysql_core_1.int)('total_stops').default(0),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── VEHICLES ─────────────────────────────────────────────────────
exports.vehicles = (0, mysql_core_1.mysqlTable)('vehicles', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    type: (0, mysql_core_1.varchar)('type', { length: 100 }).notNull(),
    make: (0, mysql_core_1.varchar)('make', { length: 100 }),
    model: (0, mysql_core_1.varchar)('model', { length: 100 }),
    registrationNo: (0, mysql_core_1.varchar)('registration_no', { length: 20 }).notNull().unique(),
    capacity: (0, mysql_core_1.int)('capacity').notNull(), // max jars
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── RIDERS ───────────────────────────────────────────────────────
exports.riders = (0, mysql_core_1.mysqlTable)('riders', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    riderId: (0, mysql_core_1.varchar)('rider_id', { length: 20 }).notNull().unique(), // e.g. RD-04
    fullName: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)('phone', { length: 20 }).notNull(),
    cnic: (0, mysql_core_1.varchar)('cnic', { length: 15 }).notNull(),
    zoneId: (0, mysql_core_1.int)('zone_id').references(() => exports.zones.id),
    vehicleId: (0, mysql_core_1.int)('vehicle_id').references(() => exports.vehicles.id),
    depositAmount: (0, mysql_core_1.bigint)('deposit_amount', { mode: 'number' }).default(0), // in PKR (integer)
    commissionRate: (0, mysql_core_1.decimal)('commission_rate', { precision: 5, scale: 2 }).default('0'),
    status: (0, mysql_core_1.mysqlEnum)('status', ['on_route', 'available', 'rest_day', 'off_shift']).default('available').notNull(),
    dailyJarQuota: (0, mysql_core_1.int)('daily_jar_quota').default(0),
    dailyJarsDelivered: (0, mysql_core_1.int)('daily_jars_delivered').default(0),
    cashInHand: (0, mysql_core_1.bigint)('cash_in_hand', { mode: 'number' }).default(0),
    rating: (0, mysql_core_1.decimal)('rating', { precision: 3, scale: 2 }).default('0'),
    avatarUrl: (0, mysql_core_1.varchar)('avatar_url', { length: 500 }),
    gpsStatus: (0, mysql_core_1.varchar)('gps_status', { length: 50 }),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── CUSTOMERS ────────────────────────────────────────────────────
exports.customers = (0, mysql_core_1.mysqlTable)('customers', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    customerCode: (0, mysql_core_1.varchar)('customer_code', { length: 20 }).notNull().unique(),
    fullName: (0, mysql_core_1.varchar)('full_name', { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)('phone', { length: 20 }).notNull(),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }),
    type: (0, mysql_core_1.mysqlEnum)('type', ['residential', 'corporate']).default('residential').notNull(),
    zoneId: (0, mysql_core_1.int)('zone_id').references(() => exports.zones.id),
    routeId: (0, mysql_core_1.int)('route_id'),
    jarQuota: (0, mysql_core_1.int)('jar_quota').default(2),
    jarsInCirculation: (0, mysql_core_1.int)('jars_in_circulation').default(0),
    depositHeld: (0, mysql_core_1.bigint)('deposit_held', { mode: 'number' }).default(0), // escrow in PKR
    refillCycle: (0, mysql_core_1.mysqlEnum)('refill_cycle', ['weekly', 'twice_weekly', 'on_call']).default('weekly'),
    status: (0, mysql_core_1.mysqlEnum)('status', ['active', 'inactive', 'pending_verification', 'suspended']).default('pending_verification').notNull(),
    address: (0, mysql_core_1.text)('address'),
    landmark: (0, mysql_core_1.varchar)('landmark', { length: 255 }),
    deliveryNote: (0, mysql_core_1.text)('delivery_note'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── CUSTOMER INVITES ─────────────────────────────────────────────
exports.customerInvites = (0, mysql_core_1.mysqlTable)('customer_invites', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    tokenHash: (0, mysql_core_1.varchar)('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
    expiresAt: (0, mysql_core_1.timestamp)('expires_at').notNull(),
    usedAt: (0, mysql_core_1.timestamp)('used_at'),
    preassignedZoneId: (0, mysql_core_1.int)('preassigned_zone_id').references(() => exports.zones.id),
    preassignedCategory: (0, mysql_core_1.mysqlEnum)('preassigned_category', ['residential', 'corporate']),
    preassignedJarQuota: (0, mysql_core_1.int)('preassigned_jar_quota'),
    createdById: (0, mysql_core_1.int)('created_by_id').references(() => exports.users.id),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── INVENTORY ITEMS ──────────────────────────────────────────────
exports.inventoryItems = (0, mysql_core_1.mysqlTable)('inventory_items', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    sku: (0, mysql_core_1.varchar)('sku', { length: 50 }).notNull().unique(),
    category: (0, mysql_core_1.mysqlEnum)('category', ['bottled_water', 'dispensers_coolers', 'caps_seals_accessories', 'accessories']).notNull(),
    description: (0, mysql_core_1.text)('description'),
    inPlantQty: (0, mysql_core_1.int)('in_plant_qty').default(0).notNull(),
    withClientsQty: (0, mysql_core_1.int)('with_clients_qty').default(0).notNull(),
    unitCost: (0, mysql_core_1.bigint)('unit_cost', { mode: 'number' }).default(0).notNull(), // PKR integer
    salePrice: (0, mysql_core_1.bigint)('sale_price', { mode: 'number' }).default(0).notNull(),
    refundableDeposit: (0, mysql_core_1.bigint)('refundable_deposit', { mode: 'number' }).default(0),
    batchLot: (0, mysql_core_1.varchar)('batch_lot', { length: 50 }),
    bay: (0, mysql_core_1.varchar)('bay', { length: 50 }),
    minThreshold: (0, mysql_core_1.int)('min_threshold').default(10).notNull(),
    stockStatus: (0, mysql_core_1.mysqlEnum)('stock_status', ['full_stock', 'moderate', 'low_stock', 'reorder', 'out_of_stock']).default('full_stock'),
    imageUrl: (0, mysql_core_1.varchar)('image_url', { length: 500 }),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── STOCK MOVEMENTS ──────────────────────────────────────────────
exports.stockMovements = (0, mysql_core_1.mysqlTable)('stock_movements', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    itemId: (0, mysql_core_1.int)('item_id').notNull().references(() => exports.inventoryItems.id),
    movementType: (0, mysql_core_1.mysqlEnum)('movement_type', ['in', 'out', 'adjustment', 'return']).notNull(),
    quantity: (0, mysql_core_1.int)('quantity').notNull(),
    reason: (0, mysql_core_1.varchar)('reason', { length: 255 }),
    referenceId: (0, mysql_core_1.int)('reference_id'),
    referenceType: (0, mysql_core_1.varchar)('reference_type', { length: 50 }),
    performedById: (0, mysql_core_1.int)('performed_by_id').references(() => exports.users.id),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ─── ROUTE RUNS ───────────────────────────────────────────────────
exports.routeRuns = (0, mysql_core_1.mysqlTable)('route_runs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    runNumber: (0, mysql_core_1.varchar)('run_number', { length: 20 }).notNull().unique(), // e.g. R-101
    zoneId: (0, mysql_core_1.int)('zone_id').references(() => exports.zones.id),
    riderId: (0, mysql_core_1.int)('rider_id').references(() => exports.riders.id),
    vehicleId: (0, mysql_core_1.int)('vehicle_id').references(() => exports.vehicles.id),
    shift: (0, mysql_core_1.mysqlEnum)('shift', ['morning', 'afternoon']).default('morning'),
    departureTime: (0, mysql_core_1.varchar)('departure_time', { length: 10 }),
    loadingDockBay: (0, mysql_core_1.varchar)('loading_dock_bay', { length: 50 }),
    totalJars: (0, mysql_core_1.int)('total_jars').default(0),
    deliveredJars: (0, mysql_core_1.int)('delivered_jars').default(0),
    emptyJarsExpected: (0, mysql_core_1.int)('empty_jars_expected').default(0),
    emptyJarsReturned: (0, mysql_core_1.int)('empty_jars_returned').default(0),
    cashToCollect: (0, mysql_core_1.bigint)('cash_to_collect', { mode: 'number' }).default(0),
    cashCollected: (0, mysql_core_1.bigint)('cash_collected', { mode: 'number' }).default(0),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'dispatched', 'in_transit', 'completed', 'cancelled']).default('pending'),
    vehicleCapacity: (0, mysql_core_1.int)('vehicle_capacity').default(0),
    payloadUtilization: (0, mysql_core_1.decimal)('payload_utilization', { precision: 5, scale: 2 }).default('0'),
    estCompletionTime: (0, mysql_core_1.varchar)('est_completion_time', { length: 10 }),
    totalStops: (0, mysql_core_1.int)('total_stops').default(0),
    completedStops: (0, mysql_core_1.int)('completed_stops').default(0),
    runDate: (0, mysql_core_1.date)('run_date').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── ROUTE STOPS ──────────────────────────────────────────────────
exports.routeStops = (0, mysql_core_1.mysqlTable)('route_stops', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    routeRunId: (0, mysql_core_1.int)('route_run_id').notNull().references(() => exports.routeRuns.id),
    customerId: (0, mysql_core_1.int)('customer_id').references(() => exports.customers.id),
    stopOrder: (0, mysql_core_1.int)('stop_order').notNull(),
    address: (0, mysql_core_1.text)('address'),
    jarsToDeliver: (0, mysql_core_1.int)('jars_to_deliver').default(0),
    jarsDelivered: (0, mysql_core_1.int)('jars_delivered').default(0),
    emptyJarsCollected: (0, mysql_core_1.int)('empty_jars_collected').default(0),
    cashAmount: (0, mysql_core_1.bigint)('cash_amount', { mode: 'number' }).default(0),
    cashCollected: (0, mysql_core_1.boolean)('cash_collected').default(false),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'in_progress', 'completed', 'skipped']).default('pending'),
    notes: (0, mysql_core_1.text)('notes'),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── DELIVERIES ───────────────────────────────────────────────────
exports.deliveries = (0, mysql_core_1.mysqlTable)('deliveries', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    routeStopId: (0, mysql_core_1.int)('route_stop_id').references(() => exports.routeStops.id),
    customerId: (0, mysql_core_1.int)('customer_id').notNull().references(() => exports.customers.id),
    riderId: (0, mysql_core_1.int)('rider_id').references(() => exports.riders.id),
    deliveryDate: (0, mysql_core_1.date)('delivery_date').notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['scheduled', 'delivered', 'failed', 'rescheduled']).default('scheduled'),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── DELIVERY ITEMS ───────────────────────────────────────────────
exports.deliveryItems = (0, mysql_core_1.mysqlTable)('delivery_items', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    deliveryId: (0, mysql_core_1.int)('delivery_id').notNull().references(() => exports.deliveries.id),
    itemId: (0, mysql_core_1.int)('item_id').notNull().references(() => exports.inventoryItems.id),
    quantity: (0, mysql_core_1.int)('quantity').notNull(),
    unitPrice: (0, mysql_core_1.bigint)('unit_price', { mode: 'number' }).notNull(),
    totalPrice: (0, mysql_core_1.bigint)('total_price', { mode: 'number' }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ─── JAR LEDGER ───────────────────────────────────────────────────
exports.jarLedger = (0, mysql_core_1.mysqlTable)('jar_ledger', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    customerId: (0, mysql_core_1.int)('customer_id').notNull().references(() => exports.customers.id),
    movementType: (0, mysql_core_1.mysqlEnum)('movement_type', ['issued', 'returned', 'damaged', 'adjustment']).notNull(),
    quantity: (0, mysql_core_1.int)('quantity').notNull(),
    referenceId: (0, mysql_core_1.int)('reference_id'),
    referenceType: (0, mysql_core_1.varchar)('reference_type', { length: 50 }),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ─── DEPOSITS (ESCROW) ───────────────────────────────────────────
exports.deposits = (0, mysql_core_1.mysqlTable)('deposits', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    customerId: (0, mysql_core_1.int)('customer_id').notNull().references(() => exports.customers.id),
    amount: (0, mysql_core_1.bigint)('amount', { mode: 'number' }).notNull(), // PKR integer
    type: (0, mysql_core_1.mysqlEnum)('type', ['collect', 'refund']).notNull(),
    method: (0, mysql_core_1.mysqlEnum)('method', ['cash', 'bank_transfer', 'online']).default('cash'),
    referenceNo: (0, mysql_core_1.varchar)('reference_no', { length: 100 }),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── INVOICES ─────────────────────────────────────────────────────
exports.invoices = (0, mysql_core_1.mysqlTable)('invoices', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    invoiceNumber: (0, mysql_core_1.varchar)('invoice_number', { length: 30 }).notNull().unique(),
    customerId: (0, mysql_core_1.int)('customer_id').notNull().references(() => exports.customers.id),
    totalAmount: (0, mysql_core_1.bigint)('total_amount', { mode: 'number' }).notNull(),
    paidAmount: (0, mysql_core_1.bigint)('paid_amount', { mode: 'number' }).default(0),
    status: (0, mysql_core_1.mysqlEnum)('status', ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']).default('draft'),
    dueDate: (0, mysql_core_1.date)('due_date'),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── PAYMENTS ─────────────────────────────────────────────────────
exports.payments = (0, mysql_core_1.mysqlTable)('payments', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    invoiceId: (0, mysql_core_1.int)('invoice_id').references(() => exports.invoices.id),
    customerId: (0, mysql_core_1.int)('customer_id').notNull().references(() => exports.customers.id),
    amount: (0, mysql_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    method: (0, mysql_core_1.mysqlEnum)('method', ['cash', 'bank_transfer', 'online', 'cheque']).default('cash'),
    referenceNo: (0, mysql_core_1.varchar)('reference_no', { length: 100 }),
    receivedById: (0, mysql_core_1.int)('received_by_id').references(() => exports.users.id),
    notes: (0, mysql_core_1.text)('notes'),
    paymentDate: (0, mysql_core_1.date)('payment_date').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── EXPENSE HEADS ────────────────────────────────────────────────
exports.expenseHeads = (0, mysql_core_1.mysqlTable)('expense_heads', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    category: (0, mysql_core_1.mysqlEnum)('category', ['cogs', 'opex', 'capex', 'other']).notNull(),
    description: (0, mysql_core_1.text)('description'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── EXPENSE VOUCHERS ─────────────────────────────────────────────
exports.expenseVouchers = (0, mysql_core_1.mysqlTable)('expense_vouchers', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    voucherNumber: (0, mysql_core_1.varchar)('voucher_number', { length: 30 }).notNull().unique(),
    expenseHeadId: (0, mysql_core_1.int)('expense_head_id').notNull().references(() => exports.expenseHeads.id),
    amount: (0, mysql_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    paymentAccount: (0, mysql_core_1.varchar)('payment_account', { length: 255 }),
    expenseDate: (0, mysql_core_1.date)('expense_date').notNull(),
    vendor: (0, mysql_core_1.varchar)('vendor', { length: 255 }),
    receiptPath: (0, mysql_core_1.varchar)('receipt_path', { length: 500 }),
    taxNote: (0, mysql_core_1.text)('tax_note'),
    notes: (0, mysql_core_1.text)('notes'),
    approvedById: (0, mysql_core_1.int)('approved_by_id').references(() => exports.users.id),
    createdById: (0, mysql_core_1.int)('created_by_id').references(() => exports.users.id),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'approved', 'rejected']).default('pending'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── CASH HANDOVERS ───────────────────────────────────────────────
exports.cashHandovers = (0, mysql_core_1.mysqlTable)('cash_handovers', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    riderId: (0, mysql_core_1.int)('rider_id').notNull().references(() => exports.riders.id),
    routeRunId: (0, mysql_core_1.int)('route_run_id').references(() => exports.routeRuns.id),
    amount: (0, mysql_core_1.bigint)('amount', { mode: 'number' }).notNull(),
    receivedById: (0, mysql_core_1.int)('received_by_id').references(() => exports.users.id),
    handoverDate: (0, mysql_core_1.date)('handover_date').notNull(),
    notes: (0, mysql_core_1.text)('notes'),
    status: (0, mysql_core_1.mysqlEnum)('status', ['pending', 'reconciled', 'disputed']).default('pending'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── SETTINGS ─────────────────────────────────────────────────────
exports.settings = (0, mysql_core_1.mysqlTable)('settings', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    key: (0, mysql_core_1.varchar)('key', { length: 100 }).notNull().unique(),
    value: (0, mysql_core_1.text)('value').notNull(),
    category: (0, mysql_core_1.varchar)('category', { length: 50 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
});
// ─── EXCHANGE RATES ───────────────────────────────────────────────
exports.exchangeRates = (0, mysql_core_1.mysqlTable)('exchange_rates', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    baseCurrency: (0, mysql_core_1.varchar)('base_currency', { length: 3 }).default('PKR').notNull(),
    targetCurrency: (0, mysql_core_1.varchar)('target_currency', { length: 3 }).notNull(),
    rate: (0, mysql_core_1.decimal)('rate', { precision: 15, scale: 6 }).notNull(),
    source: (0, mysql_core_1.varchar)('source', { length: 100 }),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ─── RELATIONS ────────────────────────────────────────────────────
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one }) => ({
    role: one(exports.roles, { fields: [exports.users.roleId], references: [exports.roles.id] }),
}));
exports.ridersRelations = (0, drizzle_orm_1.relations)(exports.riders, ({ one }) => ({
    zone: one(exports.zones, { fields: [exports.riders.zoneId], references: [exports.zones.id] }),
    vehicle: one(exports.vehicles, { fields: [exports.riders.vehicleId], references: [exports.vehicles.id] }),
}));
exports.customersRelations = (0, drizzle_orm_1.relations)(exports.customers, ({ one }) => ({
    zone: one(exports.zones, { fields: [exports.customers.zoneId], references: [exports.zones.id] }),
}));
exports.routeRunsRelations = (0, drizzle_orm_1.relations)(exports.routeRuns, ({ one, many }) => ({
    zone: one(exports.zones, { fields: [exports.routeRuns.zoneId], references: [exports.zones.id] }),
    rider: one(exports.riders, { fields: [exports.routeRuns.riderId], references: [exports.riders.id] }),
    vehicle: one(exports.vehicles, { fields: [exports.routeRuns.vehicleId], references: [exports.vehicles.id] }),
    stops: many(exports.routeStops),
}));
exports.routeStopsRelations = (0, drizzle_orm_1.relations)(exports.routeStops, ({ one }) => ({
    routeRun: one(exports.routeRuns, { fields: [exports.routeStops.routeRunId], references: [exports.routeRuns.id] }),
    customer: one(exports.customers, { fields: [exports.routeStops.customerId], references: [exports.customers.id] }),
}));
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one, many }) => ({
    customer: one(exports.customers, { fields: [exports.invoices.customerId], references: [exports.customers.id] }),
    payments: many(exports.payments),
}));
exports.paymentsRelations = (0, drizzle_orm_1.relations)(exports.payments, ({ one }) => ({
    invoice: one(exports.invoices, { fields: [exports.payments.invoiceId], references: [exports.invoices.id] }),
    customer: one(exports.customers, { fields: [exports.payments.customerId], references: [exports.customers.id] }),
}));
exports.expenseVouchersRelations = (0, drizzle_orm_1.relations)(exports.expenseVouchers, ({ one }) => ({
    expenseHead: one(exports.expenseHeads, { fields: [exports.expenseVouchers.expenseHeadId], references: [exports.expenseHeads.id] }),
}));
//# sourceMappingURL=schema.js.map