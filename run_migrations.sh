#!/bin/bash
# run_migrations.sh

DB_NAME="mouau_leave_system"
DB_USER="mouau_user"

echo "Running migrations..."

for migration in database/migrations/*.sql; do
    echo "Running: $migration"
    psql -U $DB_USER -d $DB_NAME -f "$migration"
    if [ $? -eq 0 ]; then
        echo "✅ Success: $migration"
    else
        echo "❌ Failed: $migration"
        exit 1
    fi
done

echo "All migrations completed successfully!"