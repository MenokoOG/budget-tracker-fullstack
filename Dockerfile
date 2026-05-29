# syntax=docker/dockerfile:1.6

############################
# Stage 1: Install deps from local source
############################
FROM node:20-alpine AS deps
WORKDIR /app
COPY . .
RUN npm install --workspaces --include-workspace-root

############################
# Stage 2: build frontend
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
# GIT_SHA changes on every commit, so this RUN layer (and everything after it,
# including the frontend source COPY + build) is forced to re-run on each new
# deploy. A bare comment cannot bust the build cache; a changing ARG can.
ARG GIT_SHA=dev
RUN echo "frontend build for commit ${GIT_SHA}"
COPY packages/frontend ./packages/frontend
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN echo "Building frontend with VITE_API_URL=${VITE_API_URL}" && npm run build --workspace=@budget-tracker/frontend

############################
# Stage 3: build api
############################
FROM node:20-alpine AS api-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json* ./
COPY --from=deps /app/packages/api/package.json ./packages/api/
ARG GIT_SHA=dev
RUN echo "api build for commit ${GIT_SHA}"
COPY --from=deps /app/packages/api ./packages/api
RUN npm run build --workspace=@budget-tracker/api

############################
# Stage 4: production runtime
############################
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/packages/api/package.json packages/api/package.json
COPY --from=deps /app/package.json /app/package-lock.json* ./
RUN npm install --workspace=@budget-tracker/api --include-workspace-root --omit=dev

COPY --from=api-build /app/packages/api/dist ./packages/api/dist
COPY --from=deps /app/packages/api/src/migrations ./packages/api/dist/migrations
COPY --from=frontend-build /app/packages/frontend/dist ./packages/api/public

WORKDIR /app/packages/api
EXPOSE 3000
CMD ["node", "dist/index.js"]