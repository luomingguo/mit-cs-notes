# RAG 服务镜像。多阶段构建，运行阶段只保留生产依赖。
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ———— 运行阶段 ————
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY sql ./sql
# 学习路径的静态产物，/api/paths 会读它
COPY data ./data

# 不用 root 跑
USER node

EXPOSE 3100
CMD ["node", "dist/server.js"]
