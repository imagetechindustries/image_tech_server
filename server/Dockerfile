# Base Image: Lightweight Node.js 20 on Alpine Linux
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Set environment variable
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests first for optimal Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Change ownership of /app to node user for security
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose server port (default 3001)
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
