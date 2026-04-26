<?php
// backend/controllers/UserController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/NotificationService.php';

class UserController {
    private $userModel;
    private $notificationService;
    
    public function __construct() {
        $this->userModel = new User();
        $this->notificationService = new NotificationService();
    }
    
    // Get all users (admin only)
    public function getAllUsers() {
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 50;
        $offset = ($page - 1) * $limit;
        
        $users = $this->userModel->getAll($limit, $offset);
        $total = $this->userModel->getTotalCount();
        
        $this->sendSuccess([
            'data' => $users,
            'meta' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'last_page' => ceil($total / $limit)
            ]
        ]);
    }
    
    // Get user by ID
    public function getUserById($id) {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            $this->sendError('User not found', 404);
            return;
        }
        
        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['reset_token']);
        unset($user['reset_token_expires']);
        
        $this->sendSuccess($user);
    }
    
    // Get current user profile
    public function getProfile($userId) {
        $user = $this->userModel->findById($userId);
        
        if (!$user) {
            $this->sendError('User not found', 404);
            return;
        }
        
        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['reset_token']);
        unset($user['reset_token_expires']);
        
        $this->sendSuccess($user);
    }
    
    // Create new user (admin only)
    public function createUser() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['staff_id', 'email', 'first_name', 'last_name', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->sendError("$field is required", 400);
                return;
            }
        }
        
        // Validate email format
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $this->sendError('Invalid email format', 400);
            return;
        }
        
        // Check if email already exists
        if ($this->userModel->findByEmail($input['email'])) {
            $this->sendError('Email already registered', 400);
            return;
        }
        
        // Check if staff ID already exists
        if ($this->userModel->findByStaffId($input['staff_id'])) {
            $this->sendError('Staff ID already exists', 400);
            return;
        }
        
        // Validate password strength
        if (strlen($input['password']) < 6) {
            $this->sendError('Password must be at least 6 characters', 400);
            return;
        }
        
        // Create user
        $userId = $this->userModel->create([
            'staff_id' => $input['staff_id'],
            'email' => $input['email'],
            'password_hash' => password_hash($input['password'], PASSWORD_DEFAULT),
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'department' => $input['department'] ?? null,
            'position' => $input['position'] ?? null,
            'role' => $input['role'],
            'phone_number' => $input['phone_number'] ?? null
        ]);
        
        if ($userId) {
            // Send welcome email
            $newUser = $this->userModel->findById($userId);
            $this->notificationService->sendWelcomeEmail($newUser, $input['password']);
            
            $this->sendSuccess([
                'message' => 'User created successfully',
                'user_id' => $userId
            ]);
        } else {
            $this->sendError('Failed to create user', 500);
        }
    }
    
    // Update user (admin only)
    public function updateUser($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Check if user exists
        $existingUser = $this->userModel->findById($id);
        if (!$existingUser) {
            $this->sendError('User not found', 404);
            return;
        }
        
        // Prepare update data
        $updateData = [];
        
        $allowedFields = ['first_name', 'last_name', 'department', 'position', 'role', 'phone_number', 'remaining_leave_days', 'is_active'];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateData[$field] = $input[$field];
            }
        }
        
        // Handle password update if provided
        if (!empty($input['password'])) {
            if (strlen($input['password']) < 6) {
                $this->sendError('Password must be at least 6 characters', 400);
                return;
            }
            $updateData['password'] = $input['password'];
        }
        
        // Update user
        $updated = $this->userModel->update($id, $updateData);
        
        if ($updated) {
            $this->sendSuccess(['message' => 'User updated successfully']);
        } else {
            $this->sendError('Failed to update user', 500);
        }
    }
    
    // Update current user profile
    public function updateProfile($userId) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Prepare update data
        $updateData = [];
        
        $allowedFields = ['first_name', 'last_name', 'phone_number'];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateData[$field] = $input[$field];
            }
        }
        
        // Update user
        $updated = $this->userModel->update($userId, $updateData);
        
        if ($updated) {
            $user = $this->userModel->findById($userId);
            unset($user['password_hash']);
            $this->sendSuccess([
                'message' => 'Profile updated successfully',
                'user' => $user
            ]);
        } else {
            $this->sendError('Failed to update profile', 500);
        }
    }
    
    // Change password
    public function changePassword($userId) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['current_password']) || empty($input['new_password'])) {
            $this->sendError('Current password and new password are required', 400);
            return;
        }
        
        // Get user
        $user = $this->userModel->findById($userId);
        
        // Verify current password
        if (!password_verify($input['current_password'], $user['password_hash'])) {
            $this->sendError('Current password is incorrect', 400);
            return;
        }
        
        // Validate new password
        if (strlen($input['new_password']) < 6) {
            $this->sendError('New password must be at least 6 characters', 400);
            return;
        }
        
        // Update password
        $updated = $this->userModel->updatePassword($userId, password_hash($input['new_password'], PASSWORD_DEFAULT));
        
        if ($updated) {
            // Send password change notification
            $this->notificationService->sendPasswordChangeNotification($user);
            
            $this->sendSuccess(['message' => 'Password changed successfully']);
        } else {
            $this->sendError('Failed to change password', 500);
        }
    }
    
    // Delete user (admin only)
    public function deleteUser($id) {
        // Prevent self-deletion
        $currentUser = $this->getCurrentUser();
        if ($currentUser['id'] == $id) {
            $this->sendError('Cannot delete your own account', 400);
            return;
        }
        
        // Check if user exists
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->sendError('User not found', 404);
            return;
        }
        
        // Delete user
        $deleted = $this->userModel->delete($id);
        
        if ($deleted) {
            $this->sendSuccess(['message' => 'User deleted successfully']);
        } else {
            $this->sendError('Failed to delete user', 500);
        }
    }
    
    // Update user role (admin only)
    public function updateUserRole($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['role'])) {
            $this->sendError('Role is required', 400);
            return;
        }
        
        $validRoles = ['staff', 'hod', 'hr', 'admin'];
        if (!in_array($input['role'], $validRoles)) {
            $this->sendError('Invalid role', 400);
            return;
        }
        
        $updated = $this->userModel->update($id, ['role' => $input['role']]);
        
        if ($updated) {
            $this->sendSuccess(['message' => 'User role updated successfully']);
        } else {
            $this->sendError('Failed to update user role', 500);
        }
    }
    
    // Update leave balance (admin/hr only)
    public function updateLeaveBalance($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['remaining_days']) || $input['remaining_days'] < 0) {
            $this->sendError('Valid remaining days are required', 400);
            return;
        }
        
        $updated = $this->userModel->update($id, ['remaining_leave_days' => $input['remaining_days']]);
        
        if ($updated) {
            $user = $this->userModel->findById($id);
            $this->notificationService->sendLeaveBalanceUpdateNotification($user, $input['remaining_days']);
            
            $this->sendSuccess(['message' => 'Leave balance updated successfully']);
        } else {
            $this->sendError('Failed to update leave balance', 500);
        }
    }
    
    // Get users by department
    public function getUsersByDepartment() {
        $department = $_GET['department'] ?? null;
        
        if (!$department) {
            $this->sendError('Department parameter is required', 400);
            return;
        }
        
        $users = $this->userModel->getByDepartment($department);
        
        $this->sendSuccess($users);
    }
    
    // Search users
    public function searchUsers() {
        $query = $_GET['q'] ?? '';
        
        if (strlen($query) < 2) {
            $this->sendError('Search query must be at least 2 characters', 400);
            return;
        }
        
        $users = $this->userModel->search($query);
        
        $this->sendSuccess($users);
    }
    
    // Get current user from token
    private function getCurrentUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }
        
        $jwt = new JWT();
        $payload = $jwt->verify($matches[1]);
        
        if (!$payload) {
            return null;
        }
        
        return $this->userModel->findById($payload['id']);
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