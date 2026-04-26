<?php
require_once __DIR__ . '/../services/CalendarService.php';

class CalendarController {
    private $calendarService;
    
    public function __construct() {
        $this->calendarService = new CalendarService();
    }
    
    public function getHolidays($year) {
        $holidays = $this->calendarService->getHolidays($year);
        $this->sendSuccess($holidays);
    }
    
    public function getCurrentYearHolidays() {
        $year = date('Y');
        $holidays = $this->calendarService->getHolidays($year);
        $this->sendSuccess($holidays);
    }
    
    public function checkDate() {
        $date = $_GET['date'] ?? date('Y-m-d');
        $isHoliday = $this->calendarService->isHoliday(new DateTime($date));
        $isWeekend = $this->calendarService->isWeekend(new DateTime($date));
        
        $this->sendSuccess([
            'date' => $date,
            'is_holiday' => $isHoliday,
            'is_weekend' => $isWeekend,
            'is_working_day' => !$isHoliday && !$isWeekend
        ]);
    }
    
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $data]);
    }
}