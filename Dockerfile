# ========================================================
# WEB NASIR — PRODUCTION DOCKERFILE
# Supports Hostinger VPS, Docker Compose, Coolify, Render, Railway
# ========================================================
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build frontend assets
RUN npm run build

# Ensure persistent local database directory exists for self-hosted container mode
RUN mkdir -p /app/.netlify-blobs-data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
