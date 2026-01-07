# Build Stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

RUN npm run build

# Production Stage
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY start.sh ./

RUN chmod +x start.sh

EXPOSE 3001

# Run migrations and start server
CMD ["sh", "start.sh"]
