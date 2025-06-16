# Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build -- --outDir build

# Build backend
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Copy built frontend to backend static folder
COPY --from=frontend-build /app/frontend/build ./static

# Set default port if not provided
ENV PORT=3000

EXPOSE $PORT

CMD ["node", "src/app.js"]
