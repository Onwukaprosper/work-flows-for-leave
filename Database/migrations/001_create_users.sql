-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(20) DEFAULT 'staff', -- staff, hod, hr, admin
    phone_number VARCHAR(20),
    profile_picture VARCHAR(255),
    annual_leave_days INTEGER DEFAULT 24,
    remaining_leave_days INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_staff_id ON users(staff_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- Insert default admin user (password: Admin@123)
-- Password hash is for 'Admin@123' using bcrypt
INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, remaining_leave_days)
VALUES ('ADMIN001', 'admin@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'Administration', 'System Administrator', 'admin', 24)
ON CONFLICT (email) DO NOTHING;

-- Insert sample HOD user (password: Hod@123)
INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, remaining_leave_days)
VALUES ('HOD001', 'hod@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'Computer Science', 'Head of Department', 'hod', 20)
ON CONFLICT (email) DO NOTHING;

-- Insert sample HR user (password: Hr@123)
INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, remaining_leave_days)
VALUES ('HR001', 'hr@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary', 'Johnson', 'Human Resources', 'HR Manager', 'hr', 22)
ON CONFLICT (email) DO NOTHING;

-- Insert sample staff user (password: Staff@123)
INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, remaining_leave_days)
VALUES ('STAFF001', 'staff@mouau.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'Computer Science', 'Senior Lecturer', 'staff', 14)
ON CONFLICT (email) DO NOTHING;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();