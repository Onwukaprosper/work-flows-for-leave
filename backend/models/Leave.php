<?php
// backend/models/Leave.php

require_once __DIR__ . '/../config/Database.php';

class Leave {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_applications (
                user_id, leave_type_id, start_date, end_date, total_days, reason, 
                college_dept_unit, present_post, salary_scale, salary_grade, salary_step,
                academic_session, address_on_leave, expected_resumption_date,
                deferred_days_brought_forward, reason_for_deferment, leave_grant_requested,
                document_path, status
            ) VALUES (
                :user_id, :leave_type_id, :start_date, :end_date, :total_days, :reason,
                :college_dept_unit, :present_post, :salary_scale, :salary_grade, :salary_step,
                :academic_session, :address_on_leave, :expected_resumption_date,
                :deferred_days_brought_forward, :reason_for_deferment, :leave_grant_requested,
                :document_path, 'pending'
            )
        ");
        
        return $stmt->execute($data) ? $this->db->lastInsertId() : false;
    }
    
    public function getLeaveById($id) {
        $stmt = $this->db->prepare("
            SELECT la.*, lt.name as leave_type_name, u.first_name, u.last_name, u.department, u.position
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            JOIN users u ON la.user_id = u.id
            WHERE la.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getUserLeaves($userId, $limit = 50) {
        $stmt = $this->db->prepare("
            SELECT la.*, lt.name as leave_type_name
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            WHERE la.user_id = :user_id
            ORDER BY la.applied_at DESC
            LIMIT :limit
        ");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getLeaveBalance($userId) {
        $stmt = $this->db->prepare("
            SELECT remaining_leave_days as remaining_days, annual_leave_days as total_days
            FROM users WHERE id = :user_id
        ");
        $stmt->execute([':user_id' => $userId]);
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get used days for current year
        $stmt2 = $this->db->prepare("
            SELECT SUM(total_days) as used_days
            FROM leave_applications
            WHERE user_id = :user_id AND status IN ('approved', 'completed') AND EXTRACT(YEAR FROM applied_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        ");
        $stmt2->execute([':user_id' => $userId]);
        $used = $stmt2->fetch(PDO::FETCH_ASSOC);
        
        $balance['used_days'] = $used['used_days'] ?? 0;
        
        return $balance;
    }
    
    public function updateStatus($id, $status, $additionalData = []) {
        $fields = ['status = :status'];
        $params = [':id' => $id, ':status' => $status];
        
        $statusFields = [
            'hod_approved' => 'hod_approved_at',
            'vc_approved' => 'vc_approved_at',
            'hr_approved' => 'hr_approved_at',
            'bursar_approved' => 'bursar_approved_at',
            'approved' => 'approved_at',
            'active' => 'activated_at',
            'completed' => 'completed_at',
            'rejected' => 'rejected_at'
        ];
        
        if (isset($statusFields[$status])) {
            $fields[] = $statusFields[$status] . " = NOW()";
        }
        
        foreach ($additionalData as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        
        $sql = "UPDATE leave_applications SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute($params);
    }
    
    public function getPendingApprovals($user) {
        $sql = "
            SELECT la.*, lt.name as leave_type_name, u.first_name, u.last_name, u.department, u.position
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            JOIN users u ON la.user_id = u.id
            WHERE 1=1
        ";
        
        if ($user['role'] === 'hod') {
            $sql .= " AND la.status = 'pending' AND u.department = :department";
            $params = [':department' => $user['department']];
        } elseif ($user['role'] === 'hr') {
            $sql .= " AND la.status = 'hod_approved'";
            $params = [];
        } else {
            $sql .= " AND la.status IN ('pending', 'hod_approved', 'vc_approved', 'hr_approved')";
            $params = [];
        }
        
        $sql .= " ORDER BY la.applied_at ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getActiveLeaves($department = null) {
        $sql = "
            SELECT la.*, lt.name as leave_type_name, u.first_name, u.last_name, u.department
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            JOIN users u ON la.user_id = u.id
            WHERE la.status = 'active'
        ";
        
        if ($department) {
            $sql .= " AND u.department = :department";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':department' => $department]);
        } else {
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPendingCount($userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM leave_applications 
            WHERE user_id = :user_id AND status IN ('pending', 'hod_approved', 'vc_approved', 'hr_approved')
        ");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function getApprovedCount($userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM leave_applications 
            WHERE user_id = :user_id AND status IN ('approved', 'active', 'completed')
        ");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function getRejectedCount($userId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM leave_applications 
            WHERE user_id = :user_id AND status = 'rejected'
        ");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function getTotalDaysTaken($userId) {
        $stmt = $this->db->prepare("
            SELECT SUM(total_days) as total FROM leave_applications 
            WHERE user_id = :user_id AND status IN ('approved', 'completed')
        ");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
    
    public function getCurrentlyOnLeaveCount() {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM leave_applications 
            WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function getPendingApprovalsCount($user) {
        if ($user['role'] === 'hod') {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM leave_applications la
                JOIN users u ON la.user_id = u.id
                WHERE la.status = 'pending' AND u.department = :department
            ");
            $stmt->execute([':department' => $user['department']]);
        } else {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM leave_applications 
                WHERE status IN ('pending', 'hod_approved', 'vc_approved')
            ");
            $stmt->execute();
        }
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function getCompletedCount() {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM leave_applications WHERE status = 'completed'
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    public function logAction($data) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_audit_log (leave_id, action, old_status, new_status, comment, performed_by, ip_address, user_agent)
            VALUES (:leave_id, :action, :old_status, :new_status, :comment, :performed_by, :ip_address, :user_agent)
        ");
        return $stmt->execute($data);
    }
    // Get upcoming leaves
public function getUpcomingLeaves($userId, $limit = 10) {
    $stmt = $this->db->prepare("
        SELECT la.*, lt.name as leave_type_name
        FROM leave_applications la
        JOIN leave_types lt ON la.leave_type_id = lt.id
        WHERE la.user_id = :user_id AND la.start_date > CURRENT_DATE 
        AND la.status = 'approved'
        ORDER BY la.start_date ASC LIMIT :limit
    ");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get recent activities
public function getRecentActivities($userId, $limit = 10) {
    $stmt = $this->db->prepare("
        SELECT * FROM leave_audit_log 
        WHERE performed_by = :user_id OR leave_id IN (
            SELECT id FROM leave_applications WHERE user_id = :user_id
        )
        ORDER BY created_at DESC LIMIT :limit
    ");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get monthly summary for reports
public function getMonthlySummary() {
    $stmt = $this->db->prepare("
        SELECT TO_CHAR(applied_at, 'YYYY-MM') as month, 
               COUNT(*) as total, 
               SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
        FROM leave_applications 
        WHERE applied_at >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY TO_CHAR(applied_at, 'YYYY-MM')
        ORDER BY month DESC
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
}