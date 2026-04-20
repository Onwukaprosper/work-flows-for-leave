-- Create leave_types table
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    max_days INTEGER,
    requires_document BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default leave types
INSERT INTO leave_types (name, description, max_days, requires_document, is_paid, sort_order) VALUES
('Annual Leave', 'Regular annual vacation leave', 24, FALSE, TRUE, 1),
('Sick Leave', 'Medical leave with doctor`s note required for more than 3 days', 12, TRUE, TRUE, 2),
('Maternity Leave', 'Maternity leave for female staff', 90, TRUE, TRUE, 3),
('Paternity Leave', 'Paternity leave for male staff', 14, TRUE, TRUE, 4),
('Study Leave', 'Leave for academic pursuits', 365, TRUE, TRUE, 5),
('Unpaid Leave', 'Leave without pay', NULL, FALSE, FALSE, 6),
('Compassionate Leave', 'Leave due to family emergency or bereavement', 5, TRUE, TRUE, 7),
('Conference Leave', 'Leave to attend conferences or workshops', 10, TRUE, TRUE, 8)
ON CONFLICT (name) DO NOTHING;

-- Create leave_applications table
CREATE TABLE IF NOT EXISTS leave_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    reason TEXT NOT NULL,
    document_path VARCHAR(255),
    status VARCHAR(30) DEFAULT 'pending', -- pending, hod_approved, hr_approved, approved, active, completed, rejected, cancelled
    hod_comment TEXT,
    hr_comment TEXT,
    admin_comment TEXT,
    rejection_reason TEXT,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hod_approved_at TIMESTAMP,
    hr_approved_at TIMESTAMP,
    approved_at TIMESTAMP,
    activated_at TIMESTAMP,
    completed_at TIMESTAMP,
    actual_end_date DATE,
    actual_days DECIMAL(5,1),
    return_notified_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add check constraint to ensure end_date >= start_date
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create indexes for better performance
CREATE INDEX idx_leave_applications_user_id ON leave_applications(user_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_leave_applications_leave_type ON leave_applications(leave_type_id);
CREATE INDEX idx_leave_applications_applied_at ON leave_applications(applied_at);

-- Create leave_balance_history table
CREATE TABLE IF NOT EXISTS leave_balance_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    used_days DECIMAL(5,1) DEFAULT 0,
    remaining_days DECIMAL(5,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per user per year
    UNIQUE(user_id, year)
);

-- Insert current year balance for existing users
INSERT INTO leave_balance_history (user_id, year, total_days, used_days, remaining_days)
SELECT id, EXTRACT(YEAR FROM CURRENT_DATE), annual_leave_days, (annual_leave_days - remaining_leave_days), remaining_leave_days
FROM users
ON CONFLICT (user_id, year) DO NOTHING;

-- Create trigger for leave_applications updated_at
CREATE TRIGGER update_leave_applications_updated_at
    BEFORE UPDATE ON leave_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for leave_balance_history updated_at
CREATE TRIGGER update_leave_balance_history_updated_at
    BEFORE UPDATE ON leave_balance_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();