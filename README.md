# Family Budget Pro

![Family Budget Pro Logo](https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg)

A beautiful, modern web application to help families manage their budgets, track expenses, and achieve financial goals together.

## Features

- Create and manage multiple family budgets
- Track income and expenses by category
- Collaborate with family members
- Smart insights and analytics
- Secure authentication and user management
- Responsive, mobile-friendly design

## Getting Started

### Prerequisites
- PHP >= 8.1
- Composer
- Node.js & npm
- SQLite (default) or another supported database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/family-budget-pro.git
   cd family-budget-pro
   ```
2. **Install PHP dependencies:**
   ```bash
   composer install
   ```
3. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```
4. **Copy and configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```
5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```
6. **Run migrations and seeders:**
   ```bash
   php artisan migrate --seed
   ```
7. **Build frontend assets:**
   ```bash
   npm run build
   ```
8. **Start the development server:**
   ```bash
   php artisan serve
   ```

## Usage

- Register a new account and invite your family members
- Create budgets and add categories
- Track transactions and monitor spending
- View analytics and insights to improve your family's finances

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and new features.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
