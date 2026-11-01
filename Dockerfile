# Multi-stage lightweight Dockerfile for Web Nasir
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build step if needed
RUN npm run build || true

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built application and server files
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
