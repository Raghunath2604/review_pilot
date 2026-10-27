# Multi-stage production Dockerfile for ReviewPilot Backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src/

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN apk add --no-cache openssl
RUN chown -R node:node /app

USER node

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
