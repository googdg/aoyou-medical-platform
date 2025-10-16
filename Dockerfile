# Personal Blog Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p data logs uploads static

# Build and optimize assets
RUN npm run build 2>/dev/null || echo "No build script found"

# Remove dev dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/*.js ./
COPY --from=builder --chown=nodejs:nodejs /app/*.html ./
COPY --from=builder --chown=nodejs:nodejs /app/*.css ./
COPY --from=builder --chown=nodejs:nodejs /app/js ./js
COPY --from=builder --chown=nodejs:nodejs /app/css ./css
COPY --from=builder --chown=nodejs:nodejs /app/images ./images
COPY --from=builder --chown=nodejs:nodejs /app/data ./data
COPY --from=builder --chown=nodejs:nodejs /app/admin ./admin
COPY --from=builder --chown=nodejs:nodejs /app/test ./test

# Create directories with proper permissions
RUN mkdir -p logs uploads static backups && \
    chown -R nodejs:nodejs logs uploads static backups

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]