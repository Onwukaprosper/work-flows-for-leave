import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeave } from '../../hooks/useLeave';
import { useAuth } from '../../hooks/useAuth';
import { format, isWeekend, addDays } from 'date-fns';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { calendarService } from '../../services/calendarService';

const leaveSchema = z.object({
  leaveTypeId: z.number().min(1, 'Leave type is required'),
  collegeDeptUnit: z.string().min(1, 'College/Dept/Unit is required'),
  presentPost: z.string().min(1, 'Present Post is required'),
  salaryScale: z.string().optional(),
  salaryGrade: z.string().optional(),
  salaryStep: z.number().optional(),
  academicSession: z.string().min(1, 'Academic session is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
  addressOnLeave: z.string().min(5, 'Address while on leave is required'),
  deferredDaysBroughtForward: z.number().optional().default(0),
  reasonForDeferment: z.string().optional(),
  leaveGrantRequested: z.boolean().default(false),
  digitalSignature: z.boolean().refine(val => val === true, {
    message: 'You must sign the application',
  }),
  document: z.any().optional(),
});

type LeaveFormData = z.input<typeof leaveSchema>;

const leaveTypes = [
  { id: 1, name: 'Annual Leave', maxDays: 30, requiresDoc: false },
  { id: 2, name: 'Sick Leave', maxDays: 12, requiresDoc: true },
  { id: 3, name: 'Maternity Leave', maxDays: 90, requiresDoc: true },
  { id: 4, name: 'Paternity Leave', maxDays: 14, requiresDoc: true },
  { id: 5, name: 'Study Leave', maxDays: 365, requiresDoc: true },
  { id: 6, name: 'Unpaid Leave', maxDays: null, requiresDoc: false },
];

const LeaveApplication: React.FC = () => {
  const { user } = useAuth();
  const { applyForLeave, loading, balance } = useLeave();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [expectedResumptionDate, setExpectedResumptionDate] = useState<Date | null>(null);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      collegeDeptUnit: user?.department || '',
      presentPost: user?.position || '',
      salaryScale: user ? (user as any).salaryScale || '' : '',
      salaryGrade: user ? (user as any).salaryGrade || '' : '',
      salaryStep: user ? (user as any).salaryStep || undefined : undefined,
      deferredDaysBroughtForward: 0,
      leaveGrantRequested: false,
      digitalSignature: false,
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const leaveTypeId = watch('leaveTypeId');

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
    if (date < new Date()) return true;
    if (calendarService.isWeekend(date)) return true;
    return false;
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
    
    if (selectedDates.length === 2) {
      if (date >= selectedDates[0] && date <= selectedDates[1]) {
        return 'bg-green-500 text-white rounded-full';
      }
    }
    
    return '';
  };

  const handleCalendarDateSelect = (value: Date | Date[], event: any) => {
    if (Array.isArray(value) && value.length === 2) {
      setSelectedDates(value);
      setValue('startDate', format(value[0], 'yyyy-MM-dd'));
      setValue('endDate', format(value[1], 'yyyy-MM-dd'));
      setShowCalendar(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setCalculatedDays(0);
        setExpectedResumptionDate(null);
        return;
      }
      
      let diffDays = 0;
      let current = new Date(start);
      
      while (current <= end) {
        if (!isWeekend(current)) {
          const isHoliday = holidays.some(h => h.date === format(current, 'yyyy-MM-dd'));
          if (!isHoliday) {
            diffDays++;
          }
        }
        current = addDays(current, 1);
      }
      
      setCalculatedDays(diffDays);

      let resumption = addDays(end, 1);
      while (isWeekend(resumption)) {
        resumption = addDays(resumption, 1);
      }
      setExpectedResumptionDate(resumption);
    } else {
      setCalculatedDays(0);
      setExpectedResumptionDate(null);
    }
  }, [startDate, endDate, holidays]);

  const onSubmit = async (data: LeaveFormData) => {
    const days = calculatedDays;
    const leaveType = leaveTypes.find(t => t.id === data.leaveTypeId);
    
    if (leaveType?.maxDays && days > leaveType.maxDays) {
      toast.error(`Maximum ${leaveType.maxDays} days allowed for ${leaveType.name}`);
      return;
    }
    
    if (data.leaveTypeId === 1 && balance && days > balance.remainingDays) {
      toast.error(`Insufficient annual leave balance. You have ${balance.remainingDays} days remaining.`);
      return;
    }

    if (leaveType?.requiresDoc && !uploadedFile && !data.document) {
      toast.error(`Please upload a supporting document for ${leaveType.name}`);
      return;
    }

    const formData = new FormData();
    formData.append('leaveTypeId', data.leaveTypeId.toString());
    formData.append('collegeDeptUnit', data.collegeDeptUnit || '');
    formData.append('presentPost', data.presentPost || '');
    formData.append('salaryScale', data.salaryScale || '');
    formData.append('salaryGrade', data.salaryGrade || '');
    if (data.salaryStep) formData.append('salaryStep', data.salaryStep.toString());
    formData.append('academicSession', data.academicSession || '');
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    formData.append('reason', data.reason);
    formData.append('addressOnLeave', data.addressOnLeave || '');
    formData.append('totalDays', days.toString());
    if (data.deferredDaysBroughtForward) {
      formData.append('deferredDaysBroughtForward', data.deferredDaysBroughtForward.toString());
    }
    if (data.reasonForDeferment) {
      formData.append('reasonForDeferment', data.reasonForDeferment);
    }
    formData.append('leaveGrantRequested', data.leaveGrantRequested ? 'true' : 'false');

    if (expectedResumptionDate) {
      formData.append('expectedResumptionDate', format(expectedResumptionDate, 'yyyy-MM-dd'));
    }
    
    const fileToUpload = uploadedFile || data.document;
    if (fileToUpload) {
      formData.append('document', fileToUpload);
    }

    await applyForLeave(formData);
    
    // Reset form on success
    setSelectedDates([]);
    setCalculatedDays(0);
    setUploadedFile(null);
    setSelectedType(null);
    setShowCalendar(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Apply for Leave</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Submit your leave application for approval</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Employee Details Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                College/Dept/Unit *
              </label>
              <input
                type="text"
                {...register('collegeDeptUnit')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.collegeDeptUnit && <p className="mt-1 text-sm text-red-600">{errors.collegeDeptUnit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Present Post *
              </label>
              <input
                type="text"
                {...register('presentPost')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.presentPost && <p className="mt-1 text-sm text-red-600">{errors.presentPost.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Scale (e.g. CONTISS)
              </label>
              <input
                type="text"
                {...register('salaryScale')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade/Level
              </label>
              <input
                type="text"
                {...register('salaryGrade')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Step
              </label>
              <input
                type="number"
                {...register('salaryStep', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Leave Balance Info */}
          {balance && (leaveTypeId === 1 || !leaveTypeId) && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  Available Leave Balance:
                </span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {balance.remainingDays} days
                </span>
              </div>
              <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                Total: {balance.totalDays} days | Used: {balance.usedDays} days
              </div>
            </div>
          )}

          {/* Leave Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type *
            </label>
            <select
              {...register('leaveTypeId', { valueAsNumber: true })}
              onChange={(e) => setSelectedType(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.maxDays ? `(Max ${type.maxDays} days)` : '(Unlimited)'}
                </option>
              ))}
            </select>
            {errors.leaveTypeId && <p className="mt-1 text-sm text-red-600">{errors.leaveTypeId.message}</p>}
          </div>

          {/* Academic Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Academic Session *
            </label>
            <select
              {...register('academicSession')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="" selected disabled>Select session</option>
              <option value="2023/2024">2025/2026</option>
              <option value="2024/2025">2026/2027</option>
              <option value="2025/2026">2027/2028</option>
              <option value="2025/2026">2028/2029</option>
              <option value="2025/2026">2029/2030</option>
            </select>
            {errors.academicSession && (
              <p className="mt-1 text-sm text-red-600">{errors.academicSession.message}</p>
            )}
          </div>

          {/* Date Selection with Calendar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Leave Dates *
            </label>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-left dark:bg-gray-700 dark:text-white"
            >
              {selectedDates.length === 2
                ? `${format(selectedDates[0], 'PPP')} - ${format(selectedDates[1], 'PPP')}`
                : 'Click to select dates'}
            </button>
            
            {showCalendar && (
              <div className="mt-4 z-50 relative">
                <Calendar
                  selectRange={true}
                  onChange={handleCalendarDateSelect}
                  value={selectedDates.length === 2 ? (selectedDates as [Date, Date]) : undefined}
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

          {/* Calculated Days & Resumption */}
          {calculatedDays > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-green-200 dark:border-green-800">
              <div>
                <span className="block text-sm font-medium text-green-700 dark:text-green-300">Total Working Days:</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-400">{calculatedDays} days</span>
              </div>
              {expectedResumptionDate && (
                <div>
                  <span className="block text-sm font-medium text-green-700 dark:text-green-300">Expected Resumption Date:</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">{format(expectedResumptionDate, 'do MMMM, yyyy')}</span>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Leave *
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Please provide detailed reason for your leave..."
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
          </div>

          {/* Address while on Leave */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address while on Leave *
            </label>
            <textarea
              {...register('addressOnLeave')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Full address where you can be reached during leave..."
            />
            {errors.addressOnLeave && <p className="mt-1 text-sm text-red-600">{errors.addressOnLeave.message}</p>}
          </div>

          {/* Deferred Leave Section (Only for Annual Leave) */}
          {selectedType === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deferred Days Brought Forward
                </label>
                <input
                  type="number"
                  {...register('deferredDaysBroughtForward', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Deferment
                </label>
                <input
                  type="text"
                  {...register('reasonForDeferment')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Why was leave deferred?"
                />
              </div>
            </div>
          )}

          {/* Document Upload */}
          {leaveTypes.find(t => t.id === selectedType)?.requiresDoc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supporting Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="document" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>Upload a file</span>
                      <input
                        id="document"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                            setValue('document', file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Leave Grant & Signature */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
            {selectedType === 1 && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('leaveGrantRequested')}
                  className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  I am applying for a Leave Grant (payment) along with this application
                </span>
              </label>
            )}

            <div className={selectedType === 1 ? "border-t border-gray-200 dark:border-gray-600 pt-4" : ""}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('digitalSignature')}
                  className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Applicant's Signature *</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    By checking this box, I attest that the above information is accurate and I formally request this leave.
                  </span>
                </div>
              </label>
              {errors.digitalSignature && (
                <p className="mt-1 text-sm text-red-600 ml-8">{errors.digitalSignature.message}</p>
              )}
            </div>
          </div>

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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
