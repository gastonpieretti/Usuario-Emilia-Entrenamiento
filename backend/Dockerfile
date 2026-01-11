# Build Stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# 1. COPIAMOS TODO PRIMERO
COPY . .

# 2. INSTALAMOS DEPENDENCIAS (Esto arregla los permisos)
RUN npm install

# 3. GENERAMOS PRISMA (Ahora sí tendrá permiso)
RUN npx prisma generate

# 4. CONSTRUIMOS
RUN npm run build

# Production Stage
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copiamos package.json y prisma para producción
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos solo lo necesario para correr
RUN npm install --only=production

# Copiamos los archivos construidos en la etapa anterior
COPY --from=builder /app/dist ./dist
COPY start.sh ./

RUN chmod +x start.sh

EXPOSE 3001

# Comando de arranque
CMD npx prisma db push --accept-data-loss && node dist/index.js
