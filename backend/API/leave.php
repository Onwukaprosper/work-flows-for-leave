<?php
require_once "../config/database.php";
require_once "../middleware/auth.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

class LeaveAPI {
    private $conn;
    private $auth;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->auth = new Auth($this->conn);
    }

    // Create leave application
    public function createLeave() {
        $user = $this->auth->validateToken();
        $data = json_decode(file_get_contents("php://input"));

        // Validate input
        if (!isset($data->leave_type_id) || !isset($data->start_date) || !isset($data->end_date)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            return;
        }

        // Calculate total days
        $start = new DateTime($data->start_date);
        $end = new DateTime($data->end_date);
        $totalDays = $start->diff($end)->days + 1;

        // Check leave balance
        $query = "SELECT remaining_leave_days FROM users WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($totalDays > $userData['remaining_leave_days']) {
            http_response_code(400);
            echo json_encode(["error" => "Insufficient leave balance"]);
            return;
        }

        // Insert leave application
        $query = "INSERT INTO leave_applications 
                  (user_id, leave_type_id, start_date, end_date, total_days, reason) 
                  VALUES (:user_id, :leave_type_id, :start_date, :end_date, :total_days, :reason)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":leave_type_id", $data->leave_type_id);
        $stmt->bindParam(":start_date", $data->start_date);
        $stmt->bindParam(":end_date", $data->end_date);
        $stmt->bindParam(":total_days", $totalDays);
        $stmt->bindParam(":reason", $data->reason);

        if ($stmt->execute()) {
            $leaveId = $this->conn->lastInsertId();
            
            // Create notification for HOD
            $this->createNotification($user['hod_id'], "New Leave Application", 
                                      "Staff {$user['first_name']} {$user['last_name']} applied for leave");
            
            http_response_code(201);
            echo json_encode(["message" => "Leave application submitted", "id" => $leaveId]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to submit leave application"]);
        }
    }

    // Get leave applications for a user
    public function getUserLeaves($userId) {
        $user = $this->auth->validateToken();
        
        $query = "SELECT la.*, lt.name as leave_type_name 
                  FROM leave_applications la 
                  JOIN leave_types lt ON la.leave_type_id = lt.id 
                  WHERE la.user_id = :user_id 
                  ORDER BY la.applied_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($leaves);
    }

    // Approve leave (HOD)
    public function approveLeave($leaveId) {
        $user = $this->auth->validateToken();
        
        if ($user['role'] !== 'hod') {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized"]);
            return;
        }

        $query = "UPDATE leave_applications 
                  SET status = 'hod_approved', hod_approved_at = CURRENT_TIMESTAMP 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $leaveId);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Leave approved by HOD"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to approve leave"]);
        }
    }

    // Get leave balance
    public function getLeaveBalance($userId) {
        $user = $this->auth->validateToken();
        
        $query = "SELECT remaining_leave_days FROM users WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($balance);
    }

    private function createNotification($userId, $title, $message) {
        $query = "INSERT INTO notifications (user_id, title, message) VALUES (:user_id, :title, :message)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":message", $message);
        $stmt->execute();
    }
}

// Handle requests
$leaveAPI = new LeaveAPI();
$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'], '/'));

switch($method) {
    case 'POST':
        $leaveAPI->createLeave();
        break;
    case 'GET':
        if (isset($path[1])) {
            $leaveAPI->getUserLeaves($path[1]);
        } elseif (isset($path[0]) && $path[0] === 'balance') {
            $leaveAPI->getLeaveBalance($path[1]);
        }
        break;
    case 'PUT':
        if (isset($path[0]) && $path[0] === 'approve') {
            $leaveAPI->approveLeave($path[1]);
        }
        break;
}
?>