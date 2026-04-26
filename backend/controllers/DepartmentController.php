<?php
// backend/controllers/DepartmentController.php

require_once __DIR__ . '/../models/Department.php';

class DepartmentController {
    private $departmentModel;
    
    public function __construct() {
        $this->departmentModel = new Department();
    }
    
    public function getAllDepartments() {
        $departments = $this->departmentModel->getAll();
        $this->sendSuccess($departments);
    }
    
    public function getDepartmentById($id) {
        $department = $this->departmentModel->findById($id);
        
        if (!$department) {
            $this->sendError('Department not found', 404);
            return;
        }
        
        $this->sendSuccess($department);
    }
    
    public function createDepartment() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['name']) || empty($input['code'])) {
            $this->sendError('Name and code are required', 400);
            return;
        }
        
        $departmentId = $this->departmentModel->create([
            'name' => $input['name'],
            'code' => strtoupper($input['code']),
            'faculty' => $input['faculty'] ?? null,
            'hod_id' => $input['hod_id'] ?? null,
            'description' => $input['description'] ?? null
        ]);
        
        if ($departmentId) {
            $this->sendSuccess(['id' => $departmentId, 'message' => 'Department created']);
        } else {
            $this->sendError('Failed to create department', 500);
        }
    }
    
    public function updateDepartment($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $updated = $this->departmentModel->update($id, $input);
        
        if ($updated) {
            $this->sendSuccess(['message' => 'Department updated']);
        } else {
            $this->sendError('Failed to update department', 500);
        }
    }
    
    public function deleteDepartment($id) {
        $deleted = $this->departmentModel->delete($id);
        
        if ($deleted) {
            $this->sendSuccess(['message' => 'Department deleted']);
        } else {
            $this->sendError('Failed to delete department', 500);
        }
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(['success' => true] + $data);
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
    }
}