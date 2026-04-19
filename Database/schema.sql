-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    present_post VARCHAR(100),
    salary_scale VARCHAR(50),
    salary_grade VARCHAR(10),
    salary_step INTEGER,
    date_of_appointment DATE,
    role VARCHAR(20) DEFAULT 'staff', -- staff, hod, vc, hr, bursar, admin
    annual_leave_days INTEGER DEFAULT 24,
    remaining_leave_days INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave types table
CREATE TABLE leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Annual, Sick, Maternity, Paternity, Study, Unpaid
    max_days INTEGER,
    requires_document BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave applications table
CREATE TABLE leave_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    leave_type_id INTEGER REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    academic_session VARCHAR(20),
    deferred_days_brought_forward INTEGER DEFAULT 0,
    reason_for_deferment TEXT,
    address_on_leave TEXT,
    expected_resumption_date DATE,
    leave_grant_requested BOOLEAN DEFAULT FALSE,
    registrar_granted_days INTEGER,
    reason TEXT,
    document_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, hod_approved, vc_approved, hr_approved, bursar_approved, approved, rejected, cancelled
    hod_comment TEXT,
    vc_comment TEXT,
    hr_comment TEXT,
    bursar_comment TEXT,
    admin_comment TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hod_approved_at TIMESTAMP,
    vc_approved_at TIMESTAMP,
    hr_approved_at TIMESTAMP,
    bursar_approved_at TIMESTAMP,
    final_approved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave balance history
CREATE TABLE leave_balance_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    year INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    used_days INTEGER DEFAULT 0,
    remaining_days INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20), -- leave_application, approval, rejection, reminder
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default leave types
INSERT INTO leave_types (name, max_days, requires_document, is_paid) VALUES
('Annual Leave', 24, FALSE, TRUE),
('Sick Leave', 12, TRUE, TRUE),
('Maternity Leave', 90, TRUE, TRUE),
('Paternity Leave', 14, TRUE, TRUE),
('Study Leave', 365, TRUE, TRUE),
('Unpaid Leave', NULL, FALSE, FALSE);