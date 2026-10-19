import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import path from 'path';

import { authRouter } from './routes/auth';
import { customersRouter } from './routes/customers';
import { inventoryRouter } from './routes/inventory';
import { ridersRouter } from './routes/riders';
import { routesRouter } from './routes/routeRuns';
import { billingRouter } from './routes/billing';
import { accountsRouter } from './routes/accounts';
import { settingsRouter } from './routes/settings';
import { dashboardRouter } from './routes/dashboard';
import { invitesRouter } from './routes/invites';
import { onboardingRouter } from './routes/onboarding';

export const logger = pino({
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads (behind auth in production)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/riders', ridersRouter);
app.use('/api/routes', routesRouter);
app.use('/api/billing', billingRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/invites', invitesRouter);
app.use('/api/onboarding', onboardingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'Panniwalay ERP' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  logger.info(`🚰 Panniwalay ERP Server running on port ${PORT}`);
});

export default app;
