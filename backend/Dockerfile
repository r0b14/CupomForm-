# CupomForm backend image.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY . .
RUN npm run prisma:generate -w @cupomform/backend && npm run build -w @cupomform/backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/backend ./backend
CMD ["sh", "-c", "npm run prisma:deploy -w @cupomform/backend && npm run start -w @cupomform/backend"]
