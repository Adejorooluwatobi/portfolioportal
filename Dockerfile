# ------------------------------------------------------------------------------
# Stage 1: Build Angular Application
# ------------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency definitions and install
COPY package*.json ./
RUN npm ci

# Copy source code and build for production
COPY . .
RUN npm run build -- --configuration production

# ------------------------------------------------------------------------------
# Stage 2: Serve with Nginx Alpine
# ------------------------------------------------------------------------------
FROM nginx:alpine AS final

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular artifacts
COPY --from=build /app/dist/PortfolioAdmin/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
