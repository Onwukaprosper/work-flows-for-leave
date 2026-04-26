<?php
// backend/controllers/ReportController.php

require_once __DIR__ . '/../models/Leave.php';
require_once __DIR__ . '/../models/User.php';

class ReportController {
    private $leaveModel;
    private $userModel;
    
    public function __construct() {
        $this->leaveModel = new Leave();
        $this->userModel = new User();
    }
    
    public function getReportsOverview() {
        $reports = [
            'monthly_summary' => $this->leaveModel->getMonthlySummary(),
            'department_summary' => $this->leaveModel->getDepartmentSummary(),
            'leave_type_summary' => $this->leaveModel->getLeaveTypeSummary(),
            'status_summary' => $this->leaveModel->getStatusSummary()
        ];
        
        $this->sendSuccess($reports);
    }
    
    public function getLeaveSummary() {
        $year = $_GET['year'] ?? date('Y');
        
        $summary = [
            'total_applications' => $this->leaveModel->getTotalApplications($year),
            'approved_count' => $this->leaveModel->getApprovedCountByYear($year),
            'pending_count' => $this->leaveModel->getPendingCountByYear($year),
            'rejected_count' => $this->leaveModel->getRejectedCountByYear($year),
            'total_days_taken' => $this->leaveModel->getTotalDaysByYear($year),
            'average_days_per_leave' => $this->leaveModel->getAverageDaysByYear($year)
        ];
        
        $this->sendSuccess($summary);
    }
    
    public function getDepartmentReport() {
        $department = $_GET['department'] ?? null;
        $year = $_GET['year'] ?? date('Y');
        
        if ($department) {
            $report = $this->leaveModel->getDepartmentReport($department, $year);
        } else {
            $report = $this->leaveModel->getAllDepartmentsReport($year);
        }
        
        $this->sendSuccess($report);
    }
    
    public function getMonthlyReport() {
        $year = $_GET['year'] ?? date('Y');
        $month = $_GET['month'] ?? date('m');
        
        $report = $this->leaveModel->getMonthlyReport($year, $month);
        $this->sendSuccess($report);
    }
    
    public function exportReport() {
        $type = $_GET['type'] ?? 'csv';
        $data = $this->getReportData();
        
        if ($type === 'csv') {
            $this->exportCSV($data);
        } elseif ($type === 'pdf') {
            $this->exportPDF($data);
        } else {
            $this->sendError('Invalid export format');
        }
    }
    
    private function exportCSV($data) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="leave_report.csv"');
        
        $output = fopen('php://output', 'w');
        fputcsv($output, array_keys($data[0] ?? []));
        
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        fclose($output);
    }
    
    private function exportPDF($data) {
        // Use a PDF library like TCPDF or FPDF
        // For now, redirect to CSV
        $this->exportCSV($data);
    }
    
    private function getReportData() {
        return $this->leaveModel->getAllLeavesForExport();
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $data]);
    }
    
    private function sendError($message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $message]);
    }
}