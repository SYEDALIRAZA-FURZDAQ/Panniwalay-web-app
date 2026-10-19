import { Router, Response } from 'express';
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

// Get all settings
settingsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dbSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

    dbSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save settings batch
settingsRouter.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const newSettings: Record<string, string> = req.body;

    for (const [key, value] of Object.entries(newSettings)) {
      const [existing] = await db.select().from(settings).where(eq(settings.key, key));
      if (existing) {
        await db.update(settings).set({ value: String(value) }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value: String(value), category: 'general' });
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
