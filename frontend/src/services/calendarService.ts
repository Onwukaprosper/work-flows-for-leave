export interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'university' | 'religious';
}

class CalendarService {
  private apiKey: string;
  private calendarId: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    // Nigerian public holidays calendar
    this.calendarId = 'en.ng#holiday@group.v.calendar.google.com';
  }

  async getHolidays(year: number): Promise<Holiday[]> {
    try {
      const startDate = `${year}-01-01T00:00:00Z`;
      const endDate = `${year}-12-31T23:59:59Z`;
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events?key=${this.apiKey}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.items?.map((item: any) => ({
        date: item.start.date,
        name: item.summary,
        type: this.getHolidayType(item.summary)
      })) || [];
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      // Return mock Nigerian holidays
      return this.getMockHolidays(year);
    }
  }

  private getMockHolidays(year: number): Holiday[] {
    return [
      { date: `${year}-01-01`, name: "New Year's Day", type: 'public' },
      { date: `${year}-04-18`, name: "Good Friday", type: 'religious' },
      { date: `${year}-04-21`, name: "Easter Monday", type: 'religious' },
      { date: `${year}-05-01`, name: "Workers' Day", type: 'public' },
      { date: `${year}-06-12`, name: "Democracy Day", type: 'public' },
      { date: `${year}-10-01`, name: "Independence Day", type: 'public' },
      { date: `${year}-12-25`, name: "Christmas Day", type: 'religious' },
      { date: `${year}-12-26`, name: "Boxing Day", type: 'public' },
    ];
  }

  private getHolidayType(name: string): 'public' | 'university' | 'religious' {
    const religious = ['Christmas', 'Easter', 'Good Friday', 'Eid', 'Ramadan'];
    const university = ['Matriculation', 'Convocation', 'Foundation Day'];
    
    if (religious.some(r => name.includes(r))) return 'religious';
    if (university.some(u => name.includes(u))) return 'university';
    return 'public';
  }

  async isHoliday(date: Date): Promise<boolean> {
    const holidays = await this.getHolidays(date.getFullYear());
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateStr);
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const isWeekend = this.isWeekend(currentDate);
      const isHoliday = await this.isHoliday(currentDate);
      
      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }
}

export const calendarService = new CalendarService();