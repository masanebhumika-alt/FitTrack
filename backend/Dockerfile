FROM node:20-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json vitest.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["sh","-c","npx prisma migrate deploy && node dist/server.js"]
