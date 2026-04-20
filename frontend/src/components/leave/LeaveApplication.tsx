import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { calendarService } from '../../services/calendarService';
import { format } from 'date-fns';
import FileUpload from './FileUpload';
import { useLeave } from '../../hooks/useLeave';
import toast from 'react-hot-toast';

interface LeaveFormData {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

const LeaveApplication: React.FC = () => {
  const { applyForLeave, loading, balance } = useLeave();
  const [selectedDates, setSelectedDates] = useState<[Date, Date] | null>(null);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<any>(null);
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { id: 1, name: 'Annual Leave', maxDays: 24, requiresDoc: false },
    { id: 2, name: 'Sick Leave', maxDays: 12, requiresDoc: true },
    { id: 3, name: 'Maternity Leave', maxDays: 90, requiresDoc: true },
    { id: 4, name: 'Paternity Leave', maxDays: 14, requiresDoc: true },
    { id: 5, name: 'Study Leave', maxDays: 365, requiresDoc: true },
    { id: 6, name: 'Unpaid Leave', maxDays: null, requiresDoc: false },
  ];

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    const year = new Date().getFullYear();
    const holidayList = await calendarService.getHolidays(year);
    setHolidays(holidayList);
  };

  const isTileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false;
    
    // Disable past dates
    if (date < new Date()) return true;
    
    // Disable weekends
    if (calendarService.isWeekend(date)) return true;
    
    return false;
  };

  const handleDateSelect = (value: Date | Date[] | null) => {
    if (!value || !Array.isArray(value) || value.length !== 2) {
      setSelectedDates(null);
      return;
    }

    const selectedRange = value as [Date, Date];
    setSelectedDates(selectedRange);
    const start = selectedRange[0];
    const end = selectedRange[1];
    calculateWorkingDays(start, end);

    // Update form data
    setFormData({
      ...formData,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  const calculateWorkingDays = async (start: Date, end: Date) => {
    const days = await calendarService.calculateWorkingDays(start, end);
    setWorkingDays(days);
    return days;
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    const isHoliday = holidays.some(h => h.date === format(date, 'yyyy-MM-dd'));
    if (isHoliday) {
      return 'bg-red-100 text-red-800 font-semibold rounded-full';
    }
    
    if (calendarService.isWeekend(date)) {
      return 'bg-gray-100 text-gray-400 rounded-full';
    }
    
    // Highlight selected dates
    if (selectedDates && selectedDates.length === 2) {
      if (date >= selectedDates[0] && date <= selectedDates[1]) {
        return 'bg-green-500 text-white rounded-full';
      }
    }
    
    return '';
  };

  const handleLeaveTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = parseInt(e.target.value);
    const type = leaveTypes.find(t => t.id === typeId);
    setSelectedLeaveType(type);
    setFormData({ ...formData, leaveTypeId: typeId });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, reason: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.leaveTypeId) {
      toast.error('Please select a leave type');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select leave dates');
      return;
    }
    
    if (!formData.reason || formData.reason.length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      return;
    }
    
    const leaveType = leaveTypes.find(t => t.id === formData.leaveTypeId);
    if (leaveType?.maxDays && workingDays > leaveType.maxDays) {
      toast.error(`Maximum ${leaveType.maxDays} days allowed for ${leaveType.name}`);
      return;
    }
    
    if (balance && workingDays > balance.remainingDays) {
      toast.error(`Insufficient leave balance. You have ${balance.remainingDays} days remaining.`);
      return;
    }
    
    if (leaveType?.requiresDoc && !uploadedFile) {
      toast.error(`Please upload a supporting document for ${leaveType.name}`);
      return;
    }
    
    try {
      const submitData = new FormData();
      submitData.append('leaveTypeId', formData.leaveTypeId.toString());
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('reason', formData.reason);
      submitData.append('totalDays', workingDays.toString());
      
      if (uploadedFile) {
        submitData.append('document', uploadedFile);
      }
    
      await applyForLeave(submitData);
      
      // Reset form on success
      setSelectedDates(null);
      setWorkingDays(0);
      setUploadedFile(null);
      setFormData({
        leaveTypeId: 0,
        startDate: '',
        endDate: '',
        reason: ''
      });
      setSelectedLeaveType(null);
      setShowCalendar(false);
      
    } catch (error) {
      console.error('Failed to submit leave application:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Apply for Leave</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Leave Balance Info */}
          {balance && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Available Leave Balance:
                </span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {balance.remainingDays} days
                </span>
              </div>
              <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                Total: {balance.totalDays} days | Used: {balance.usedDays} days
              </div>
            </div>
          )}

          {/* Leave Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type *
            </label>
            <select
              value={formData.leaveTypeId || ''}
              onChange={handleLeaveTypeChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.maxDays ? `(Max ${type.maxDays} days)` : '(Unlimited)'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Calendar Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Leave Dates *
            </label>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-left dark:bg-gray-700 dark:text-white"
            >
              {selectedDates && selectedDates.length === 2
                ? `${format(selectedDates[0], 'PPP')} - ${format(selectedDates[1], 'PPP')}`
                : 'Click to select dates'}
            </button>
            
            {showCalendar && (
              <div className="mt-4">
                <Calendar
                  selectRange={true}
                  onChange={() => handleDateSelect}
                  value={selectedDates}
                  tileDisabled={isTileDisabled}
                  tileClassName={getTileClassName}
                  minDate={new Date()}
                  className="border-0 shadow-lg rounded-lg"
                />
                <div className="mt-4 text-sm">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Weekend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-600 dark:text-gray-400">Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Working Days Calculation */}
          {workingDays > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  Working Days (excluding weekends & holidays):
                </span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{workingDays} days</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Leave *
            </label>
            <textarea
              value={formData.reason}
              onChange={handleReasonChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Please provide detailed reason for your leave..."
              required
            />
          </div>

          {/* File Upload */}
          {selectedLeaveType?.requiresDoc && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supporting Document *
              </label>
              <FileUpload onFileSelect={setUploadedFile} />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplication;