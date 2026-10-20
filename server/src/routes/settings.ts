import { Router, Request, Response } from 'express';
import { db } from '../db';
import { settings, exchangeRates } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

export const settingsRouter = Router();

// Default fallback settings
const DEFAULT_SETTINGS: Record<string, string> = {
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
let inMemorySettings: Record<string, string> = { ...DEFAULT_SETTINGS };
let cacheLoaded = false;

/** Load settings from DB into memory cache (called lazily) */
async function loadCacheFromDB(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const dbSettings = await db.select().from(settings);
    dbSettings.forEach((s) => {
      inMemorySettings[s.key] = s.value;
    });
  } catch {
    // DB might not be ready; keep defaults
  }
  cacheLoaded = true;
}

/** Public helper: read a single setting from the cache (for use in other routes) */
export async function getSettingValue(key: string, defaultVal: string = ''): Promise<string> {
  await loadCacheFromDB();
  return inMemorySettings[key] ?? defaultVal;
}

// ──────────────────────────────────────────────
// PUBLIC endpoint — no authentication required.
// This is used by the public customer onboarding page
// to fetch pricing info (deposit, refill price, etc.)
// ──────────────────────────────────────────────
settingsRouter.get('/public', async (_req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all settings (authenticated — admin panel)
settingsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await loadCacheFromDB();
    res.json({ ...inMemorySettings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save settings batch (authenticated admin)
settingsRouter.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const newSettings: Record<string, string> = req.body;

    for (const [key, value] of Object.entries(newSettings)) {
      const strValue = String(value);

      // Always update in-memory cache immediately
      inMemorySettings[key] = strValue;

      // Persist to DB
      try {
        const [existing] = await db.select().from(settings).where(eq(settings.key, key));
        if (existing) {
          await db.update(settings).set({ value: strValue }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value: strValue, category: 'general' });
        }
      } catch (dbErr) {
        // If DB write fails, in-memory is still updated for this session
        console.warn(`DB write for setting ${key} skipped:`, dbErr);
      }
    }

    res.json({ message: 'Settings saved successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Exchange Rates
settingsRouter.get('/exchange-rates', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rates = await db.select().from(exchangeRates);
    res.json(rates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update exchange rate
settingsRouter.post('/exchange-rates', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { targetCurrency, rate } = req.body;
    const [existing] = await db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.targetCurrency, targetCurrency));

    if (existing) {
      await db
        .update(exchangeRates)
        .set({ rate: String(rate), source: 'manual' })
        .where(eq(exchangeRates.targetCurrency, targetCurrency));
    } else {
      await db.insert(exchangeRates).values({
        baseCurrency: 'PKR',
        targetCurrency,
        rate: String(rate),
        source: 'manual',
      });
    }

    res.json({ message: 'Exchange rate updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
