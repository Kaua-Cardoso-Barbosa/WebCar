FROM node:22.13.1-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional

COPY . .

ARG VITE_API_URL=https://teste-backend-webcar.zbbquj.easypanel.host
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM node:22.13.1-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --include=optional

COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
