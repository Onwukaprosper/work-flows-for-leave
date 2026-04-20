<?php
// require_once __DIR__ . '/../vendor/autoload.php';

// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\SMTP;
// use PHPMailer\PHPMailer\Exception;

// class NotificationService {
//     private $mailer;
//     private $db;
    
//     public function __construct() {
//         $this->db = Database::getInstance();
//         $this->initMailer();
//     }
    
//     private function initMailer() {
//         $this->mailer = new PHPMailer(true);
//         $this->mailer->isSMTP();
//         $this->mailer->Host = getenv('SMTP_HOST');
//         $this->mailer->SMTPAuth = true;
//         $this->mailer->Username = getenv('SMTP_USER');
//         $this->mailer->Password = getenv('SMTP_PASS');
//         $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
//         $this->mailer->Port = getenv('SMTP_PORT');
//         $this->mailer->setFrom(getenv('SMTP_FROM'), 'MOUAU Leave Management System');
//     }
    
//     public function sendLeaveApprovalEmail($user, $leave) {
//         $subject = "Leave Application Approved - MOUAU";
//         $htmlBody = $this->getApprovalEmailTemplate($user, $leave);
//         $textBody = strip_tags($htmlBody);
        
//         return $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
//     }
    
//     public function sendLeaveRejectionEmail($user, $leave, $reason) {
//         $subject = "Leave Application Update - MOUAU";
//         $htmlBody = $this->getRejectionEmailTemplate($user, $leave, $reason);
//         $textBody = strip_tags($htmlBody);
        
//         return $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
//     }
    
//     public function sendLeaveReminder($user, $leave) {
//         $subject = "Leave Ending Soon - Return to Duty Reminder";
//         $htmlBody = $this->getReminderEmailTemplate($user, $leave);
//         $textBody = strip_tags($htmlBody);
        
//         $emailSent = $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
        
//         // Also send SMS if phone number is available
//         if (!empty($user['phone_number'])) {
//             $this->sendSMS($user['phone_number'], "Reminder: Your leave ends on {$leave['end_date']}. Please return to duty.");
//         }
        
//         return $emailSent;
//     }
    
//     public function sendNewLeaveNotification($hod, $staff, $leave, $workingDays) {
//         $subject = "New Leave Application - Action Required";
//         $htmlBody = "
//             <h2>New Leave Application Pending Approval</h2>
//             <p>Dear {$hod['first_name']} {$hod['last_name']},</p>
//             <p>A new leave application requires your attention.</p>
//             <p><strong>Staff:</strong> {$staff['first_name']} {$staff['last_name']}<br>
//             <strong>Department:</strong> {$staff['department']}<br>
//             <strong>Leave Type:</strong> {$leave['leave_type']}<br>
//             <strong>Duration:</strong> {$leave['start_date']} to {$leave['end_date']}<br>
//             <strong>Working Days:</strong> {$workingDays} days<br>
//             <strong>Reason:</strong> {$leave['reason']}</p>
//             <p>Please login to the leave management system to review and approve this request.</p>
//             <a href='https://mouau.edu.ng/leave/approvals' 
//                style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
//                 Review Application
//             </a>
//         ";
        
//         return $this->sendEmail($hod['email'], $subject, $htmlBody);
//     }
    
//     public function sendBackToDutyNotification($hod, $staff, $leave) {
//         $subject = "Staff Returned to Duty - {$staff['first_name']} {$staff['last_name']}";
//         $htmlBody = "
//             <h2>Staff Return Notification</h2>
//             <p>Dear {$hod['first_name']} {$hod['last_name']},</p>
//             <p>{$staff['first_name']} {$staff['last_name']} has notified that they have returned to duty.</p>
//             <p><strong>Leave Details:</strong><br>
//             Type: {$leave['leave_type']}<br>
//             Period: {$leave['start_date']} to {$leave['end_date']}<br>
//             Return Date: " . date('Y-m-d') . "</p>
//             <p>Please login to mark their leave as completed in the system.</p>
//         ";
        
//         return $this->sendEmail($hod['email'], $subject, $htmlBody);
//     }
    
//     private function sendEmail($to, $subject, $htmlBody, $textBody = null) {
//         try {
//             $this->mailer->clearAddresses();
//             $this->mailer->addAddress($to);
//             $this->mailer->Subject = $subject;
//             $this->mailer->isHTML(true);
//             $this->mailer->Body = $htmlBody;
//             $this->mailer->AltBody = $textBody ?: strip_tags($htmlBody);
            
//             $result = $this->mailer->send();
            
//             // Log notification
//             $this->logNotification($to, $subject, 'email', 'sent');
            
//             return $result;
//         } catch (Exception $e) {
//             error_log("Email failed: " . $this->mailer->ErrorInfo);
//             $this->logNotification($to, $subject, 'email', 'failed', $this->mailer->ErrorInfo);
//             return false;
//         }
//     }
    
//     private function sendSMS($phoneNumber, $message) {
//         // Integrate with Africa's Talking or other SMS gateway
//         $username = getenv('SMS_USERNAME');
//         $apiKey = getenv('SMS_API_KEY');
        
//         $url = 'https://api.africastalking.com/version1/messaging';
//         $data = [
//             'username' => $username,
//             'to' => $phoneNumber,
//             'message' => $message,
//             'from' => 'MOUAU'
//         ];
        
//         $ch = curl_init();
//         curl_setopt($ch, CURLOPT_URL, $url);
//         curl_setopt($ch, CURLOPT_POST, true);
//         curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
//         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//         curl_setopt($ch, CURLOPT_HTTPHEADER, [
//             'ApiKey: ' . $apiKey,
//             'Content-Type: application/x-www-form-urlencoded',
//             'Accept: application/json'
//         ]);
        
//         $response = curl_exec($ch);
//         $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
//         curl_close($ch);
        
//         $success = $httpCode === 201;
//         $this->logNotification($phoneNumber, $message, 'sms', $success ? 'sent' : 'failed');
        
//         return $success;
//     }
    
//     private function logNotification($recipient, $subject, $type, $status, $error = null) {
//         $query = "INSERT INTO notification_logs (user_id, type, subject, message, status, error_message, sent_at) 
//                   VALUES (NULL, :type, :subject, :message, :status, :error, NOW())";
        
//         $stmt = $this->db->prepare($query);
//         $stmt->execute([
//             ':type' => $type,
//             ':subject' => $subject,
//             ':message' => $recipient,
//             ':status' => $status,
//             ':error' => $error
//         ]);
//     }
    
//     private function getApprovalEmailTemplate($user, $leave) {
//         return "
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
//                     .content { padding: 20px; background: #f9fafb; }
//                     .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
//                     .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
//                 </style>
//             </head>
//             <body>
//                 <div class='container'>
//                     <div class='header'>
//                         <h1>Leave Application Approved</h1>
//                     </div>
//                     <div class='content'>
//                         <p>Dear {$user['first_name']} {$user['last_name']},</p>
//                         <p>Your leave application has been <strong style='color: #10b981;'>approved</strong>.</p>
//                         <h3>Leave Details:</h3>
//                         <ul>
//                             <li><strong>Type:</strong> {$leave['leave_type']}</li>
//                             <li><strong>Duration:</strong> {$leave['start_date']} to {$leave['end_date']}</li>
//                             <li><strong>Total Working Days:</strong> {$leave['total_days']} days</li>
//                         </ul>
//                         <p>Please remember to:</p>
//                         <ul>
//                             <li>Check your leave balance before resuming</li>
//                             <li>Notify your HOD when you return to duty</li>
//                             <li>Complete any pending handovers before proceeding on leave</li>
//                         </ul>
//                         <p>You will receive a reminder 3 days before your leave ends.</p>
//                         <br>
//                         <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
//                     </div>
//                     <div class='footer'>
//                         <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         ";
//     }
    
//     private function getRejectionEmailTemplate($user, $leave, $reason) {
//         return "
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
//                     .content { padding: 20px; background: #f9fafb; }
//                     .reason-box { background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
//                 </style>
//             </head>
//             <body>
//                 <div class='container'>
//                     <div class='header'>
//                         <h1>Leave Application Update</h1>
//                     </div>
//                     <div class='content'>
//                         <p>Dear {$user['first_name']} {$user['last_name']},</p>
//                         <p>Your leave application has been <strong style='color: #dc2626;'>reviewed</strong>.</p>
//                         <div class='reason-box'>
//                             <strong>Reason for not being approved:</strong><br>
//                             {$reason}
//                         </div>
//                         <p>Please contact your HOD or HR department for further clarification.</p>
//                         <p>You may submit a new application after addressing the concerns above.</p>
//                         <br>
//                         <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
//                     </div>
//                     <div class='footer'>
//                         <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         ";
//     }
    
//     private function getReminderEmailTemplate($user, $leave) {
//         return "
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                     .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
//                     .content { padding: 20px; background: #f9fafb; }
//                     .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
//                 </style>
//             </head>
//             <body>
//                 <div class='container'>
//                     <div class='header'>
//                         <h1>Leave Ending Reminder</h1>
//                     </div>
//                     <div class='content'>
//                         <p>Dear {$user['first_name']} {$user['last_name']},</p>
//                         <p>This is a reminder that your leave ends on <strong>{$leave['end_date']}</strong>.</p>
//                         <h3>Action Required:</h3>
//                         <ul>
//                             <li>Please report back to duty on {$leave['end_date']}</li>
//                             <li>Notify your HOD of your return</li>
//                             <li>Update your leave status in the system</li>
//                         </ul>
//                         <p style='text-align: center; margin-top: 30px;'>
//                             <a href='https://mouau.edu.ng/leave/return/{$leave['id']}' class='button'>
//                                 Click Here to Confirm Return to Duty
//                             </a>
//                         </p>
//                         <p style='margin-top: 20px;'>If you have already returned, please ignore this message.</p>
//                         <br>
//                         <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
//                     </div>
//                     <div class='footer'>
//                         <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         ";
//     }
// }


require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class NotificationService {
    private $mailer;
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->initMailer();
    }
    
    private function initMailer() {
        $this->mailer = new PHPMailer(true);
        $this->mailer->isSMTP();
        $this->mailer->Host = getenv('SMTP_HOST');
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = getenv('SMTP_USER');
        $this->mailer->Password = getenv('SMTP_PASS');
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = getenv('SMTP_PORT');
        $this->mailer->setFrom(getenv('SMTP_FROM'), 'MOUAU Leave Management System');
    }
    
    public function sendLeaveApprovalEmail($user, $leave) {
        $subject = "Leave Application Approved - MOUAU";
        $htmlBody = $this->getApprovalEmailTemplate($user, $leave);
        $textBody = strip_tags($htmlBody);
        
        return $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
    }
    
    public function sendLeaveRejectionEmail($user, $leave, $reason) {
        $subject = "Leave Application Update - MOUAU";
        $htmlBody = $this->getRejectionEmailTemplate($user, $leave, $reason);
        $textBody = strip_tags($htmlBody);
        
        return $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
    }
    
    public function sendLeaveReminder($user, $leave) {
        $subject = "Leave Ending Soon - Return to Duty Reminder";
        $htmlBody = $this->getReminderEmailTemplate($user, $leave);
        $textBody = strip_tags($htmlBody);
        
        $emailSent = $this->sendEmail($user['email'], $subject, $htmlBody, $textBody);
        
        // Also send SMS if phone number is available
        if (!empty($user['phone_number'])) {
            $this->sendSMS($user['phone_number'], "Reminder: Your leave ends on {$leave['end_date']}. Please return to duty.");
        }
        
        return $emailSent;
    }
    
    public function sendNewLeaveNotification($hod, $staff, $leave, $workingDays) {
        $subject = "New Leave Application - Action Required";
        $htmlBody = "
            <h2>New Leave Application Pending Approval</h2>
            <p>Dear {$hod['first_name']} {$hod['last_name']},</p>
            <p>A new leave application requires your attention.</p>
            <p><strong>Staff:</strong> {$staff['first_name']} {$staff['last_name']}<br>
            <strong>Department:</strong> {$staff['department']}<br>
            <strong>Leave Type:</strong> {$leave['leave_type']}<br>
            <strong>Duration:</strong> {$leave['start_date']} to {$leave['end_date']}<br>
            <strong>Working Days:</strong> {$workingDays} days<br>
            <strong>Reason:</strong> {$leave['reason']}</p>
            <p>Please login to the leave management system to review and approve this request.</p>
            <a href='https://mouau.edu.ng/leave/approvals' 
               style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Review Application
            </a>
        ";
        
        return $this->sendEmail($hod['email'], $subject, $htmlBody);
    }
    
    public function sendBackToDutyNotification($hod, $staff, $leave) {
        $subject = "Staff Returned to Duty - {$staff['first_name']} {$staff['last_name']}";
        $htmlBody = "
            <h2>Staff Return Notification</h2>
            <p>Dear {$hod['first_name']} {$hod['last_name']},</p>
            <p>{$staff['first_name']} {$staff['last_name']} has notified that they have returned to duty.</p>
            <p><strong>Leave Details:</strong><br>
            Type: {$leave['leave_type']}<br>
            Period: {$leave['start_date']} to {$leave['end_date']}<br>
            Return Date: " . date('Y-m-d') . "</p>
            <p>Please login to mark their leave as completed in the system.</p>
        ";
        
        return $this->sendEmail($hod['email'], $subject, $htmlBody);
    }
    
    private function sendEmail($to, $subject, $htmlBody, $textBody = null) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($to);
            $this->mailer->Subject = $subject;
            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $textBody ?: strip_tags($htmlBody);
            
            $result = $this->mailer->send();
            
            // Log notification
            $this->logNotification($to, $subject, 'email', 'sent');
            
            return $result;
        } catch (Exception $e) {
            error_log("Email failed: " . $this->mailer->ErrorInfo);
            $this->logNotification($to, $subject, 'email', 'failed', $this->mailer->ErrorInfo);
            return false;
        }
    }
    
    private function sendSMS($phoneNumber, $message) {
        // Integrate with Africa's Talking or other SMS gateway
        $username = getenv('SMS_USERNAME');
        $apiKey = getenv('SMS_API_KEY');
        
        $url = 'https://api.africastalking.com/version1/messaging';
        $data = [
            'username' => $username,
            'to' => $phoneNumber,
            'message' => $message,
            'from' => 'MOUAU'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'ApiKey: ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $success = $httpCode === 201;
        $this->logNotification($phoneNumber, $message, 'sms', $success ? 'sent' : 'failed');
        
        return $success;
    }
    
    private function logNotification($recipient, $subject, $type, $status, $error = null) {
        $query = "INSERT INTO notification_logs (user_id, type, subject, message, status, error_message, sent_at) 
                  VALUES (NULL, :type, :subject, :message, :status, :error, NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':type' => $type,
            ':subject' => $subject,
            ':message' => $recipient,
            ':status' => $status,
            ':error' => $error
        ]);
    }
    
    private function getApprovalEmailTemplate($user, $leave) {
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Leave Application Approved</h1>
                    </div>
                    <div class='content'>
                        <p>Dear {$user['first_name']} {$user['last_name']},</p>
                        <p>Your leave application has been <strong style='color: #10b981;'>approved</strong>.</p>
                        <h3>Leave Details:</h3>
                        <ul>
                            <li><strong>Type:</strong> {$leave['leave_type']}</li>
                            <li><strong>Duration:</strong> {$leave['start_date']} to {$leave['end_date']}</li>
                            <li><strong>Total Working Days:</strong> {$leave['total_days']} days</li>
                        </ul>
                        <p>Please remember to:</p>
                        <ul>
                            <li>Check your leave balance before resuming</li>
                            <li>Notify your HOD when you return to duty</li>
                            <li>Complete any pending handovers before proceeding on leave</li>
                        </ul>
                        <p>You will receive a reminder 3 days before your leave ends.</p>
                        <br>
                        <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
                    </div>
                    <div class='footer'>
                        <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
    }
    
    private function getRejectionEmailTemplate($user, $leave, $reason) {
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .reason-box { background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Leave Application Update</h1>
                    </div>
                    <div class='content'>
                        <p>Dear {$user['first_name']} {$user['last_name']},</p>
                        <p>Your leave application has been <strong style='color: #dc2626;'>reviewed</strong>.</p>
                        <div class='reason-box'>
                            <strong>Reason for not being approved:</strong><br>
                            {$reason}
                        </div>
                        <p>Please contact your HOD or HR department for further clarification.</p>
                        <p>You may submit a new application after addressing the concerns above.</p>
                        <br>
                        <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
                    </div>
                    <div class='footer'>
                        <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
    }
    
    private function getReminderEmailTemplate($user, $leave) {
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9fafb; }
                    .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Leave Ending Reminder</h1>
                    </div>
                    <div class='content'>
                        <p>Dear {$user['first_name']} {$user['last_name']},</p>
                        <p>This is a reminder that your leave ends on <strong>{$leave['end_date']}</strong>.</p>
                        <h3>Action Required:</h3>
                        <ul>
                            <li>Please report back to duty on {$leave['end_date']}</li>
                            <li>Notify your HOD of your return</li>
                            <li>Update your leave status in the system</li>
                        </ul>
                        <p style='text-align: center; margin-top: 30px;'>
                            <a href='https://mouau.edu.ng/leave/return/{$leave['id']}' class='button'>
                                Click Here to Confirm Return to Duty
                            </a>
                        </p>
                        <p style='margin-top: 20px;'>If you have already returned, please ignore this message.</p>
                        <br>
                        <p>Best regards,<br><strong>MOUAU HR Department</strong></p>
                    </div>
                    <div class='footer'>
                        <p>© " . date('Y') . " MOUAU Leave Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
    }
}