"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
exports.getSettingValue = getSettingValue;
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
// In-memory settings cache — populated from DB on first read, updated on POST
let inMemorySettings = { ...DEFAULT_SETTINGS };
let cacheLoaded = false;
/** Load settings from DB into memory cache (called lazily) */
async function loadCacheFromDB() {
    if (cacheLoaded)
        return;
    try {
        const dbSettings = await db_1.db.select().from(schema_1.settings);
        dbSettings.forEach((s) => {
            inMemorySettings[s.key] = s.value;
        });
    }
    catch {
        // DB might not be ready; keep defaults
    }
    cacheLoaded = true;
}
/** Public helper: read a single setting from the cache (for use in other routes) */
async function getSettingValue(key, defaultVal = '') {
    await loadCacheFromDB();
    return inMemorySettings[key] ?? defaultVal;
}
// ──────────────────────────────────────────────
// PUBLIC endpoint — no authentication required.
// This is used by the public customer onboarding page
// to fetch pricing info (deposit, refill price, etc.)
// ──────────────────────────────────────────────
exports.settingsRouter.get('/public', async (_req, res) => {
    try {
        await loadCacheFromDB();
        // Only expose a safe subset of settings
        res.json({
            'pricing.standardDeposit': inMemorySettings['pricing.standardDeposit'] ?? DEFAULT_SETTINGS['pricing.standardDeposit'],
            'pricing.standardRefill': inMemorySettings['pricing.standardRefill'] ?? DEFAULT_SETTINGS['pricing.standardRefill'],
            'pricing.dispenserDeposit': inMemorySettings['pricing.dispenserDeposit'] ?? DEFAULT_SETTINGS['pricing.dispenserDeposit'],
            'plant.name': inMemorySettings['plant.name'] ?? DEFAULT_SETTINGS['plant.name'],
            'plant.phone': inMemorySettings['plant.phone'] ?? DEFAULT_SETTINGS['plant.phone'],
            'currency.base': inMemorySettings['currency.base'] ?? DEFAULT_SETTINGS['currency.base'],
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get all settings (authenticated — admin panel)
exports.settingsRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        await loadCacheFromDB();
        res.json({ ...inMemorySettings });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Save settings batch (authenticated admin)
exports.settingsRouter.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const newSettings = req.body;
        for (const [key, value] of Object.entries(newSettings)) {
            const strValue = String(value);
            // Always update in-memory cache immediately
            inMemorySettings[key] = strValue;
            // Persist to DB
            try {
                const [existing] = await db_1.db.select().from(schema_1.settings).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key));
                if (existing) {
                    await db_1.db.update(schema_1.settings).set({ value: strValue }).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key));
                }
                else {
                    await db_1.db.insert(schema_1.settings).values({ key, value: strValue, category: 'general' });
                }
            }
            catch (dbErr) {
                // If DB write fails, in-memory is still updated for this session
                console.warn(`DB write for setting ${key} skipped:`, dbErr);
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