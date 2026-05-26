# syntax=docker/dockerfile:1.6

############################
# Stage 1: install deps
############################
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/api/package.json packages/api/
COPY packages/frontend/package.json packages/frontend/
RUN npm install --workspaces --include-workspace-root

############################
# Stage 2: build frontend
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY package.json package-lock.json* ./
COPY packages/frontend ./packages/frontend
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace=@budget-tracker/frontend

############################
# Stage 3: build api
############################
FROM node:20-alpine AS api-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY package.json package-lock.json* ./
COPY packages/api ./packages/api
RUN npm run build --workspace=@budget-tracker/api

############################
# Stage 4: production runtime
############################
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY packages/api/package.json packages/api/package.json
COPY package.json package-lock.json* ./
RUN npm install --workspace=@budget-tracker/api --include-workspace-root --omit=dev

COPY --from=api-build /app/packages/api/dist ./packages/api/dist
COPY packages/api/src/migrations ./packages/api/dist/migrations
COPY --from=frontend-build /app/packages/frontend/dist ./packages/api/public

WORKDIR /app/packages/api
EXPOSE 3000
CMD ["node", "dist/index.js"]
