#!/usr/bin/env bash
# ==========================================================
# Web Nasir — Automated Linux Server Deployment Script
# ==========================================================
set -e

echo "🚀 Starting Web Nasir server deployment..."

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js $(node -v) detected."

# 2. Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# 3. Create .env if missing
if [ ! -f .env ]; then
    echo "⚙️ Creating .env configuration from .env.example..."
    cp .env.example .env
fi

# 4. Check for PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
fi

# 5. Start or reload application
echo "⚡ Starting Web Nasir with PM2..."
pm2 start ecosystem.config.cjs || pm2 restart ecosystem.config.cjs
pm2 save

echo "🎉 Deployment successful! Web Nasir is running on http://localhost:3000"
echo "👉 Admin URL: http://localhost:3000/admin (User: admin / Pass: admin123)"
