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


// Leave routes with new endpoints
$router->post('/leave', 'LeaveController@createLeave');
$router->get('/leave/user/{id}', 'LeaveController@getUserLeaves');
$router->get('/leave/balance/{id}', 'LeaveController@getLeaveBalance');
$router->get('/leave/pending', 'LeaveController@getPendingApprovals');
$router->put('/leave/approve/{id}', 'LeaveController@approveLeave');
$router->put('/leave/reject/{id}', 'LeaveController@rejectLeave');
$router->put('/leave/activate/{id}', 'LeaveController@markAsActive');
$router->put('/leave/complete/{id}', 'LeaveController@markAsCompleted');
$router->post('/leave/return-notify/{id}', 'LeaveController@notifyBackToDuty');

// Holiday routes
$router->get('/holidays/{year}', 'CalendarController@getHolidays');
$router->get('/holidays/check', 'CalendarController@checkDate');

// Notification routes
$router->get('/notifications', 'NotificationController@getNotifications');
$router->put('/notifications/{id}/read', 'NotificationController@markAsRead');
$router->post('/notifications/send-reminder', 'NotificationController@sendReminder');


// Leave routes with new endpoints
$router->post('/leave', 'LeaveController@createLeave');
$router->get('/leave/user/{id}', 'LeaveController@getUserLeaves');
$router->get('/leave/balance/{id}', 'LeaveController@getLeaveBalance');
$router->get('/leave/pending', 'LeaveController@getPendingApprovals');
$router->put('/leave/approve/{id}', 'LeaveController@approveLeave');
$router->put('/leave/reject/{id}', 'LeaveController@rejectLeave');
$router->put('/leave/activate/{id}', 'LeaveController@markAsActive');
$router->put('/leave/complete/{id}', 'LeaveController@markAsCompleted');
$router->post('/leave/return-notify/{id}', 'LeaveController@notifyBackToDuty');

// Holiday routes
$router->get('/holidays/{year}', 'CalendarController@getHolidays');
$router->get('/holidays/check', 'CalendarController@checkDate');

// Notification routes
$router->get('/notifications', 'NotificationController@getNotifications');
$router->put('/notifications/{id}/read', 'NotificationController@markAsRead');
$router->post('/notifications/send-reminder', 'NotificationController@sendReminder');



// Serve uploaded files (protected)
$router->get('/uploads/{filename}', function($filename) {
    $filePath = __DIR__ . '/../uploads/leave_documents/' . basename($filename);
    if (file_exists($filePath)) {
        header('Content-Type: ' . mime_content_type($filePath));
        header('Content-Disposition: inline; filename="' . $filename . '"');
        readfile($filePath);
        exit;
    }
    http_response_code(404);
    echo "File not found";
});

// <?php

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/LeaveController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../controllers/DepartmentController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';

// Enable CORS
CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$auth = new AuthMiddleware();

// Public routes
if ($path[0] === 'auth') {
    $controller = new AuthController();
    if ($method === 'POST' && ($path[1] ?? '') === 'login') {
        $controller->login();
    } elseif ($method === 'POST' && ($path[1] ?? '') === 'logout') {
        $controller->logout();
    } elseif ($method === 'POST' && ($path[1] ?? '') === 'forgot-password') {
        $controller->forgotPassword();
    } elseif ($method === 'POST' && ($path[1] ?? '') === 'reset-password') {
        $controller->resetPassword();
    } elseif ($method === 'POST' && ($path[1] ?? '') === 'register') {
        $controller->register();
    }
    exit;
}

// Protected routes - verify token for all remaining routes
$user = $auth->verifyToken();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Dashboard routes
if ($path[0] === 'dashboard') {
    $controller = new DashboardController();
    if ($method === 'GET') {
        if (isset($path[1]) && $path[1] === 'stats') {
            $controller->getStats($user);
        } elseif (isset($path[1]) && $path[1] === 'recent-leaves') {
            $controller->getRecentLeaves($user);
        } elseif (isset($path[1]) && $path[1] === 'upcoming-leaves') {
            $controller->getUpcomingLeaves($user);
        } else {
            $controller->getOverview($user);
        }
    }
    exit;
}

// Leave routes
if ($path[0] === 'leave') {
    $controller = new LeaveController();
    
    if ($method === 'GET') {
        if (isset($path[1]) && $path[1] === 'balance') {
            $controller->getBalance($user['id']);
        } elseif (isset($path[1]) && $path[1] === 'history') {
            $controller->getHistory($user['id']);
        } elseif (isset($path[1]) && $path[1] === 'pending') {
            $controller->getPendingApprovals($user);
        } elseif (isset($path[1]) && $path[1] === 'calendar') {
            $controller->getCalendarEvents($user);
        } elseif (isset($path[1]) && is_numeric($path[1])) {
            $controller->getLeaveById($path[1], $user);
        } else {
            $controller->getUserLeaves($user['id']);
        }
    } elseif ($method === 'POST') {
        $controller->createLeave($user);
    } elseif ($method === 'PUT') {
        if (isset($path[1]) && $path[1] === 'approve' && isset($path[2])) {
            $controller->approveLeave($user, $path[2]);
        } elseif (isset($path[1]) && $path[1] === 'reject' && isset($path[2])) {
            $controller->rejectLeave($user, $path[2]);
        } elseif (isset($path[1]) && $path[1] === 'activate' && isset($path[2])) {
            $controller->markAsActive($user, $path[2]);
        } elseif (isset($path[1]) && $path[1] === 'complete' && isset($path[2])) {
            $controller->markAsCompleted($user, $path[2]);
        }
    } elseif ($method === 'POST' && isset($path[1]) && $path[1] === 'return-notify' && isset($path[2])) {
        $controller->notifyBackToDuty($user, $path[2]);
    }
    exit;
}

// User management routes (admin only)
if ($path[0] === 'users') {
    $controller = new UserController();
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    
    if ($method === 'GET') {
        if (isset($path[1]) && is_numeric($path[1])) {
            $controller->getUserById($path[1]);
        } else {
            $controller->getAllUsers();
        }
    } elseif ($method === 'POST') {
        $controller->createUser();
    } elseif ($method === 'PUT' && isset($path[1]) && is_numeric($path[1])) {
        $controller->updateUser($path[1]);
    } elseif ($method === 'DELETE' && isset($path[1]) && is_numeric($path[1])) {
        $controller->deleteUser($path[1]);
    }
    exit;
}

// Department routes
if ($path[0] === 'departments') {
    $controller = new DepartmentController();
    
    if ($method === 'GET') {
        if (isset($path[1]) && is_numeric($path[1])) {
            $controller->getDepartmentById($path[1]);
        } else {
            $controller->getAllDepartments();
        }
    } elseif ($method === 'POST' && in_array($user['role'], ['admin', 'hr'])) {
        $controller->createDepartment();
    } elseif ($method === 'PUT' && isset($path[1]) && in_array($user['role'], ['admin', 'hr'])) {
        $controller->updateDepartment($path[1]);
    } elseif ($method === 'DELETE' && isset($path[1]) && $user['role'] === 'admin') {
        $controller->deleteDepartment($path[1]);
    }
    exit;
}

// Reports routes (HR/Admin only)
if ($path[0] === 'reports') {
    $controller = new ReportController();
    
    if (!in_array($user['role'], ['hr', 'admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    
    if ($method === 'GET') {
        if (isset($path[1]) && $path[1] === 'leave-summary') {
            $controller->getLeaveSummary();
        } elseif (isset($path[1]) && $path[1] === 'department-report') {
            $controller->getDepartmentReport();
        } elseif (isset($path[1]) && $path[1] === 'monthly-report') {
            $controller->getMonthlyReport();
        } elseif (isset($path[1]) && $path[1] === 'export') {
            $controller->exportReport();
        } else {
            $controller->getReportsOverview();
        }
    }
    exit;
}

// Notifications routes
if ($path[0] === 'notifications') {
    $controller = new NotificationController();
    
    if ($method === 'GET') {
        if (isset($path[1]) && $path[1] === 'unread-count') {
            $controller->getUnreadCount($user['id']);
        } else {
            $controller->getNotifications($user['id']);
        }
    } elseif ($method === 'PUT' && isset($path[1]) && $path[2] === 'read') {
        $controller->markAsRead($user['id'], $path[1]);
    } elseif ($method === 'PUT' && isset($path[1]) && $path[1] === 'read-all') {
        $controller->markAllAsRead($user['id']);
    } elseif ($method === 'DELETE' && isset($path[1])) {
        $controller->deleteNotification($user['id'], $path[1]);
    }
    exit;
}

// Profile routes
if ($path[0] === 'profile') {
    $controller = new UserController();
    
    if ($method === 'GET') {
        $controller->getProfile($user['id']);
    } elseif ($method === 'PUT') {
        $controller->updateProfile($user['id']);
    } elseif ($method === 'PUT' && isset($path[1]) && $path[1] === 'password') {
        $controller->changePassword($user['id']);
    }
    exit;
}

// Holidays routes
if ($path[0] === 'holidays') {
    $controller = new CalendarController();
    
    if ($method === 'GET') {
        if (isset($path[1]) && $path[1] === 'check') {
            $controller->checkDate();
        } elseif (isset($path[1]) && is_numeric($path[1])) {
            $controller->getHolidays($path[1]);
        } else {
            $controller->getCurrentYearHolidays();
        }
    }
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'Route not found']);