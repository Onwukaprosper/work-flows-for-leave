# work-flows-for-leave

## Follow the instructions to run the leave management application

# CREATE THE FOLLOWING DIRECTORIES
# frontend/.env
REACT_APP_API_URL=http://localhost:8000/api

# backend/.env
DB_HOST=localhost
DB_NAME=mouau_leave_system
DB_USER=mouau_user
DB_PASS=secure_password
JWT_SECRET=your-secret-key

# This is a React app with TypeScript


# Install dependencies
cd frontend
npm install axios tailwindcss @headlessui/react @heroicons/react

## or simply 'npm install'

# Configure Tailwind if its not configured
npx tailwindcss init -p

# Start development server
npm run dev

# cd frontend && npm run dev

# Install PHP dependencies
composer require firebase/php-jwt

# Configure PostgreSQL cause we are using postgreSQL
sudo -u postgres psql
CREATE DATABASE mouau_leave_system;
CREATE USER mouau_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mouau_leave_system TO mouau_user;

# Run migrations
psql -U mouau_user -d mouau_leave_system -f database/schema.sql

# Start PHP server
php -S localhost:8000 -t backend/

NOTE: you will need to install PHP and configure PHP in your PC