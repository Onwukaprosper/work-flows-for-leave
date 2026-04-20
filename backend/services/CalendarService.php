<?php
// class CalendarService {
//     private $googleApiKey;
//     private $calendarId;
    
//     public function __construct() {
//         $this->googleApiKey = getenv('GOOGLE_API_KEY');
//         $this->calendarId = 'en.ng#holiday@group.v.calendar.google.com';
//     }
    
//     public function calculateWorkingDays(DateTime $startDate, DateTime $endDate): int {
//         $workingDays = 0;
//         $currentDate = clone $startDate;
        
//         while ($currentDate <= $endDate) {
//             if (!$this->isWeekend($currentDate) && !$this->isHoliday($currentDate)) {
//                 $workingDays++;
//             }
//             $currentDate->modify('+1 day');
//         }
        
//         return $workingDays;
//     }
    
//     private function isWeekend(DateTime $date): bool {
//         $day = $date->format('N'); // 1 (Mon) to 7 (Sun)
//         return $day >= 6; // Saturday and Sunday
//     }
    
//     private function isHoliday(DateTime $date): bool {
//         $holidays = $this->getHolidays($date->format('Y'));
//         $dateStr = $date->format('Y-m-d');
        
//         foreach ($holidays as $holiday) {
//             if ($holiday['date'] === $dateStr) {
//                 return true;
//             }
//         }
        
//         return false;
//     }
    
//     private function getHolidays($year): array {
//         // Try to fetch from Google Calendar API
//         $holidays = $this->fetchGoogleHolidays($year);
        
//         if (empty($holidays)) {
//             // Fallback to Nigerian public holidays
//             $holidays = $this->getNigerianHolidays($year);
//         }
        
//         return $holidays;
//     }
    
//     private function fetchGoogleHolidays($year): array {
//         $url = sprintf(
//             'https://www.googleapis.com/calendar/v3/calendars/%s/events?key=%s&timeMin=%s-01-01T00:00:00Z&timeMax=%s-12-31T23:59:59Z&singleEvents=true&orderBy=startTime',
//             urlencode($this->calendarId),
//             $this->googleApiKey,
//             $year,
//             $year
//         );
        
//         $response = @file_get_contents($url);
//         if ($response === false) {
//             return [];
//         }
        
//         $data = json_decode($response, true);
//         $holidays = [];
        
//         if (isset($data['items'])) {
//             foreach ($data['items'] as $item) {
//                 $holidays[] = [
//                     'date' => $item['start']['date'],
//                     'name' => $item['summary'],
//                     'type' => 'public'
//                 ];
//             }
//         }
        
//         return $holidays;
//     }
    
//     private function getNigerianHolidays($year): array {
//         // Nigerian public holidays
//         $holidays = [
//             ['date' => "{$year}-01-01", 'name' => "New Year's Day"],
//             ['date' => "{$year}-04-18", 'name' => "Good Friday"],
//             ['date' => "{$year}-04-21", 'name' => "Easter Monday"],
//             ['date' => "{$year}-05-01", 'name' => "Workers' Day"],
//             ['date' => "{$year}-06-12", 'name' => "Democracy Day"],
//             ['date' => "{$year}-10-01", 'name' => "Independence Day"],
//             ['date' => "{$year}-12-25", 'name' => "Christmas Day"],
//             ['date' => "{$year}-12-26", 'name' => "Boxing Day"],
//         ];
        
//         // Add Muslim holidays (dates vary by year)
//         $muslimHolidays = $this->getMuslimHolidays($year);
//         $holidays = array_merge($holidays, $muslimHolidays);
        
//         return $holidays;
//     }
    
//     private function getMuslimHolidays($year): array {
//         // Approximate dates for Eid al-Fitr and Eid al-Adha
//         // In production, you'd want to calculate these properly or fetch from an API
//         return [
//             ['date' => "{$year}-04-10", 'name' => "Eid al-Fitr"],
//             ['date' => "{$year}-06-16", 'name' => "Eid al-Adha"],
//         ];
//     }
// }



class CalendarService {
    private $googleApiKey;
    private $calendarId;
    
    public function __construct() {
        $this->googleApiKey = getenv('GOOGLE_API_KEY');
        $this->calendarId = 'en.ng#holiday@group.v.calendar.google.com';
    }
    
    public function calculateWorkingDays(DateTime $startDate, DateTime $endDate): int {
        $workingDays = 0;
        $currentDate = clone $startDate;
        
        while ($currentDate <= $endDate) {
            if (!$this->isWeekend($currentDate) && !$this->isHoliday($currentDate)) {
                $workingDays++;
            }
            $currentDate->modify('+1 day');
        }
        
        return $workingDays;
    }
    
    private function isWeekend(DateTime $date): bool {
        $day = $date->format('N'); // 1 (Mon) to 7 (Sun)
        return $day >= 6; // Saturday and Sunday
    }
    
    private function isHoliday(DateTime $date): bool {
        $holidays = $this->getHolidays($date->format('Y'));
        $dateStr = $date->format('Y-m-d');
        
        foreach ($holidays as $holiday) {
            if ($holiday['date'] === $dateStr) {
                return true;
            }
        }
        
        return false;
    }
    
    private function getHolidays($year): array {
        // Try to fetch from Google Calendar API
        $holidays = $this->fetchGoogleHolidays($year);
        
        if (empty($holidays)) {
            // Fallback to Nigerian public holidays
            $holidays = $this->getNigerianHolidays($year);
        }
        
        return $holidays;
    }
    
    private function fetchGoogleHolidays($year): array {
        $url = sprintf(
            'https://www.googleapis.com/calendar/v3/calendars/%s/events?key=%s&timeMin=%s-01-01T00:00:00Z&timeMax=%s-12-31T23:59:59Z&singleEvents=true&orderBy=startTime',
            urlencode($this->calendarId),
            $this->googleApiKey,
            $year,
            $year
        );
        
        $response = @file_get_contents($url);
        if ($response === false) {
            return [];
        }
        
        $data = json_decode($response, true);
        $holidays = [];
        
        if (isset($data['items'])) {
            foreach ($data['items'] as $item) {
                $holidays[] = [
                    'date' => $item['start']['date'],
                    'name' => $item['summary'],
                    'type' => 'public'
                ];
            }
        }
        
        return $holidays;
    }
    
    private function getNigerianHolidays($year): array {
        // Nigerian public holidays
        $holidays = [
            ['date' => "{$year}-01-01", 'name' => "New Year's Day"],
            ['date' => "{$year}-04-18", 'name' => "Good Friday"],
            ['date' => "{$year}-04-21", 'name' => "Easter Monday"],
            ['date' => "{$year}-05-01", 'name' => "Workers' Day"],
            ['date' => "{$year}-06-12", 'name' => "Democracy Day"],
            ['date' => "{$year}-10-01", 'name' => "Independence Day"],
            ['date' => "{$year}-12-25", 'name' => "Christmas Day"],
            ['date' => "{$year}-12-26", 'name' => "Boxing Day"],
        ];
        
        // Add Muslim holidays (dates vary by year)
        $muslimHolidays = $this->getMuslimHolidays($year);
        $holidays = array_merge($holidays, $muslimHolidays);
        
        return $holidays;
    }
    
    private function getMuslimHolidays($year): array {
        // Approximate dates for Eid al-Fitr and Eid al-Adha
        // In production, you'd want to calculate these properly or fetch from an API
        return [
            ['date' => "{$year}-04-10", 'name' => "Eid al-Fitr"],
            ['date' => "{$year}-06-16", 'name' => "Eid al-Adha"],
        ];
    }
}