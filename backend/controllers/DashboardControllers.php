<?php
// backend/controllers/DashboardController.php

require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../models/User.php';

class DashboardController {
    private $leaveModel;
    private $userModel;
    
    public function __construct() {
        $this->leaveModel = new Leave();
        $this->userModel = new User();
    }
    
    public function getOverview($user) {
        $stats = [
            'leave_balance' => $this->leaveModel->getLeaveBalance($user['id']),
            'pending_applications' => $this->leaveModel->getPendingCount($user['id']),
            'approved_applications' => $this->leaveModel->getApprovedCount($user['id']),
            'rejected_applications' => $this->leaveModel->getRejectedCount($user['id']),
            'total_days_taken' => $this->leaveModel->getTotalDaysTaken($user['id']),
            'upcoming_leaves' => $this->leaveModel->getUpcomingLeaves($user['id']),
            'recent_activities' => $this->leaveModel->getRecentActivities($user['id'])
        ];
        
        $this->sendSuccess($stats);
    }
    
    public function getStats($user) {
        $stats = [
            'total_employees' => $this->userModel->getTotalCount(),
            'on_leave' => $this->leaveModel->getCurrentlyOnLeaveCount(),
            'pending_approvals' => $this->leaveModel->getPendingApprovalsCount($user),
            'completed_leaves' => $this->leaveModel->getCompletedCount()
        ];
        
        $this->sendSuccess($stats);
    }
    
    public function getRecentLeaves($user) {
        $recentLeaves = $this->leaveModel->getRecentLeaves($user['id'], 5);
        $this->sendSuccess($recentLeaves);
    }
    
    public function getUpcomingLeaves($user) {
        $upcomingLeaves = $this->leaveModel->getUpcomingLeaves($user['id'], 10);
        $this->sendSuccess($upcomingLeaves);
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $data]);
    }
}