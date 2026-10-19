"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
exports.settingsRouter = (0, express_1.Router)();
// Default fallback settings
const DEFAULT_SETTINGS = {
    'plant.name': 'Plant #4 — Karachi Industrial Area',
    'plant.address': 'Plot 42-B, Sector 15, Korangi Industrial Area, Karachi',
    'plant.phone': '+92-21-35061234',
    'plant.emergencyContact': '+92-300-8291444',
    'brand.tint': '#0ea5e9', // cyan-500
    'brand.theme': 'dark',
    'pricing.standardDeposit': '1000',
    'pricing.standardRefill': '220',
    'pricing.dispenserDeposit': '8500',
    'currency.base': 'PKR',
    'currency.supported': JSON.stringify(['PKR', 'USD', 'AED', 'SAR']),
    'dispatch.autoAssign': 'true',
    'dispatch.maxRunCapacity': '120',
};
// Get all settings
exports.settingsRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const dbSettings = await db_1.db.select().from(schema_1.settings);
        const settingsMap = { ...DEFAULT_SETTINGS };
        dbSettings.forEach((s) => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Save settings batch
exports.settingsRouter.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const newSettings = req.body;
        for (const [key, value] of Object.entries(newSettings)) {
            const [existing] = await db_1.db.select().from(schema_1.settings).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key));
            if (existing) {
                await db_1.db.update(schema_1.settings).set({ value: String(value) }).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key));
            }
            else {
                await db_1.db.insert(schema_1.settings).values({ key, value: String(value), category: 'general' });
            }
        }
        res.json({ message: 'Settings saved successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Exchange Rates
exports.settingsRouter.get('/exchange-rates', auth_1.authenticate, async (req, res) => {
    try {
        const rates = await db_1.db.select().from(schema_1.exchangeRates);
        res.json(rates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update exchange rate
exports.settingsRouter.post('/exchange-rates', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { targetCurrency, rate } = req.body;
        const [existing] = await db_1.db
            .select()
            .from(schema_1.exchangeRates)
            .where((0, drizzle_orm_1.eq)(schema_1.exchangeRates.targetCurrency, targetCurrency));
        if (existing) {
            await db_1.db
                .update(schema_1.exchangeRates)
                .set({ rate: String(rate), source: 'manual' })
                .where((0, drizzle_orm_1.eq)(schema_1.exchangeRates.targetCurrency, targetCurrency));
        }
        else {
            await db_1.db.insert(schema_1.exchangeRates).values({
                baseCurrency: 'PKR',
                targetCurrency,
                rate: String(rate),
                source: 'manual',
            });
        }
        res.json({ message: 'Exchange rate updated' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//# sourceMappingURL=settings.js.map