FROM node:18-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
# Install all dependencies
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]