#!/bin/sh
set -e

# Remove default nginx site if it exists (it conflicts with our config)
rm -f /etc/nginx/sites-enabled/default

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST:-db};port=${DB_PORT:-3306}', '${DB_USERNAME:-fbp_user}', '${DB_PASSWORD:-fb_password}');
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    \$pdo->exec('SELECT 1');
    exit(0);
} catch (PDOException \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "MySQL is unavailable - sleeping"
    sleep 2
done
echo "MySQL is up - executing commands"

composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts && \
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Build front-end assets if missing
if [ -f package.json ]; then
    npm ci && npm run build && rm -rf node_modules
fi

# Run any startup tasks here
if [ -f artisan ]; then
    php artisan migrate && \
		php artisan optimize:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan key:generate && \
		chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
fi

/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
exec "$@"
