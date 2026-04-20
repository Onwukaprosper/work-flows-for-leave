<?php
require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../services/CalendarService.php';

class LeaveController {
    private $leaveModel;
    private $notificationService;
    private $calendarService;
    
    public function __construct() {
        $this->leaveModel = new Leave();
        $this->notificationService = new NotificationService();
        $this->calendarService = new CalendarService();
    }
    
    // Approve leave with proper status flow
    public function approveLeave($user, $leaveId) {
        try {
            $leave = $this->leaveModel->getLeaveById($leaveId);
            if (!$leave) {
                return $this->sendError('Leave application not found', 404);
            }
            
            $newStatus = $this->determineNextStatus($leave['status'], $user['role']);
            $comment = $_POST['comment'] ?? null;
            
            // Update leave status
            $updated = $this->leaveModel->updateStatus($leaveId, $newStatus, [
                'comment' => $comment,
                'approved_by' => $user['id'],
                'approved_at' => date('Y-m-d H:i:s')
            ]);
            
            if ($updated) {
                // Log the action
                $this->logAction($leaveId, 'approve', $leave['status'], $newStatus, $comment, $user['id']);
                
                // Send email notification
                $applicant = $this->leaveModel->getUserById($leave['user_id']);
                $this->notificationService->sendLeaveApprovalEmail($applicant, $leave);
                
                // If fully approved, schedule reminder
                if ($newStatus === 'approved') {
                    $this->scheduleLeaveReminder($leave);
                }
                
                return $this->sendSuccess(['message' => 'Leave approved successfully', 'status' => $newStatus]);
            }
            
            return $this->sendError('Failed to approve leave', 500);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Reject leave with reason
    public function rejectLeave($user, $leaveId) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $reason = $input['reason'] ?? null;
            
            if (!$reason) {
                return $this->sendError('Rejection reason is required', 400);
            }
            
            $leave = $this->leaveModel->getLeaveById($leaveId);
            if (!$leave) {
                return $this->sendError('Leave application not found', 404);
            }
            
            $updated = $this->leaveModel->updateStatus($leaveId, 'rejected', [
                'rejection_reason' => $reason,
                'rejected_by' => $user['id'],
                'rejected_at' => date('Y-m-d H:i:s')
            ]);
            
            if ($updated) {
                // Log the action
                $this->logAction($leaveId, 'reject', $leave['status'], 'rejected', $reason, $user['id']);
                
                // Send rejection email
                $applicant = $this->leaveModel->getUserById($leave['user_id']);
                $this->notificationService->sendLeaveRejectionEmail($applicant, $leave, $reason);
                
                return $this->sendSuccess(['message' => 'Leave rejected', 'reason' => $reason]);
            }
            
            return $this->sendError('Failed to reject leave', 500);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Mark leave as active (staff has started leave)
    public function markAsActive($user, $leaveId) {
        try {
            $leave = $this->leaveModel->getLeaveById($leaveId);
            if (!$leave || $leave['status'] !== 'approved') {
                return $this->sendError('Leave cannot be activated', 400);
            }
            
            $updated = $this->leaveModel->updateStatus($leaveId, 'active', [
                'activated_at' => date('Y-m-d H:i:s')
            ]);
            
            if ($updated) {
                $this->logAction($leaveId, 'activate', 'approved', 'active', null, $user['id']);
                return $this->sendSuccess(['message' => 'Leave marked as active']);
            }
            
            return $this->sendError('Failed to activate leave', 500);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Mark leave as completed (staff returned to duty)
    public function markAsCompleted($user, $leaveId) {
        try {
            $leave = $this->leaveModel->getLeaveById($leaveId);
            if (!$leave) {
                return $this->sendError('Leave not found', 404);
            }
            
            // Calculate actual days taken
            $actualEndDate = date('Y-m-d');
            $actualDays = $this->calculateActualDays($leave['start_date'], $actualEndDate);
            
            $updated = $this->leaveModel->updateStatus($leaveId, 'completed', [
                'actual_end_date' => $actualEndDate,
                'actual_days' => $actualDays,
                'completed_at' => date('Y-m-d H:i:s')
            ]);
            
            if ($updated) {
                // Update user's remaining leave balance
                $daysUsed = $actualDays;
                $this->updateLeaveBalance($leave['user_id'], $daysUsed);
                
                $this->logAction($leaveId, 'complete', $leave['status'], 'completed', null, $user['id']);
                
                return $this->sendSuccess(['message' => 'Leave marked as completed', 'actual_days' => $actualDays]);
            }
            
            return $this->sendError('Failed to complete leave', 500);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Notify HOD that staff is back from leave
    public function notifyBackToDuty($user, $leaveId) {
        try {
            $leave = $this->leaveModel->getLeaveById($leaveId);
            if (!$leave) {
                return $this->sendError('Leave not found', 404);
            }
            
            // Update return notification
            $this->leaveModel->update($leaveId, [
                'return_notified_at' => date('Y-m-d H:i:s')
            ]);
            
            // Get HOD of the department
            $hod = $this->leaveModel->getDepartmentHOD($user['department_id']);
            
            if ($hod) {
                // Send notification to HOD
                $this->notificationService->sendBackToDutyNotification($hod, $user, $leave);
            }
            
            $this->logAction($leaveId, 'return_notified', $leave['status'], $leave['status'], 'Staff notified return to duty', $user['id']);
            
            return $this->sendSuccess(['message' => 'HOD notified of your return']);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Apply for leave with working days calculation
    public function createLeave($user) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $this->validateLeaveInput($input);
            
            // Calculate working days (excluding weekends and holidays)
            $startDate = new DateTime($input['start_date']);
            $endDate = new DateTime($input['end_date']);
            $workingDays = $this->calendarService->calculateWorkingDays($startDate, $endDate);
            
            // Check if user has enough balance
            $balance = $this->leaveModel->getLeaveBalance($user['id']);
            if ($workingDays > $balance['remaining_days']) {
                return $this->sendError('Insufficient leave balance', 400);
            }
            
            // Create leave application
            $leaveId = $this->leaveModel->create([
                'user_id' => $user['id'],
                'leave_type_id' => $input['leave_type_id'],
                'start_date' => $input['start_date'],
                'end_date' => $input['end_date'],
                'total_days' => $workingDays, // Use working days instead of calendar days
                'reason' => $input['reason'],
                'status' => 'pending'
            ]);

            //// Handle file upload if provided
            $documentPath = null;
        
            // Handle file upload
            if (isset($_FILES['document']) && $_FILES['document']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/leave_documents/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $file = $_FILES['document'];
                $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file['name']);
                $filePath = $uploadDir . $fileName;
                
                // Validate file type
                $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!in_array($file['type'], $allowedTypes)) {
                    throw new Exception('Invalid file type. Allowed: PDF, JPEG, PNG, DOC, DOCX');
                }
                
                // Validate size (max 5MB)
                if ($file['size'] > 5 * 1024 * 1024) {
                    throw new Exception('File too large. Max 5MB');
                }
                
                if (move_uploaded_file($file['tmp_name'], $filePath)) {
                    $documentPath = 'uploads/leave_documents/' . $fileName;
                }
            }
            
            // Create leave with document path
            $leaveId = $this->leaveModel->create([
                'user_id' => $user['id'],
                'leave_type_id' => $input['leave_type_id'],
                'start_date' => $input['start_date'],
                'end_date' => $input['end_date'],
                'total_days' => $workingDays,
                'reason' => $input['reason'],
                'document_path' => $documentPath,
                'status' => 'pending'
            ]);
            
            if ($leaveId) {
                // Notify HOD
                $hod = $this->leaveModel->getDepartmentHOD($user['department_id']);
                if ($hod) {
                    $this->notificationService->sendNewLeaveNotification($hod, $user, $input, $workingDays);
                }
                
                return $this->sendSuccess(['message' => 'Leave application submitted', 'id' => $leaveId, 'working_days' => $workingDays]);
            }
            
            return $this->sendError('Failed to submit leave application', 500);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 400);
        }
    }
    
    // Get pending approvals (with role-based filtering)
    public function getPendingApprovals($user) {
        try {
            $pending = [];
            
            if ($user['role'] === 'hod') {
                // HOD sees pending leaves from their department
                $pending = $this->leaveModel->getDepartmentPendingLeaves($user['department_id']);
            } elseif ($user['role'] === 'hr') {
                // HR sees leaves approved by HOD
                $pending = $this->leaveModel->getHRPendingLeaves();
            } elseif ($user['role'] === 'admin') {
                // Admin sees all pending
                $pending = $this->leaveModel->getAllPendingLeaves();
            }
            
            // Also get active leaves for the department
            $active = $this->leaveModel->getActiveLeaves($user['department_id']);
            
            return $this->sendSuccess([
                'pending' => $pending,
                'active' => $active
            ]);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), 500);
        }
    }
    
    // Schedule automatic reminders for leave ending soon
    private function scheduleLeaveReminder($leave) {
        $endDate = new DateTime($leave['end_date']);
        $today = new DateTime();
        $daysUntilEnd = $today->diff($endDate)->days;
        
        // Send reminder 3 days before leave ends
        if ($daysUntilEnd <= 3 && $daysUntilEnd >= 0) {
            $applicant = $this->leaveModel->getUserById($leave['user_id']);
            $this->notificationService->sendLeaveReminder($applicant, $leave);
        }
    }
    
    // Calculate actual working days taken
    private function calculateActualDays($startDate, $endDate) {
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        return $this->calendarService->calculateWorkingDays($start, $end);
    }
    
    // Update user's leave balance
    private function updateLeaveBalance($userId, $daysUsed) {
        $currentBalance = $this->leaveModel->getLeaveBalance($userId);
        $newBalance = $currentBalance['remaining_days'] - $daysUsed;
        $this->leaveModel->updateLeaveBalance($userId, $newBalance);
    }
    
    // Determine next status based on current status and approver role
    private function determineNextStatus($currentStatus, $approverRole) {
        if ($currentStatus === 'pending' && $approverRole === 'hod') {
            return 'hod_approved';
        }
        if ($currentStatus === 'hod_approved' && ($approverRole === 'hr' || $approverRole === 'admin')) {
            return 'approved';
        }
        return $currentStatus;
    }
    
    // Log all actions for audit trail
    private function logAction($leaveId, $action, $oldStatus, $newStatus, $comment, $userId) {
        $this->leaveModel->logAction([
            'leave_id' => $leaveId,
            'action' => $action,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'comment' => $comment,
            'performed_by' => $userId
        ]);
    }
    
    private function validateLeaveInput($input) {
        if (!isset($input['leave_type_id']) || !isset($input['start_date']) || !isset($input['end_date'])) {
            throw new Exception('Missing required fields');
        }
        
        $startDate = new DateTime($input['start_date']);
        $endDate = new DateTime($input['end_date']);
        $today = new DateTime();
        
        if ($startDate < $today) {
            throw new Exception('Start date cannot be in the past');
        }
        
        if ($endDate < $startDate) {
            throw new Exception('End date must be after start date');
        }
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(array_merge(['success' => true], $data));
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
    }
}