## Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app/frontend

# Instala dependências para build do frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

# Copia o código fonte do frontend
COPY frontend ./

# Build do Next em modo standalone
RUN npm run build

## Etapa 2: Runtime
FROM node:20-alpine
WORKDIR /app/frontend

# Configurações de runtime
ENV NODE_ENV=production
ENV PORT=3000

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copia artefatos standalone do Next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./public

# Muda para usuário não-root
USER nextjs

# Expõe porta
EXPOSE 3000

# Inicia servidor Next standalone
CMD ["node", "server.js"]
