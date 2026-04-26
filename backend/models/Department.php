<?php
require_once __DIR__ . '/../config/Database.php';

class Department {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function getAll() {
        $stmt = $this->db->query("
            SELECT d.*, u.first_name || ' ' || u.last_name as hod_name
            FROM departments d
            LEFT JOIN users u ON d.hod_id = u.id
            ORDER BY d.name
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("
            SELECT d.*, u.first_name || ' ' || u.last_name as hod_name
            FROM departments d
            LEFT JOIN users u ON d.hod_id = u.id
            WHERE d.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO departments (name, code, faculty, hod_id, description)
            VALUES (:name, :code, :faculty, :hod_id, :description)
        ");
        $stmt->execute($data);
        return $this->db->lastInsertId();
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];
        
        $allowed = ['name', 'code', 'faculty', 'hod_id', 'description'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        $sql = "UPDATE departments SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM departments WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}