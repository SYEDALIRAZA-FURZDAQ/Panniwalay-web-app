import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  roles,
  users,
  zones,
  vehicles,
  riders,
  customers,
  inventoryItems,
  routeRuns,
  routeStops,
  deposits,
  invoices,
  payments,
  expenseHeads,
  expenseVouchers,
  settings,
  exchangeRates,
} from './schema';

async function seed() {
  console.log('🌱 Starting Panniwalay ERP seed...');

  // 1. Roles
  console.log('Seeding roles...');
  const roleData = [
    { name: 'admin', description: 'System Administrator with full access' },
    { name: 'manager', description: 'Operations & Plant Manager' },
    { name: 'dispatcher', description: 'Route & Delivery Fleet Dispatcher' },
    { name: 'accountant', description: 'Finance & Ledger Accountant' },
    { name: 'rider', description: 'Delivery Driver / Rider' },
  ];

  for (const r of roleData) {
    try {
      await db.insert(roles).values(r);
    } catch (e) {}
  }

  const [adminRole] = await db.select().from(roles);
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 2. Users
  console.log('Seeding users...');
  const usersList = [
    {
      email: 'admin@panniwalay.pk',
      fullName: 'Tariq Mansoor (Plant Admin)',
      phone: '+92-300-8291444',
      roleId: adminRole.id,
      passwordHash,
    },
    {
      email: 'dispatch@panniwalay.pk',
      fullName: 'Khurram Shehzad (Head Dispatcher)',
      phone: '+92-321-9876543',
      roleId: adminRole.id,
      passwordHash,
    },
    {
      email: 'accounts@panniwalay.pk',
      fullName: 'Farhan Zaidi (CFO)',
      phone: '+92-333-5554321',
      roleId: adminRole.id,
      passwordHash,
    },
  ];

  for (const u of usersList) {
    try {
      await db.insert(users).values(u);
    } catch (e) {}
  }

  // 3. Zones (Karachi)
  console.log('Seeding zones...');
  const zonesData = [
    { name: 'Clifton & Sea View', code: 'Z-01', sector: 'South', totalStops: 42 },
    { name: 'DHA Phase 5 & 6', code: 'Z-02', sector: 'South', totalStops: 58 },
    { name: 'Gulshan-e-Iqbal Block 1-7', code: 'Z-03', sector: 'East', totalStops: 36 },
    { name: 'PECHS & Tariq Road', code: 'Z-04', sector: 'East', totalStops: 29 },
    { name: 'North Nazimabad Block A-D', code: 'Z-05', sector: 'Central', totalStops: 34 },
    { name: 'Korangi Industrial Area', code: 'Z-06', sector: 'Korangi', totalStops: 48 },
  ];

  for (const z of zonesData) {
    try {
      await db.insert(zones).values(z);
    } catch (e) {}
  }

  const dbZones = await db.select().from(zones);

  // 4. Vehicles
  console.log('Seeding vehicles...');
  const vehiclesData = [
    { type: 'Suzuki Bolan Pickup', make: 'Suzuki', model: '2023', registrationNo: 'KC-9821', capacity: 120 },
    { type: 'Hyundai Shehzore H-100', make: 'Hyundai', model: '2022', registrationNo: 'KW-4412', capacity: 250 },
    { type: 'Suzuki Ravi Loader', make: 'Suzuki', model: '2024', registrationNo: 'KR-1092', capacity: 100 },
    { type: 'FAW Carrier', make: 'FAW', model: '2023', registrationNo: 'KF-3184', capacity: 160 },
  ];

  for (const v of vehiclesData) {
    try {
      await db.insert(vehicles).values(v);
    } catch (e) {}
  }

  const dbVehicles = await db.select().from(vehicles);

  // 5. Riders
  console.log('Seeding riders...');
  const ridersData = [
    {
      riderId: 'RD-04',
      fullName: 'Kamran Akmal',
      phone: '+92-301-2345678',
      cnic: '42201-1234567-1',
      zoneId: dbZones[0]?.id || 1,
      vehicleId: dbVehicles[0]?.id || 1,
      depositAmount: 15000,
      commissionRate: '15.00',
      status: 'on_route' as const,
      dailyJarQuota: 120,
      dailyJarsDelivered: 78,
      cashInHand: 18500,
      rating: '4.85',
      gpsStatus: 'Active - Khayaban-e-Shamsheer',
    },
    {
      riderId: 'RD-07',
      fullName: 'Muhammad Bilal',
      phone: '+92-312-3456789',
      cnic: '42101-2345678-3',
      zoneId: dbZones[1]?.id || 1,
      vehicleId: dbVehicles[1]?.id || 1,
      depositAmount: 20000,
      commissionRate: '15.00',
      status: 'on_route' as const,
      dailyJarQuota: 200,
      dailyJarsDelivered: 140,
      cashInHand: 32000,
      rating: '4.92',
      gpsStatus: 'Active - 26th Street DHA',
    },
    {
      riderId: 'RD-02',
      fullName: 'Zubair Ahmed',
      phone: '+92-333-4567890',
      cnic: '42301-3456789-5',
      zoneId: dbZones[2]?.id || 1,
      vehicleId: dbVehicles[2]?.id || 1,
      depositAmount: 15000,
      commissionRate: '14.00',
      status: 'available' as const,
      dailyJarQuota: 100,
      dailyJarsDelivered: 0,
      cashInHand: 0,
      rating: '4.70',
      gpsStatus: 'Stationed at Plant Bay #3',
    },
    {
      riderId: 'RD-11',
      fullName: 'Rashid Khan',
      phone: '+92-345-5678901',
      cnic: '42501-4567890-7',
      zoneId: dbZones[5]?.id || 1,
      vehicleId: dbVehicles[3]?.id || 1,
      depositAmount: 18000,
      commissionRate: '16.00',
      status: 'rest_day' as const,
      dailyJarQuota: 0,
      dailyJarsDelivered: 0,
      cashInHand: 0,
      rating: '4.88',
      gpsStatus: 'Offline',
    },
  ];

  for (const r of ridersData) {
    try {
      await db.insert(riders).values(r);
    } catch (e) {}
  }

  // 6. Inventory Items
  console.log('Seeding inventory items...');
  const inventoryData = [
    {
      name: '19-Litre Mineral Water Jar (Filled)',
      sku: 'WTR-19L-FIL',
      category: 'bottled_water' as const,
      description: 'Standard 19-litre food grade PC polycarbonate bottle with tamper seal ring',
      inPlantQty: 1840,
      withClientsQty: 4320,
      unitCost: 65,
      salePrice: 220,
      refundableDeposit: 1000,
      batchLot: 'LOT-2610-A',
      bay: 'Bay 4A',
      minThreshold: 400,
      stockStatus: 'full_stock' as const,
    },
    {
      name: 'Empty 19-Litre PC Bottle Shell',
      sku: 'WTR-19L-EMP',
      category: 'bottled_water' as const,
      description: 'Raw empty return shells ready for 7-stage ozonated wash & sanitization',
      inPlantQty: 620,
      withClientsQty: 4320,
      unitCost: 850,
      salePrice: 1000,
      refundableDeposit: 1000,
      batchLot: 'PLT-4-RTN',
      bay: 'Bay 1Wash',
      minThreshold: 300,
      stockStatus: 'moderate' as const,
    },
    {
      name: 'Hot & Cold Water Dispenser (Compressor)',
      sku: 'DSP-ELEC-HC',
      category: 'dispensers_coolers' as const,
      description: 'Stainless steel reservoir compressor cooling hot/cold unit with child lock',
      inPlantQty: 45,
      withClientsQty: 185,
      unitCost: 14500,
      salePrice: 21500,
      refundableDeposit: 8500,
      batchLot: 'DSP-2026',
      bay: 'Aisle 3',
      minThreshold: 15,
      stockStatus: 'full_stock' as const,
    },
    {
      name: 'Manual Hand Suction Pump',
      sku: 'ACC-PMP-MAN',
      category: 'accessories' as const,
      description: 'BPA-free manual pump dispenser with sanitary cap',
      inPlantQty: 320,
      withClientsQty: 750,
      unitCost: 280,
      salePrice: 550,
      refundableDeposit: 0,
      batchLot: 'PMP-Q4',
      bay: 'Bin 12',
      minThreshold: 50,
      stockStatus: 'full_stock' as const,
    },
    {
      name: 'Tabletop Metal Bottle Cradle / Stand',
      sku: 'ACC-STND-MET',
      category: 'accessories' as const,
      description: 'Heavy duty chrome-plated bottle stand with fast flow dispensing valve',
      inPlantQty: 85,
      withClientsQty: 210,
      unitCost: 750,
      salePrice: 1400,
      refundableDeposit: 0,
      batchLot: 'STN-2026',
      bay: 'Bin 14',
      minThreshold: 20,
      stockStatus: 'full_stock' as const,
    },
    {
      name: '55mm Non-Spill Snap-On Caps (Pack of 100)',
      sku: 'CAP-55MM-100',
      category: 'caps_seals_accessories' as const,
      description: 'Medical grade PE blue non-spill bottle caps with thermal adhesive foam',
      inPlantQty: 120,
      withClientsQty: 0,
      unitCost: 350,
      salePrice: 500,
      refundableDeposit: 0,
      batchLot: 'CAP-OCT26',
      bay: 'Store Rm 2',
      minThreshold: 30,
      stockStatus: 'full_stock' as const,
    },
    {
      name: 'Tamper Evident Heat Shrink Neck Sleeves (1000 pcs)',
      sku: 'SEAL-SHR-1K',
      category: 'caps_seals_accessories' as const,
      description: 'Printed holographic security seal sleeve with tear strip',
      inPlantQty: 18,
      withClientsQty: 0,
      unitCost: 1200,
      salePrice: 1800,
      refundableDeposit: 0,
      batchLot: 'SLV-2610',
      bay: 'Store Rm 2',
      minThreshold: 25,
      stockStatus: 'low_stock' as const,
    },
  ];

  for (const item of inventoryData) {
    try {
      await db.insert(inventoryItems).values(item);
    } catch (e) {}
  }

  // 7. Customers
  console.log('Seeding customers...');
  const customersData = [
    {
      customerCode: 'CUST-0491',
      fullName: 'Shaikh Petroleum Corporation',
      phone: '+92-21-35689100',
      email: 'admin@shaikhpetro.com.pk',
      type: 'corporate' as const,
      zoneId: dbZones[0]?.id || 1,
      jarQuota: 20,
      jarsInCirculation: 18,
      depositHeld: 20000,
      refillCycle: 'twice_weekly' as const,
      status: 'active' as const,
      address: 'Suite 602, Executive Tower, Marine Drive, Clifton Block 4',
      landmark: 'Next to Dolmen Mall Clifton',
    },
    {
      customerCode: 'CUST-0512',
      fullName: 'Begum Yasmeen Abbasi',
      phone: '+92-300-2415987',
      email: 'yasmeen.abbasi@gmail.com',
      type: 'residential' as const,
      zoneId: dbZones[1]?.id || 2,
      jarQuota: 4,
      jarsInCirculation: 3,
      depositHeld: 4000,
      refillCycle: 'weekly' as const,
      status: 'active' as const,
      address: 'House 44/2, 17th Street, Khayaban-e-Mujahid, DHA Phase 5',
      landmark: 'Opposite Sultan Masjid',
    },
    {
      customerCode: 'CUST-0628',
      fullName: 'Engro Polymers HQ',
      phone: '+92-21-111-411-411',
      email: 'procurement@engropolymers.com',
      type: 'corporate' as const,
      zoneId: dbZones[5]?.id || 6,
      jarQuota: 50,
      jarsInCirculation: 45,
      depositHeld: 50000,
      refillCycle: 'twice_weekly' as const,
      status: 'active' as const,
      address: 'Plot 12, Sector 15, Korangi Industrial Area',
      landmark: 'Near Brooks Chowrangi',
    },
    {
      customerCode: 'CUST-0740',
      fullName: 'Dr. Tariq Farooq Clinic',
      phone: '+92-333-2147896',
      email: 'drtariq@farooqclinic.pk',
      type: 'residential' as const,
      zoneId: dbZones[2]?.id || 3,
      jarQuota: 6,
      jarsInCirculation: 5,
      depositHeld: 6000,
      refillCycle: 'weekly' as const,
      status: 'active' as const,
      address: 'B-12, Block 4, Gulshan-e-Iqbal',
      landmark: 'Behind Disco Bakery',
    },
  ];

  for (const c of customersData) {
    try {
      await db.insert(customers).values(c);
    } catch (e) {}
  }

  // 8. Expense Heads
  console.log('Seeding expense heads...');
  const expenseHeadsData = [
    { name: 'Water Treatment & Minerals (Ozone/RO Salts)', category: 'cogs' as const, description: 'Chemicals, mineral salts, RO membrane maintenance' },
    { name: 'Bottle Caps & Tamper Seals', category: 'cogs' as const, description: '55mm closures and heat sleeves' },
    { name: 'Fleet Fuel (Diesel & Petrol)', category: 'opex' as const, description: 'Delivery vans and trucks fuel refills' },
    { name: 'Rider Commissions & Allowances', category: 'opex' as const, description: 'Per jar delivery bonus and meal stipends' },
    { name: 'Plant Electricity & Generator Fuel', category: 'cogs' as const, description: 'K-Electric industrial tariff and backup genset' },
    { name: 'Vehicle Routine Maintenance', category: 'opex' as const, description: 'Tires, oil changes, engine tuning' },
    { name: 'RO Plant Membrane Replacement', category: 'capex' as const, description: 'Capital machinery upgrades' },
  ];

  for (const eh of expenseHeadsData) {
    try {
      await db.insert(expenseHeads).values(eh);
    } catch (e) {}
  }

  const dbHeads = await db.select().from(expenseHeads);

  // 9. Expense Vouchers
  console.log('Seeding expense vouchers...');
  const today = new Date().toISOString().split('T')[0];
  const vouchersData = [
    {
      voucherNumber: 'EV-261001',
      expenseHeadId: dbHeads[0]?.id || 1,
      amount: 45000,
      paymentAccount: 'Meezan Bank Ltd (A/C: 0102030405)',
      expenseDate: today as any,
      vendor: 'AquaChem Technologies Pakistan',
      taxNote: 'Withholding Tax 4.5% deducted',
      notes: 'Monthly magnesium sulphate, potassium bicarbonate and ozone diffusers',
      status: 'approved' as const,
    },
    {
      voucherNumber: 'EV-261002',
      expenseHeadId: dbHeads[2]?.id || 3,
      amount: 68500,
      paymentAccount: 'Corporate Fuel Fleet Card (PSO)',
      expenseDate: today as any,
      vendor: 'Pakistan State Oil — Clifton Station',
      taxNote: 'Standard sales tax invoice',
      notes: 'Fuel replenishment for fleet KC-9821, KW-4412, KF-3184',
      status: 'approved' as const,
    },
    {
      voucherNumber: 'EV-261003',
      expenseHeadId: dbHeads[1]?.id || 2,
      amount: 28000,
      paymentAccount: 'Cash In Hand Petty Cash',
      expenseDate: today as any,
      vendor: 'Crown Plastic Closures Karachi',
      taxNote: 'Cash receipt #8812',
      notes: '5000 blue non-spill caps delivered to Plant Store #2',
      status: 'approved' as const,
    },
  ];

  for (const ev of vouchersData) {
    try {
      await db.insert(expenseVouchers).values(ev);
    } catch (e) {}
  }

  // 10. Exchange Rates
  console.log('Seeding exchange rates...');
  const ratesData = [
    { baseCurrency: 'PKR', targetCurrency: 'USD', rate: '0.003600', source: 'State Bank of Pakistan' },
    { baseCurrency: 'PKR', targetCurrency: 'AED', rate: '0.013200', source: 'State Bank of Pakistan' },
    { baseCurrency: 'PKR', targetCurrency: 'SAR', rate: '0.013500', source: 'State Bank of Pakistan' },
    { baseCurrency: 'PKR', targetCurrency: 'EUR', rate: '0.003300', source: 'European Central Bank' },
  ];

  for (const er of ratesData) {
    try {
      await db.insert(exchangeRates).values(er);
    } catch (e) {}
  }

  console.log('✅ Panniwalay ERP Seed successfully completed!');
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
