# HR System

A Human Resources management system built with **Laravel 12**, designed to streamline employee and organizational management.

## Features

- **Employee Management** — Add, update, and manage employee profiles and records
- **Department Management** — Organize employees into departments
- **Contract Management** — Track and manage employee contracts
- **Document Management** — Store and manage HR-related documents
- **Role-Based Access Control** — Powered by Spatie Laravel Permission for fine-grained permissions
- **API Authentication** — Secured with Laravel Sanctum

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Authentication:** Laravel Sanctum
- **Permissions:** Spatie Laravel Permission
- **Database:** MySQL

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js & npm
- MySQL

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/hr-system.git
cd hr-system
composer run setup
```

The `setup` script will:
1. Install PHP dependencies
2. Copy `.env.example` to `.env`
3. Generate the application key
4. Run database migrations
5. Install Node dependencies and build assets

### Running Locally

```bash
composer run dev
```

This starts the Laravel server, queue worker, log viewer, and Vite dev server concurrently.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
