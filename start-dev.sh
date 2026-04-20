#!/bin/bash
# start-dev.sh

# Start PostgreSQL (adjust command for your OS)
sudo systemctl start postgresql

# Start PHP backend
cd backend
php -S localhost:8000 -t ./ &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo "Press Ctrl+C to stop all"

wait