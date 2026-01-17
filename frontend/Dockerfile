# Frontend (Next.js) container
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Run with next start (production)
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
