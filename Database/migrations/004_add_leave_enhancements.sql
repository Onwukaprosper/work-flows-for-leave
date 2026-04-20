-- Add additional columns for enhanced leave tracking
ALTER TABLE leave_applications 
ADD COLUMN IF NOT EXISTS working_days_calculated DECIMAL(5,1),
ADD COLUMN IF NOT EXISTS holidays_excluded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekends_excluded INTEGER DEFAULT 0;

-- Create leave_requests_temp table for draft applications
CREATE TABLE IF NOT EXISTS leave_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    document_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create department_leave_quotas table
CREATE TABLE IF NOT EXISTS department_leave_quotas (
    id SERIAL PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    max_concurrent_leaves INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, year)
);

-- Insert default quotas for departments
INSERT INTO department_leave_quotas (department, year, max_concurrent_leaves)
SELECT DISTINCT department, EXTRACT(YEAR FROM CURRENT_DATE), 5
FROM users 
WHERE department IS NOT NULL AND department != ''
ON CONFLICT (department, year) DO NOTHING;

-- Create leave_calendar_events table for Google Calendar integration
CREATE TABLE IF NOT EXISTS leave_calendar_events (
    id SERIAL PRIMARY KEY,
    leave_id INTEGER REFERENCES leave_applications(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255),
    calendar_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to automatically calculate working days
CREATE OR REPLACE FUNCTION calculate_working_days()
RETURNS TRIGGER AS $$
DECLARE
    current_date DATE;
    day_count INTEGER := 0;
    weekend_count INTEGER := 0;
    holiday_count INTEGER := 0;
BEGIN
    current_date := NEW.start_date;
    WHILE current_date <= NEW.end_date LOOP
        -- Check weekend (Saturday=6, Sunday=0 in PostgreSQL)
        IF EXTRACT(DOW FROM current_date) IN (0, 6) THEN
            weekend_count := weekend_count + 1;
        ELSE
            day_count := day_count + 1;
        END IF;
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
    
    NEW.weekends_excluded := weekend_count;
    NEW.working_days_calculated := day_count;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate working days automatically
CREATE TRIGGER trigger_calculate_working_days
    BEFORE INSERT OR UPDATE OF start_date, end_date ON leave_applications
    FOR EACH ROW
    EXECUTE FUNCTION calculate_working_days();

-- Create view for leave summary reports
CREATE OR REPLACE VIEW leave_summary_view AS
SELECT 
    u.department,
    lt.name as leave_type,
    COUNT(la.id) as total_applications,
    SUM(CASE WHEN la.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN la.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN la.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(la.total_days) as total_days_taken,
    AVG(la.total_days) as avg_days_per_leave
FROM leave_applications la
JOIN users u ON la.user_id = u.id
JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.applied_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY u.department, lt.name;

-- Create function to auto-update leave balance when leave is completed
CREATE OR REPLACE FUNCTION update_leave_balance_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE users 
        SET remaining_leave_days = remaining_leave_days - NEW.actual_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
        
        -- Update balance history
        UPDATE leave_balance_history 
        SET used_days = used_days + NEW.actual_days,
            remaining_days = remaining_days - NEW.actual_days,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND year = EXTRACT(YEAR FROM NEW.completed_at);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leave balance update
CREATE TRIGGER trigger_update_balance_on_completion
    AFTER UPDATE ON leave_applications
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_leave_balance_on_completion();