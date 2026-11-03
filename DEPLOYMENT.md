# Web Nasir — Complete Hosting, Migration & Database Portability Guide

Web Nasir is architected to run on **any hosting provider** without vendor lock-in. You can deploy and migrate seamlessly between:
- **Hostinger VPS / Cloud Hosting** (Ubuntu / Debian + Node.js + PM2 + Nginx)
- **Docker & Docker Compose** (Coolify, DigitalOcean, AWS, Hetzner, Hostinger Docker VPS)
- **Managed Node.js Platforms** (Render, Railway, Fly.io)
- **Netlify** (Serverless Functions + Netlify Blobs)

---

## 1. How Data & Media Persistence Works Across Hosts

Web Nasir uses a dual-mode storage engine (`netlify/functions/lib/store.js`):
1. **Netlify Serverless Mode (Production Netlify Functions)**:
   - Automatically uses **`@netlify/blobs`** (store name: `webnasir`, `consistency: 'strong'`) connected via `connectLambda(event)`.
   - **You do NOT need `LOCAL_STORAGE_DIR` on Netlify** — you can safely remove `LOCAL_STORAGE_DIR` from your Netlify environment variables because Netlify Functions have a read-only `/var/task` filesystem and persist all CMS records and media blobs in Netlify Blobs.
2. **Standard VPS / Node.js / Docker Mode (Self-Hosted Servers)**:
   - Automatically stores all 26+ CMS collections (Tools, Courses, Free Courses, Articles, Pages, Homepage Sections, Header/Footer, Media Library uploads, Enrollments, Students, and Settings) in **`.netlify-blobs-data/webnasir.json`** on the local disk.
   - `LOCAL_STORAGE_DIR` defaults automatically to `.netlify-blobs-data` (so you do not even need to set it unless you want a custom directory path on a VPS).

---

## 2. One-Click Database Backup & Restore (Admin Dashboard)

Before migrating to a new server (or at any time for safety):
1. Log into **`/admin`** (`https://webnasir.dpdns.org/admin`).
2. In **1. Overview**, scroll to **Database Backup, Restore & Hosting Migration**.
3. Click **Export Full Backup (.JSON)** to download `webnasir-backup-YYYY-MM-DD.json`.
   - This single file contains all your tools, courses, articles, pages, student enrollments, uploaded images, and settings.
4. On your new server, log into `/admin` and click **Restore Backup (.JSON)** to import the entire website state in seconds.

You can also use the REST API directly:
- **Export**: `GET /api/admin/backup/export` (with `Authorization: Bearer <admin_token>`)
- **Restore**: `POST /api/admin/backup/restore` (with JSON body `{ "collections": { ... } }`)
- **Health Check**: `GET /api/health`

---

## 3. Deploying on Hostinger VPS (Ubuntu / Node.js + PM2 + Nginx)

### Step 1: Install Node.js 20, PM2, and Nginx
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Step 2: Clone & Build Web Nasir
```bash
sudo mkdir -p /var/www/webnasir
sudo chown -R $USER:$USER /var/www/webnasir
git clone <your-repo-url> /var/www/webnasir
cd /var/www/webnasir

cp .env.example .env
nano .env   # Add your GEMINI_API_KEY, SITE_URL, and JWT_SECRET

npm install
npm run build
```

### Step 3: Start with PM2 (Auto-Restart on Reboot)
```bash
pm2 start npm --name "webnasir" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx & Free SSL (Let's Encrypt)
```bash
sudo cp /var/www/webnasir/nginx.conf /etc/nginx/sites-available/webnasir.conf
sudo ln -s /etc/nginx/sites-available/webnasir.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Enable HTTPS SSL certificate
sudo certbot --nginx -d webnasir.dpdns.org
```

---

## 4. Deploying with Docker Compose

```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY and JWT_SECRET
docker compose up -d --build
```
All database collections and uploaded media files are persisted on the host inside `./data/local-blobs`.
