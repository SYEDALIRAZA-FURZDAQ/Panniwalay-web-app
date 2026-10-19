import { mysqlTable, varchar, int, bigint, text, timestamp, boolean, mysqlEnum, decimal, date, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ─── ROLES ────────────────────────────────────────────────────────
export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── USERS ────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  roleId: int('role_id').notNull().references(() => roles.id),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  refreshToken: varchar('refresh_token', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────
export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entity: varchar('entity', { length: 100 }),
  entityId: int('entity_id'),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── ZONES ────────────────────────────────────────────────────────
export const zones = mysqlTable('zones', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  city: varchar('city', { length: 100 }).default('Karachi').notNull(),
  sector: varchar('sector', { length: 100 }),
  totalStops: int('total_stops').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── VEHICLES ─────────────────────────────────────────────────────
export const vehicles = mysqlTable('vehicles', {
  id: int('id').primaryKey().autoincrement(),
  type: varchar('type', { length: 100 }).notNull(),
  make: varchar('make', { length: 100 }),
  model: varchar('model', { length: 100 }),
  registrationNo: varchar('registration_no', { length: 20 }).notNull().unique(),
  capacity: int('capacity').notNull(), // max jars
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── RIDERS ───────────────────────────────────────────────────────
export const riders = mysqlTable('riders', {
  id: int('id').primaryKey().autoincrement(),
  riderId: varchar('rider_id', { length: 20 }).notNull().unique(), // e.g. RD-04
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  cnic: varchar('cnic', { length: 15 }).notNull(),
  zoneId: int('zone_id').references(() => zones.id),
  vehicleId: int('vehicle_id').references(() => vehicles.id),
  depositAmount: bigint('deposit_amount', { mode: 'number' }).default(0), // in PKR (integer)
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0'),
  status: mysqlEnum('status', ['on_route', 'available', 'rest_day', 'off_shift']).default('available').notNull(),
  dailyJarQuota: int('daily_jar_quota').default(0),
  dailyJarsDelivered: int('daily_jars_delivered').default(0),
  cashInHand: bigint('cash_in_hand', { mode: 'number' }).default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  gpsStatus: varchar('gps_status', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── TARGET ROUTES ────────────────────────────────────────────────
export const targetRoutes = mysqlTable('target_routes', {
  id: int('id').primaryKey().autoincrement(),
  routeCode: varchar('route_code', { length: 30 }).notNull().unique(), // e.g. TR-101
  name: varchar('name', { length: 255 }).notNull(), // e.g. DHA Phase 5 & 6 Express
  zoneId: int('zone_id').references(() => zones.id),
  riderId: int('rider_id').references(() => riders.id),
  vehicleId: int('vehicle_id').references(() => vehicles.id),
  shift: mysqlEnum('shift', ['morning', 'afternoon']).default('morning'),
  departureTime: varchar('departure_time', { length: 20 }).default('07:30 AM'),
  loadingDockBay: varchar('loading_dock_bay', { length: 50 }).default('Bay #1'),
  targetJars: int('target_jars').default(120),
  targetCash: bigint('target_cash', { mode: 'number' }).default(0),
  estStops: int('est_stops').default(25),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── CUSTOMERS ────────────────────────────────────────────────────
export const customers = mysqlTable('customers', {
  id: int('id').primaryKey().autoincrement(),
  customerCode: varchar('customer_code', { length: 20 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  type: mysqlEnum('type', ['residential', 'corporate']).default('residential').notNull(),
  zoneId: int('zone_id').references(() => zones.id),
  routeId: int('route_id'),
  jarQuota: int('jar_quota').default(2),
  jarsInCirculation: int('jars_in_circulation').default(0),
  depositHeld: bigint('deposit_held', { mode: 'number' }).default(0), // escrow in PKR
  refillCycle: mysqlEnum('refill_cycle', ['weekly', 'twice_weekly', 'on_call']).default('weekly'),
  status: mysqlEnum('status', ['active', 'inactive', 'pending_verification', 'suspended']).default('pending_verification').notNull(),
  address: text('address'),
  landmark: varchar('landmark', { length: 255 }),
  deliveryNote: text('delivery_note'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── CUSTOMER INVITES ─────────────────────────────────────────────
export const customerInvites = mysqlTable('customer_invites', {
  id: int('id').primaryKey().autoincrement(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  preassignedZoneId: int('preassigned_zone_id').references(() => zones.id),
  preassignedCategory: mysqlEnum('preassigned_category', ['residential', 'corporate']),
  preassignedJarQuota: int('preassigned_jar_quota'),
  createdById: int('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── INVENTORY ITEMS ──────────────────────────────────────────────
export const inventoryItems = mysqlTable('inventory_items', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  category: mysqlEnum('category', ['bottled_water', 'dispensers_coolers', 'caps_seals_accessories', 'accessories']).notNull(),
  description: text('description'),
  inPlantQty: int('in_plant_qty').default(0).notNull(),
  withClientsQty: int('with_clients_qty').default(0).notNull(),
  unitCost: bigint('unit_cost', { mode: 'number' }).default(0).notNull(), // PKR integer
  salePrice: bigint('sale_price', { mode: 'number' }).default(0).notNull(),
  refundableDeposit: bigint('refundable_deposit', { mode: 'number' }).default(0),
  batchLot: varchar('batch_lot', { length: 50 }),
  bay: varchar('bay', { length: 50 }),
  minThreshold: int('min_threshold').default(10).notNull(),
  stockStatus: mysqlEnum('stock_status', ['full_stock', 'moderate', 'low_stock', 'reorder', 'out_of_stock']).default('full_stock'),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── STOCK MOVEMENTS ──────────────────────────────────────────────
export const stockMovements = mysqlTable('stock_movements', {
  id: int('id').primaryKey().autoincrement(),
  itemId: int('item_id').notNull().references(() => inventoryItems.id),
  movementType: mysqlEnum('movement_type', ['in', 'out', 'adjustment', 'return']).notNull(),
  quantity: int('quantity').notNull(),
  reason: varchar('reason', { length: 255 }),
  referenceId: int('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  performedById: int('performed_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── ROUTE RUNS ───────────────────────────────────────────────────
export const routeRuns = mysqlTable('route_runs', {
  id: int('id').primaryKey().autoincrement(),
  runNumber: varchar('run_number', { length: 20 }).notNull().unique(), // e.g. R-101
  zoneId: int('zone_id').references(() => zones.id),
  riderId: int('rider_id').references(() => riders.id),
  vehicleId: int('vehicle_id').references(() => vehicles.id),
  shift: mysqlEnum('shift', ['morning', 'afternoon']).default('morning'),
  departureTime: varchar('departure_time', { length: 10 }),
  loadingDockBay: varchar('loading_dock_bay', { length: 50 }),
  totalJars: int('total_jars').default(0),
  deliveredJars: int('delivered_jars').default(0),
  emptyJarsExpected: int('empty_jars_expected').default(0),
  emptyJarsReturned: int('empty_jars_returned').default(0),
  cashToCollect: bigint('cash_to_collect', { mode: 'number' }).default(0),
  cashCollected: bigint('cash_collected', { mode: 'number' }).default(0),
  status: mysqlEnum('status', ['pending', 'dispatched', 'in_transit', 'completed', 'cancelled']).default('pending'),
  vehicleCapacity: int('vehicle_capacity').default(0),
  payloadUtilization: decimal('payload_utilization', { precision: 5, scale: 2 }).default('0'),
  estCompletionTime: varchar('est_completion_time', { length: 10 }),
  totalStops: int('total_stops').default(0),
  completedStops: int('completed_stops').default(0),
  runDate: date('run_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── ROUTE STOPS ──────────────────────────────────────────────────
export const routeStops = mysqlTable('route_stops', {
  id: int('id').primaryKey().autoincrement(),
  routeRunId: int('route_run_id').notNull().references(() => routeRuns.id),
  customerId: int('customer_id').references(() => customers.id),
  stopOrder: int('stop_order').notNull(),
  address: text('address'),
  jarsToDeliver: int('jars_to_deliver').default(0),
  jarsDelivered: int('jars_delivered').default(0),
  emptyJarsCollected: int('empty_jars_collected').default(0),
  cashAmount: bigint('cash_amount', { mode: 'number' }).default(0),
  cashCollected: boolean('cash_collected').default(false),
  status: mysqlEnum('status', ['pending', 'in_progress', 'completed', 'skipped']).default('pending'),
  notes: text('notes'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── DELIVERIES ───────────────────────────────────────────────────
export const deliveries = mysqlTable('deliveries', {
  id: int('id').primaryKey().autoincrement(),
  routeStopId: int('route_stop_id').references(() => routeStops.id),
  customerId: int('customer_id').notNull().references(() => customers.id),
  riderId: int('rider_id').references(() => riders.id),
  deliveryDate: date('delivery_date').notNull(),
  status: mysqlEnum('status', ['scheduled', 'delivered', 'failed', 'rescheduled']).default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── DELIVERY ITEMS ───────────────────────────────────────────────
export const deliveryItems = mysqlTable('delivery_items', {
  id: int('id').primaryKey().autoincrement(),
  deliveryId: int('delivery_id').notNull().references(() => deliveries.id),
  itemId: int('item_id').notNull().references(() => inventoryItems.id),
  quantity: int('quantity').notNull(),
  unitPrice: bigint('unit_price', { mode: 'number' }).notNull(),
  totalPrice: bigint('total_price', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── JAR LEDGER ───────────────────────────────────────────────────
export const jarLedger = mysqlTable('jar_ledger', {
  id: int('id').primaryKey().autoincrement(),
  customerId: int('customer_id').notNull().references(() => customers.id),
  movementType: mysqlEnum('movement_type', ['issued', 'returned', 'damaged', 'adjustment']).notNull(),
  quantity: int('quantity').notNull(),
  referenceId: int('reference_id'),
  referenceType: varchar('reference_type', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── DEPOSITS (ESCROW) ───────────────────────────────────────────
export const deposits = mysqlTable('deposits', {
  id: int('id').primaryKey().autoincrement(),
  customerId: int('customer_id').notNull().references(() => customers.id),
  amount: bigint('amount', { mode: 'number' }).notNull(), // PKR integer
  type: mysqlEnum('type', ['collect', 'refund']).notNull(),
  method: mysqlEnum('method', ['cash', 'bank_transfer', 'online']).default('cash'),
  referenceNo: varchar('reference_no', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── INVOICES ─────────────────────────────────────────────────────
export const invoices = mysqlTable('invoices', {
  id: int('id').primaryKey().autoincrement(),
  invoiceNumber: varchar('invoice_number', { length: 30 }).notNull().unique(),
  customerId: int('customer_id').notNull().references(() => customers.id),
  totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),
  paidAmount: bigint('paid_amount', { mode: 'number' }).default(0),
  status: mysqlEnum('status', ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']).default('draft'),
  dueDate: date('due_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── PAYMENTS ─────────────────────────────────────────────────────
export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').references(() => invoices.id),
  customerId: int('customer_id').notNull().references(() => customers.id),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  method: mysqlEnum('method', ['cash', 'bank_transfer', 'online', 'cheque']).default('cash'),
  referenceNo: varchar('reference_no', { length: 100 }),
  receivedById: int('received_by_id').references(() => users.id),
  notes: text('notes'),
  paymentDate: date('payment_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── EXPENSE HEADS ────────────────────────────────────────────────
export const expenseHeads = mysqlTable('expense_heads', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  category: mysqlEnum('category', ['cogs', 'opex', 'capex', 'other']).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── EXPENSE VOUCHERS ─────────────────────────────────────────────
export const expenseVouchers = mysqlTable('expense_vouchers', {
  id: int('id').primaryKey().autoincrement(),
  voucherNumber: varchar('voucher_number', { length: 30 }).notNull().unique(),
  expenseHeadId: int('expense_head_id').notNull().references(() => expenseHeads.id),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  paymentAccount: varchar('payment_account', { length: 255 }),
  expenseDate: date('expense_date').notNull(),
  vendor: varchar('vendor', { length: 255 }),
  receiptPath: varchar('receipt_path', { length: 500 }),
  taxNote: text('tax_note'),
  notes: text('notes'),
  approvedById: int('approved_by_id').references(() => users.id),
  createdById: int('created_by_id').references(() => users.id),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── CASH HANDOVERS ───────────────────────────────────────────────
export const cashHandovers = mysqlTable('cash_handovers', {
  id: int('id').primaryKey().autoincrement(),
  riderId: int('rider_id').notNull().references(() => riders.id),
  routeRunId: int('route_run_id').references(() => routeRuns.id),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  receivedById: int('received_by_id').references(() => users.id),
  handoverDate: date('handover_date').notNull(),
  notes: text('notes'),
  status: mysqlEnum('status', ['pending', 'reconciled', 'disputed']).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── SETTINGS ─────────────────────────────────────────────────────
export const settings = mysqlTable('settings', {
  id: int('id').primaryKey().autoincrement(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── EXCHANGE RATES ───────────────────────────────────────────────
export const exchangeRates = mysqlTable('exchange_rates', {
  id: int('id').primaryKey().autoincrement(),
  baseCurrency: varchar('base_currency', { length: 3 }).default('PKR').notNull(),
  targetCurrency: varchar('target_currency', { length: 3 }).notNull(),
  rate: decimal('rate', { precision: 15, scale: 6 }).notNull(),
  source: varchar('source', { length: 100 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── RELATIONS ────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const ridersRelations = relations(riders, ({ one }) => ({
  zone: one(zones, { fields: [riders.zoneId], references: [zones.id] }),
  vehicle: one(vehicles, { fields: [riders.vehicleId], references: [vehicles.id] }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  zone: one(zones, { fields: [customers.zoneId], references: [zones.id] }),
}));

export const routeRunsRelations = relations(routeRuns, ({ one, many }) => ({
  zone: one(zones, { fields: [routeRuns.zoneId], references: [zones.id] }),
  rider: one(riders, { fields: [routeRuns.riderId], references: [riders.id] }),
  vehicle: one(vehicles, { fields: [routeRuns.vehicleId], references: [vehicles.id] }),
  stops: many(routeStops),
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
  routeRun: one(routeRuns, { fields: [routeStops.routeRunId], references: [routeRuns.id] }),
  customer: one(customers, { fields: [routeStops.customerId], references: [customers.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, { fields: [invoices.customerId], references: [customers.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
  customer: one(customers, { fields: [payments.customerId], references: [customers.id] }),
}));

export const expenseVouchersRelations = relations(expenseVouchers, ({ one }) => ({
  expenseHead: one(expenseHeads, { fields: [expenseVouchers.expenseHeadId], references: [expenseHeads.id] }),
}));

export const targetRoutesRelations = relations(targetRoutes, ({ one }) => ({
  zone: one(zones, { fields: [targetRoutes.zoneId], references: [zones.id] }),
  rider: one(riders, { fields: [targetRoutes.riderId], references: [riders.id] }),
  vehicle: one(vehicles, { fields: [targetRoutes.vehicleId], references: [vehicles.id] }),
}));
