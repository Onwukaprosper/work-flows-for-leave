<?php
require_once '../controllers/AuthController.php';
require_once '../controllers/LeaveController.php';
require_once '../controllers/UserController.php';
require_once '../controllers/ReportController.php';
require_once '../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route handling
switch ($path[0] ?? '') {
    case 'auth':
        $controller = new AuthController();
        if ($method === 'POST' && ($path[1] ?? '') === 'login') {
            $controller->login();
        } elseif ($method === 'POST' && ($path[1] ?? '') === 'logout') {
            $controller->logout();
        }
        break;
        
    case 'leave':
        $controller = new LeaveController();
        $auth = new Auth();
        $user = $auth->validateToken();
        
        if ($method === 'GET') {
            if (isset($path[1]) && $path[1] === 'balance') {
                $controller->getBalance($user['id']);
            } elseif (isset($path[1]) && $path[1] === 'history') {
                $controller->getHistory($user['id']);
            } elseif (isset($path[1]) && $path[1] === 'pending') {
                $controller->getPendingApprovals($user);
            } else {
                $controller->getUserLeaves($user['id']);
            }
        } elseif ($method === 'POST') {
            $controller->createLeave($user);
        } elseif ($method === 'PUT') {
            if (isset($path[1]) && $path[1] === 'approve') {
                $controller->approveLeave($user, $path[2] ?? null);
            } elseif (isset($path[1]) && $path[1] === 'reject') {
                $controller->rejectLeave($user, $path[2] ?? null);
            }
        }
        break;
        
    case 'users':
        $controller = new UserController();
        $auth = new Auth();
        $user = $auth->validateToken();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        if ($method === 'GET') {
            $controller->getAllUsers();
        } elseif ($method === 'POST') {
            $controller->createUser();
        } elseif ($method === 'PUT' && isset($path[1])) {
            $controller->updateUser($path[1]);
        }
        break;
        
    case 'reports':
        $controller = new ReportController();
        $auth = new Auth();
        $user = $auth->validateToken();
        
        if (!in_array($user['role'], ['hr', 'admin'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        if ($method === 'GET') {
            if (isset($path[1]) && $path[1] === 'department') {
                $controller->getDepartmentReport();
            } elseif (isset($path[1]) && $path[1] === 'monthly') {
                $controller->getMonthlyReport();
            } else {
                $controller->getSummary();
            }
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}