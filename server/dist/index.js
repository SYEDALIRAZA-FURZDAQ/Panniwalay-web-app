"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./routes/auth");
const customers_1 = require("./routes/customers");
const inventory_1 = require("./routes/inventory");
const riders_1 = require("./routes/riders");
const routeRuns_1 = require("./routes/routeRuns");
const billing_1 = require("./routes/billing");
const accounts_1 = require("./routes/accounts");
const settings_1 = require("./routes/settings");
const dashboard_1 = require("./routes/dashboard");
const invites_1 = require("./routes/invites");
const onboarding_1 = require("./routes/onboarding");
const zones_1 = require("./routes/zones");
const db_1 = require("./db");
exports.logger = (0, pino_1.default)({
    transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001');
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
});
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static uploads (behind auth in production)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// API Routes
app.use('/api/auth', authLimiter, auth_1.authRouter);
app.use('/api/dashboard', dashboard_1.dashboardRouter);
app.use('/api/customers', customers_1.customersRouter);
app.use('/api/inventory', inventory_1.inventoryRouter);
app.use('/api/riders', riders_1.ridersRouter);
app.use('/api/routes', routeRuns_1.routesRouter);
app.use('/api/billing', billing_1.billingRouter);
app.use('/api/accounts', accounts_1.accountsRouter);
app.use('/api/settings', settings_1.settingsRouter);
app.use('/api/invites', invites_1.invitesRouter);
app.use('/api/onboarding', onboarding_1.onboardingRouter);
app.use('/api/zones', zones_1.zonesRouter);
// Health check
app.get('/', (_req, res) => {
    res.json({ app: 'Panniwalay ERP', health: '/api/health' });
});
app.get('/api/health', async (_req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            app: 'Panniwalay ERP',
        });
    }
    catch (error) {
        exports.logger.error({ err: error }, 'Database health check failed');
        res.status(503).json({
            status: 'error',
            database: 'unavailable',
            app: 'Panniwalay ERP',
        });
    }
});
// Error handler
app.use((err, req, res, next) => {
    exports.logger.error(err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});
app.listen(PORT, () => {
    exports.logger.info(`🚰 Panniwalay ERP Server running on port ${PORT}`);
});
// Server initialized with isolated tenant routing
exports.default = app;
//# sourceMappingURL=index.js.map