# --- Etapa de Construcción (Builder) ---
FROM node:20-alpine AS builder

# Instalamos OpenSSL necesario para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# 1. Copiamos TODOS los archivos primero
COPY . .

# 2. LIMPIEZA OBLIGATORIA (La parte más importante)
# Borramos la carpeta node_modules por si se copió desde tu computadora.
# Esto elimina el archivo 'prisma' corrupto que causa el "Permission denied".
RUN rm -rf node_modules

# 3. Instalación limpia desde cero
RUN npm install

# 4. Generamos el cliente de Prisma (Ahora sí funcionará)
RUN npx prisma generate

# 5. Construimos el proyecto
RUN npm run build

# --- Etapa de Producción ---
FROM node:20-alpine

# Instalamos OpenSSL también en producción
RUN apk add --no-cache openssl

WORKDIR /app

# Copiamos solo lo necesario para arrancar
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos solo dependencias de producción (más ligero)
RUN npm install --only=production

# Copiamos el código compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Copiamos el script de inicio y le damos permisos
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3001

# Comando de arranque (igual que antes)
CMD npx prisma db push --accept-data-loss && node dist/index.js
