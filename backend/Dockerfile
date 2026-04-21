FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy source code
COPY . .

# Change ownership to non-root user 'node'
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3001

CMD ["node", "server.js"]