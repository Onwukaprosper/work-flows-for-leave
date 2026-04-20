<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/NotificationService.php';

$db = Database::getInstance();
$notificationService = new NotificationService();

// Get leaves ending in 3 days that haven't had a reminder sent
$query = "
    SELECT la.*, u.email, u.first_name, u.last_name, u.phone_number, lt.name as leave_type
    FROM leave_applications la
    JOIN users u ON la.user_id = u.id
    JOIN leave_types lt ON la.leave_type_id = lt.id
    WHERE la.status = 'approved'
    AND la.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    AND la.reminder_sent = FALSE
";

$stmt = $db->prepare($query);
$stmt->execute();
$leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($leaves as $leave) {
    // Send reminder
    $notificationService->sendLeaveReminder($leave, $leave);
    
    // Mark reminder as sent
    $update = "UPDATE leave_applications SET reminder_sent = TRUE WHERE id = :id";
    $updateStmt = $db->prepare($update);
    $updateStmt->execute([':id' => $leave['id']]);
    
    echo "Reminder sent for leave ID: {$leave['id']}\n";
}

echo "Reminder check completed.\n";