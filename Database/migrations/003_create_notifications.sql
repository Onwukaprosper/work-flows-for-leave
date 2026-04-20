-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info', -- approval, rejection, pending, info, reminder
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- For additional data like leave_id, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create notification_logs table (for tracking email/SMS)
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    leave_id INTEGER REFERENCES leave_applications(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- email, sms, push
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leave_audit_log table for tracking all leave actions
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

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_leave_audit_log_leave_id ON leave_audit_log(leave_id);
CREATE INDEX idx_leave_audit_log_created_at ON leave_audit_log(created_at);

-- Create function to automatically create notification when leave status changes
CREATE OR REPLACE FUNCTION notify_leave_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
            NEW.user_id,
            'Leave Application Status Updated',
            'Your leave application status has changed from ' || OLD.status || ' to ' || NEW.status,
            CASE 
                WHEN NEW.status IN ('approved', 'hod_approved', 'hr_approved') THEN 'approval'
                WHEN NEW.status = 'rejected' THEN 'rejection'
                ELSE 'info'
            END,
            jsonb_build_object('leave_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leave status change notifications
CREATE TRIGGER trigger_leave_status_notification
    AFTER UPDATE ON leave_applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_leave_status_change();