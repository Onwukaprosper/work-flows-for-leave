<?php
// backend/models/User.php

require_once __DIR__ . '/../config/Database.php';

class User {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByStaffId($staffId) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE staff_id = :staff_id");
        $stmt->execute([':staff_id' => $staffId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getAll($limit = 100, $offset = 0) {
        $stmt = $this->db->prepare("SELECT id, staff_id, email, first_name, last_name, department, position, role, remaining_leave_days, is_active, created_at FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO users (staff_id, email, password_hash, first_name, last_name, department, position, role, phone_number)
            VALUES (:staff_id, :email, :password_hash, :first_name, :last_name, :department, :position, :role, :phone_number)
        ");
        
        $stmt->execute([
            ':staff_id' => $data['staff_id'],
            ':email' => $data['email'],
            ':password_hash' => $data['password_hash'],
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':department' => $data['department'] ?? null,
            ':position' => $data['position'] ?? null,
            ':role' => $data['role'] ?? 'staff',
            ':phone_number' => $data['phone_number'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowedFields = ['first_name', 'last_name', 'department', 'position', 'role', 'phone_number', 'remaining_leave_days', 'is_active'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (isset($data['password'])) {
            $fields[] = "password_hash = :password_hash";
            $params[':password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($fields)) {
            return true;
        }
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute($params);
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
    
    public function updateLastLogin($id) {
        $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
    
    public function updatePassword($id, $passwordHash) {
        $stmt = $this->db->prepare("UPDATE users SET password_hash = :password WHERE id = :id");
        return $stmt->execute([':password' => $passwordHash, ':id' => $id]);
    }
    
    public function saveResetToken($id, $token) {
        $stmt = $this->db->prepare("UPDATE users SET reset_token = :token, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = :id");
        return $stmt->execute([':token' => $token, ':id' => $id]);
    }
    
    public function findByResetToken($token) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE reset_token = :token AND reset_token_expires > NOW()");
        $stmt->execute([':token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function clearResetToken($id) {
        $stmt = $this->db->prepare("UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
    
    public function getTotalCount() {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM users WHERE is_active = true");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }

    public function getByDepartment($department) {
        $stmt = $this->db->prepare("
            SELECT id, staff_id, email, first_name, last_name, department, position, role, remaining_leave_days
            FROM users 
            WHERE department = :department AND is_active = true
            ORDER BY first_name, last_name
        ");
        $stmt->execute([':department' => $department]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($query) {
        $searchTerm = "%{$query}%";
        $stmt = $this->db->prepare("
            SELECT id, staff_id, email, first_name, last_name, department, position, role, remaining_leave_days
            FROM users 
            WHERE first_name ILIKE :search 
            OR last_name ILIKE :search 
            OR email ILIKE :search 
            OR staff_id ILIKE :search
            AND is_active = true
            LIMIT 20
        ");
        $stmt->execute([':search' => $searchTerm]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

//     // Get users by department
// public function getByDepartment($department) {
//     $stmt = $this->db->prepare("
//         SELECT id, staff_id, email, first_name, last_name, department, position, role, remaining_leave_days
//         FROM users WHERE department = :department AND is_active = true
//     ");
//     $stmt->execute([':department' => $department]);
//     return $stmt->fetchAll(PDO::FETCH_ASSOC);
// }

// // Search users
// public function search($query) {
//     $searchTerm = "%{$query}%";
//     $stmt = $this->db->prepare("
//         SELECT id, staff_id, email, first_name, last_name, department, position, role
//         FROM users WHERE first_name ILIKE :search OR last_name ILIKE :search 
//         OR email ILIKE :search OR staff_id ILIKE :search LIMIT 20
//     ");
//     $stmt->execute([':search' => $searchTerm]);
//     return $stmt->fetchAll(PDO::FETCH_ASSOC);
// }
}

