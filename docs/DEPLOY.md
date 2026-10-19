# Panniwalay ERP — Production Deployment Guide (cPanel / VPS)

This guide walks you through deploying **Panniwalay ERP** (React 19 + Vite frontend and Express TypeScript backend with MySQL) to production, specifically on standard cPanel Shared/Dedicated hosting with "Setup Node.js App" (Passenger/Phusion) or any Linux VPS (Ubuntu/Debian) running PM2 and Nginx.

---

## 1. Prerequisites

- **cPanel Account** with **Setup Node.js App** (CloudLinux / cPanel LVE) or **VPS** with root access
- **Node.js** v20.x or v22.x LTS
- **MySQL Database Server** 8.0+ or MariaDB 10.5+
- **Domain/Subdomain** pointed to your server (e.g. `erp.panniwalay.pk`)

---

## 2. Database Setup on cPanel

1. Log into your **cPanel Dashboard**.
2. Navigate to **MySQL® Databases**.
3. Create a new database: `panniwalay_erp` (e.g., `user_panniwalay_erp`).
4. Create a dedicated MySQL user: `panniwalay_user` with a strong password.
5. In **Add User to Database**, grant **ALL PRIVILEGES** to `panniwalay_user` on `panniwalay_erp`.
6. Note down:
   - Database Host: `localhost` (or `127.0.0.1`)
   - Database Port: `3306`
   - Database Name: `user_panniwalay_erp`
   - Database User: `user_panniwalay_user`
   - Database Password: `your_strong_password`

---

## 3. Server Configuration & Environment Variables

Create `/server/.env` with the following production keys:

```ini
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=user_panniwalay_user
DB_PASSWORD=your_strong_password
DB_NAME=user_panniwalay_erp

# Security & Session
JWT_SECRET=production_super_secret_jwt_random_key_here_32chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=production_refresh_token_secret_random_key_64chars
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (CORS)
CLIENT_URL=https://erp.panniwalay.pk
```

---

## 4. Building the Application

On your local workstation or CI/CD runner:

### A. Build the Frontend Client:
```bash
cd client
npm install --legacy-peer-deps
npm run build
```
This produces optimized production assets in `client/dist/`.

### B. Build the Backend Server:
```bash
cd server
npm install
npm run build
```
This compiles TypeScript files from `server/src/` into standard JavaScript in `server/dist/`.

### C. Seed Initial Plant Data:
```bash
cd server
npm run seed
```
This seeds the initial Karachi zones (Clifton, DHA, Gulshan, PECHS, Korangi, North Nazimabad), default admin accounts (`admin@panniwalay.pk`), vehicles, riders, inventory, and expense heads.

---

## 5. cPanel "Setup Node.js App" Configuration

1. In cPanel, click **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version**: `20.x` or `22.x`
   - **Application mode**: `Production`
   - **Application root**: `panniwalay-server` (or directory where server files live)
   - **Application URL**: `api.panniwalay.pk` (or subpath)
   - **Application startup file**: `dist/index.js` (or `app.js`)
3. Upload `server/dist/`, `server/package.json`, and `.env` to the application directory.
4. Click **Run NPM Install** in cPanel.
5. Click **Restart Application**.

---

## 6. Hosting the Client Frontend on cPanel

1. In cPanel **File Manager**, open `public_html` (or your subdomain directory `erp.panniwalay.pk`).
2. Upload the contents of `client/dist/` into `public_html/`.
3. Create a `.htaccess` file in `public_html/` to support HTML5 client-side routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

4. Configure reverse-proxy in `.htaccess` if hosting API on the same domain under `/api`:
```apache
RewriteRule ^api/(.*) http://localhost:3001/api/$1 [P,L]
```

---

## 7. Alternative: Linux VPS Deployment (Nginx + PM2)

If deploying to an Ubuntu 22.04 / 24.04 VPS:

### Install PM2:
```bash
npm install -g pm2
cd /var/www/panniwalay/server
pm2 start dist/index.js --name "panniwalay-api"
pm2 save
pm2 startup
```

### Nginx Configuration (`/etc/nginx/sites-available/panniwalay.conf`):
```nginx
server {
    listen 80;
    server_name erp.panniwalay.pk;

    # Static React build
    root /var/www/panniwalay/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Express
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable SSL via Certbot:
```bash
sudo certbot --nginx -d erp.panniwalay.pk
```

---

## 8. Post-Deployment Verification

1. Health Check: Navigate to `https://erp.panniwalay.pk/api/health`. Should return `{"status":"ok","app":"Panniwalay ERP"}`.
2. Web Dashboard: Open `https://erp.panniwalay.pk/`.
3. Default Login:
   - Email: `admin@panniwalay.pk`
   - Password: `Admin@123`
4. Test Customer Invite: Generate invite token from Customer Accounts and test public onboarding at `/register?token=...`.
