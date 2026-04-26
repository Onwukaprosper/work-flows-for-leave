<?php
// backend/middleware/AuthMiddleware.php

require_once __DIR__ . '/../utils/JWT.php';

class AuthMiddleware {
    private $jwt;
    
    public function __construct() {
        $this->jwt = new JWT();
    }
    
    public function verifyToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return false;
        }
        
        $token = $matches[1];
        $payload = $this->jwt->verify($token);
        
        if (!$payload) {
            return false;
        }
        
        return $payload;
    }
}