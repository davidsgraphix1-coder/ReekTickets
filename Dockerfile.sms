FROM node:18 as app

WORKDIR /app

# Install Python for SMS handler
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Python dependencies
COPY requirements-sms.txt ./
RUN pip install -r requirements-sms.txt

# Copy SMS handler and gateway
COPY server/sms_handler.py ./server/
COPY server/sms-gateway.js ./server/
COPY server/.env ./server/ 2>/dev/null || true

# Environment
ENV NODE_ENV=production
ENV PORT=${PORT:-8001}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start SMS gateway
CMD ["node", "server/sms-gateway.js"]
