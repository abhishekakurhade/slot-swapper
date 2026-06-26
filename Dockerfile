# ── Frontend: React → Nginx ──────────────────────────────────────────────────
# Stage 1: Build (node:20-alpine ~180 MB, only used during build)
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (cache layer independent of source)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source and build static files
COPY public/ ./public/
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Serve (nginx:alpine ~10 MB — only static files, no Node runtime)
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config: SPA fallback + proxy to backend API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
