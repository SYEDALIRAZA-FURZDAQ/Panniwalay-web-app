# Panniwalay ERP — REST API Documentation

Base URL: `http://localhost:3001/api` (Development) or `https://erp.panniwalay.pk/api` (Production)

Authentication: Endpoints require JWT Bearer token in the `Authorization: Bearer <token>` header or via `jwt` httpOnly cookie.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticate staff user and receive JWT tokens.
- **Request Body**:
  ```json
  {
    "email": "admin@panniwalay.pk",
    "password": "Admin@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "admin@panniwalay.pk",
      "fullName": "Tariq Mansoor (Plant Admin)",
      "role": "admin",
      "phone": "+92-300-8291444"
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
  ```

### `POST /api/auth/refresh`
Rotate refresh token and retrieve new access token.

### `POST /api/auth/logout`
Invalidates session and clears cookies.

### `GET /api/auth/me`
Retrieves currently authenticated user profile.

---

## 2. Dashboard Operations Hub (`/api/dashboard`)

### `GET /api/dashboard/kpis`
Real-time operational KPIs for Plant #4 Karachi.
- **Response `200 OK`**:
  ```json
  {
    "activeRoutes": 6,
    "jarsOutForDelivery": 940,
    "activeRiders": 8,
    "emptyBottlesExpected": 820,
    "pendingCash": 184500,
    "totalCustomers": 412,
    "lowStockItems": []
  }
  ```

### `GET /api/dashboard/activity`
Latest 10 fleet dispatch runs and activity events.

---

## 3. Route Dispatch & Fleet Logistics (`/api/routes`)

### `GET /api/routes`
List all delivery runs with filters.
- **Query Parameters**:
  - `shift`: `morning` | `afternoon` | `all`
  - `status`: `pending` | `dispatched` | `in_transit` | `completed` | `all`
  - `date`: `YYYY-MM-DD`
  - `zoneId`: numeric ID

### `POST /api/routes`
Create and schedule a new route run.
- **Request Body**:
  ```json
  {
    "runNumber": "R-105",
    "zoneId": 1,
    "riderId": 1,
    "vehicleId": 1,
    "shift": "morning",
    "departureTime": "08:00 AM",
    "loadingDockBay": "Bay #2",
    "totalJars": 120,
    "runDate": "2026-10-19"
  }
  ```

### `GET /api/routes/:id/manifest`
Printable manifest payload with customer addresses, jars to deliver, empty bottles expected, and cash collection totals.

### `PATCH /api/routes/:id/status`
Updates run status (`dispatched`, `in_transit`, `completed`) and synchronizes assigned rider state.

---

## 4. Fleet Riders & Drivers (`/api/riders`)

### `GET /api/riders`
List all riders with status, vehicle, and zone assignments.

### `GET /api/riders/stats`
Rider roster KPI counts, cash in hand total, and deposit collateral totals.

### `POST /api/riders`
Onboard new rider into the fleet.

### `POST /api/riders/:id/handover`
Record dock cash handover received from rider upon run completion.
- **Request Body**:
  ```json
  {
    "amount": 18480,
    "routeRunId": 1,
    "notes": "Morning shift reconciliation for R-101"
  }
  ```

### `GET /api/riders/export/csv`
Download full riders roster as CSV.

---

## 5. Inventory & Bottling Line (`/api/inventory`)

### `GET /api/inventory`
List stock items with category filter (`bottled_water`, `dispensers_coolers`, `accessories`, `caps_seals_accessories`).

### `POST /api/inventory`
Add new SKU or consumable item.

### `POST /api/inventory/:id/adjust`
Record stock movement (inward from wash/supplier, outward, broken/scrapped).

### `GET /api/inventory/export/csv`
Download full stock valuation report as CSV.

---

## 6. Customer Accounts (`/api/customers`)

### `GET /api/customers`
Query subscribers with search by phone/name, zone filter, and type filter.

### `POST /api/customers`
Register new customer manually from the back office.

### `GET /api/customers/export/csv`
Export customer directory to CSV.

---

## 7. Customer Invites & Public Onboarding

### `POST /api/invites` (Protected)
Generate cryptographic single-use customer onboarding link.
- **Request Body**:
  ```json
  {
    "preassignedZoneId": 1,
    "preassignedCategory": "residential",
    "preassignedJarQuota": 2,
    "expiryHours": 168
  }
  ```
- **Response**:
  ```json
  {
    "token": "a1b2c3d4...",
    "signupUrl": "https://erp.panniwalay.pk/register?token=a1b2c3d4...",
    "expiresAt": "2026-10-26T12:00:00Z"
  }
  ```

### `GET /api/onboarding/verify?token=...` (Public)
Validate token status, check expiration, and retrieve pre-assigned zone/quota.

### `POST /api/onboarding/send-otp` (Public)
Send 6-digit SMS verification code to subscriber phone.

### `POST /api/onboarding/register` (Public)
Complete customer onboarding, insert account with unique code (e.g. `CUST-KHI-4912`), and credit bottle escrow deposit.

---

## 8. Billing & Escrow (`/api/billing`)

### `GET /api/billing/stats`
Total invoiced, paid, receivables, and escrow held.

### `GET /api/billing/invoices`
List customer invoices with status filter.

### `POST /api/billing/payments`
Record payment against invoice.

### `GET /api/billing/deposits`
List escrow movements (collateral collected and refunded).

### `POST /api/billing/deposits`
Record deposit collection or return refund.

---

## 9. Accounts & P&L Statement (`/api/accounts`)

### `GET /api/accounts/pnl`
Calculates real-time P&L statement: Gross Revenue (Refills, Dispensers, Accessories), COGS, Gross Profit & Margin %, OPEX, and EBITDA.

### `GET /api/accounts/vouchers`
List approved and pending expense vouchers.

### `POST /api/accounts/vouchers`
Record expense voucher with account head, payee, amount in PKR, and tax note.

---

## 10. System Settings (`/api/settings`)

### `GET /api/settings`
Returns key-value dictionary of system configuration.

### `POST /api/settings`
Batch save plant, pricing, and theme defaults.

### `GET /api/settings/exchange-rates`
Get conversion rates for USD, AED, SAR, EUR against PKR.
