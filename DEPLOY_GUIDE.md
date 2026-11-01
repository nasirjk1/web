# 🚀 Web Nasir — GitHub & Server Installation Guide

Follow this guide to push your project to **GitHub** and install it on your **own server** (VPS, Ubuntu, Debian, CentOS, DigitalOcean, Linode, AWS, etc.).

---

## Part 1: Push this Project to GitHub (in 2 minutes)

1. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `web-nasir`). **Do not** check "Initialize with README".
2. On your machine (or in this terminal), run:

```bash
# Initialize git and add all files
git init
git add .
git commit -m "feat: complete Web Nasir production release"

# Link to your GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/web-nasir.git

# Push the code
git push -u origin main
```

---

## Part 2: Install on Your Server

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Clone your repository:
```bash
git clone https://github.com/YOUR_USERNAME/web-nasir.git /var/www/web-nasir
cd /var/www/web-nasir
```

Choose **one** of the installation methods below:

---

### Option A: Automated One-Click Script (Recommended for Linux VPS)

Make `deploy.sh` executable and run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

This will automatically:
- Install Node.js 20 & npm if not present
- Install all dependencies
- Install PM2 process manager
- Launch Web Nasir as an auto-restarting background process on port `3000`

---

### Option B: Docker / Docker Compose

If you have Docker installed on your server:
```bash
docker compose up -d --build
```
Your application is now live on `http://YOUR_SERVER_IP:3000`!

To check logs or status:
```bash
docker compose logs -f
```

---

### Option C: Manual PM2 Process Manager

```bash
npm install
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## Part 3: Map Your Domain & Free SSL (Nginx + Let's Encrypt)

1. **Install Nginx & Certbot**:
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

2. **Configure Nginx**:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/webnasir
sudo sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN.com/g' /etc/nginx/sites-available/webnasir
sudo ln -s /etc/nginx/sites-available/webnasir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

3. **Get Free HTTPS Certificate**:
```bash
sudo certbot --nginx -d YOUR_ACTUAL_DOMAIN.com -d www.YOUR_ACTUAL_DOMAIN.com
```

Certbot will automatically install SSL and renew it every 90 days.

---

## Part 4: Access Your Admin Dashboard

Once your server is running:
- **Public Website**: `https://YOUR_DOMAIN.com/`
- **Secret Admin URL**: `https://YOUR_DOMAIN.com/admin`
- **Default Username**: `admin`
- **Default Password**: `admin123`

*(You will be prompted to update your password immediately upon first sign-in)*
