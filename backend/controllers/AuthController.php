<?php
// backend/controllers/AuthController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../services/NotificationService.php';

class AuthController {
    private $userModel;
    private $jwt;
    private $notificationService;
    
    public function __construct() {
        $this->userModel = new User();
        $this->jwt = new JWT();
        $this->notificationService = new NotificationService();
    }
    
    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            $this->sendError('Email and password are required', 400);
            return;
        }
        
        $user = $this->userModel->findByEmail($input['email']);
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            $this->sendError('Invalid email or password', 401);
            return;
        }
        
        if (!$user['is_active']) {
            $this->sendError('Account is disabled. Contact administrator.', 403);
            return;
        }
        
        // Update last login
        $this->userModel->updateLastLogin($user['id']);
        
        // Generate JWT token
        $token = $this->jwt->generate([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'staff_id' => $user['staff_id']
        ]);
        
        // Remove sensitive data
        unset($user['password_hash']);
        
        $this->sendSuccess([
            'token' => $token,
            'user' => $user
        ]);
    }
    
    public function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        $required = ['staff_id', 'email', 'first_name', 'last_name', 'password'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->sendError("$field is required", 400);
                return;
            }
        }
        
        // Check if user exists
        if ($this->userModel->findByEmail($input['email'])) {
            $this->sendError('Email already registered', 400);
            return;
        }
        
        if ($this->userModel->findByStaffId($input['staff_id'])) {
            $this->sendError('Staff ID already exists', 400);
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
            'role' => 'staff',
            'phone_number' => $input['phone_number'] ?? null
        ]);
        
        if ($userId) {
            // Send welcome notification
            $user = $this->userModel->findById($userId);
            $this->notificationService->sendWelcomeEmail($user);
            
            $this->sendSuccess(['message' => 'Registration successful', 'user_id' => $userId]);
        } else {
            $this->sendError('Registration failed', 500);
        }
    }
    
    public function forgotPassword() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['email'])) {
            $this->sendError('Email is required', 400);
            return;
        }
        
        $user = $this->userModel->findByEmail($input['email']);
        
        if (!$user) {
            // Don't reveal that email doesn't exist for security
            $this->sendSuccess(['message' => 'If the email exists, a reset link has been sent']);
            return;
        }
        
        // Generate reset token
        $resetToken = bin2hex(random_bytes(32));
        $this->userModel->saveResetToken($user['id'], $resetToken);
        
        // Send reset email
        $this->notificationService->sendPasswordResetEmail($user, $resetToken);
        
        $this->sendSuccess(['message' => 'Password reset instructions sent to your email']);
    }
    
    public function resetPassword() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['token']) || empty($input['new_password'])) {
            $this->sendError('Token and new password are required', 400);
            return;
        }
        
        $user = $this->userModel->findByResetToken($input['token']);
        
        if (!$user) {
            $this->sendError('Invalid or expired reset token', 400);
            return;
        }
        
        // Update password
        $this->userModel->updatePassword($user['id'], password_hash($input['new_password'], PASSWORD_DEFAULT));
        $this->userModel->clearResetToken($user['id']);
        
        $this->sendSuccess(['message' => 'Password reset successful']);
    }
    
    public function logout() {
        // JWT is stateless, just return success
        $this->sendSuccess(['message' => 'Logged out successfully']);
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