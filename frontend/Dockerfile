# --- Stage 1: Build React Assets ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Run Laravel Backend & Nginx ---
FROM richarvey/nginx-php-fpm:3.1.6

# Set Nginx document root for Laravel
ENV WEBROOT /var/www/html/public
ENV APP_ENV production

# Copy application files
COPY . /var/www/html

# Copy compiled assets from Stage 1
COPY --from=builder /app/public/build /var/www/html/public/build

# Run composer install
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Adjust permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
