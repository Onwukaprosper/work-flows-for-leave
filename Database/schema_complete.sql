-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    present_post VARCHAR(100),
    salary_scale VARCHAR(50),
    salary_grade VARCHAR(50),
    salary_step INTEGER,
    date_of_appointment DATE,
    phone_number VARCHAR(20),
    profile_picture VARCHAR(255),
    role VARCHAR(20) DEFAULT 'staff',
    annual_leave_days INTEGER DEFAULT 24,
    remaining_leave_days DECIMAL(5,1) DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave types table
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    max_days INTEGER,
    requires_document BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave applications table
CREATE TABLE IF NOT EXISTS leave_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_end_date DATE,
    total_days DECIMAL(5,1) NOT NULL,
    actual_days DECIMAL(5,1),
    reason TEXT NOT NULL,
    document_path VARCHAR(255),
    status VARCHAR(30) DEFAULT 'pending',
    
    -- MOUAU specific fields
    college_dept_unit VARCHAR(200),
    present_post VARCHAR(100),
    salary_scale VARCHAR(50),
    salary_grade VARCHAR(50),
    salary_step INTEGER,
    academic_session VARCHAR(20),
    address_on_leave TEXT,
    expected_resumption_date DATE,
    deferred_days_brought_forward DECIMAL(5,1) DEFAULT 0,
    reason_for_deferment TEXT,
    leave_grant_requested BOOLEAN DEFAULT FALSE,
    registrar_granted_days DECIMAL(5,1),
    
    -- Approval comments
    hod_comment TEXT,
    vc_comment TEXT,
    hr_comment TEXT,
    bursar_comment TEXT,
    admin_comment TEXT,
    rejection_reason TEXT,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP,
    
    -- Timestamps
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hod_approved_at TIMESTAMP,
    vc_approved_at TIMESTAMP,
    hr_approved_at TIMESTAMP,
    bursar_approved_at TIMESTAMP,
    approved_at TIMESTAMP,
    activated_at TIMESTAMP,
    completed_at TIMESTAMP,
    return_notified_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Leave balance history
CREATE TABLE IF NOT EXISTS leave_balance_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    used_days DECIMAL(5,1) DEFAULT 0,
    remaining_days DECIMAL(5,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    leave_id INTEGER REFERENCES leave_applications(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave audit log
CREATE TABLE IF NOT EXISTS leave_audit_log (
    id SERIAL PRIMARY KEY,
    leave_id INTEGER REFERENCES leave_applications(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    comment TEXT,
    performed_by INTEGER REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave drafts
CREATE TABLE IF NOT EXISTS leave_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    college_dept_unit VARCHAR(200),
    present_post VARCHAR(100),
    academic_session VARCHAR(20),
    address_on_leave TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert leave types
INSERT INTO leave_types (name, description, max_days, requires_document, is_paid, sort_order) VALUES
('Annual Leave', 'Regular annual vacation leave', 24, FALSE, TRUE, 1),
('Sick Leave', 'Medical leave with doctor''s note required', 12, TRUE, TRUE, 2),
('Maternity Leave', 'Maternity leave for female staff', 90, TRUE, TRUE, 3),
('Paternity Leave', 'Paternity leave for male staff', 14, TRUE, TRUE, 4),
('Study Leave', 'Leave for academic pursuits', 365, TRUE, TRUE, 5),
('Unpaid Leave', 'Leave without pay', NULL, FALSE, FALSE, 6),
('Compassionate Leave', 'Family emergency or bereavement', 5, TRUE, TRUE, 7),
('Conference Leave', 'Attend conferences or workshops', 10, TRUE, TRUE, 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default users (password: Password123)
INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, remaining_leave_days) VALUES
('ADMIN001', 'admin@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'Administration', 'System Admin', 'admin', 24),
('HOD001', 'hod@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'Computer Science', 'HOD', 'hod', 20),
('HR001', 'hr@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary', 'Johnson', 'Human Resources', 'HR Manager', 'hr', 22),
('VC001', 'vc@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Williams', 'VC Office', 'Vice Chancellor', 'admin', 24),
('BURSAR001', 'bursar@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Brown', 'Bursary', 'Bursar', 'admin', 24),
('STAFF001', 'staff@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'Computer Science', 'Lecturer', 'staff', 14.5)
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_leave_applications_user_id ON leave_applications(user_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_applications_updated_at BEFORE UPDATE ON leave_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balance_history_updated_at BEFORE UPDATE ON leave_balance_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add this to schema_complete.sql if not present
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    faculty VARCHAR(100),
    hod_id INTEGER REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, code, faculty) VALUES
('Computer Science', 'CSC', 'Science'),
('Mathematics', 'MTH', 'Science'),
('Physics', 'PHY', 'Science'),
('Chemistry', 'CHM', 'Science'),
('Biology', 'BIO', 'Science'),
('Agricultural Economics', 'AEC', 'Agriculture'),
('Human Resources', 'HR', 'Administration')
ON CONFLICT (name) DO NOTHING;