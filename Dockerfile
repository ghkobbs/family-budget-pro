FROM php:8.2-fpm

# Install system dependencies and PHP extensions commonly needed by Laravel
RUN apt-get update \
    && apt-get install -y \
        git \
        zip \
        unzip \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        curl \
        nginx \
        supervisor \
        libssl-dev \
        nodejs \
        npm \
    && docker-php-ext-install pdo_mysql zip gd \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

EXPOSE 80

# Run nginx and php-fpm via supervisord
# ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

