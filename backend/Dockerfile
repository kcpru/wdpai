FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev   # tylko prod deps

COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app .

EXPOSE 8000
CMD ["sh","-c","node migrate.js up && node index.js"]
