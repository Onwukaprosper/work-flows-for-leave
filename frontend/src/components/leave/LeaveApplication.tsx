import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeave } from '../../hooks/useLeave';
import { format } from 'date-fns';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const leaveSchema = z.object({
  leaveTypeId: z.number().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
  document: z.any().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

const leaveTypes = [
  { id: 1, name: 'Annual Leave', maxDays: 24, requiresDoc: false },
  { id: 2, name: 'Sick Leave', maxDays: 12, requiresDoc: true },
  { id: 3, name: 'Maternity Leave', maxDays: 90, requiresDoc: true },
  { id: 4, name: 'Paternity Leave', maxDays: 14, requiresDoc: true },
  { id: 5, name: 'Study Leave', maxDays: 365, requiresDoc: true },
  { id: 6, name: 'Unpaid Leave', maxDays: null, requiresDoc: false },
];

const LeaveApplication: React.FC = () => {
  const { applyForLeave, loading, balance } = useLeave();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays);
      return diffDays;
    }
    return 0;
  };

  const onSubmit = async (data: LeaveFormData) => {
    const days = calculateDays();
    const leaveType = leaveTypes.find(t => t.id === data.leaveTypeId);
    
    if (leaveType?.maxDays && days > leaveType.maxDays) {
      alert(`Maximum ${leaveType.maxDays} days allowed for ${leaveType.name}`);
      return;
    }

    if (balance && days > balance.remainingDays) {
      alert(`Insufficient leave balance. You have ${balance.remainingDays} days remaining.`);
      return;
    }

    const formData = new FormData();
    formData.append('leaveTypeId', data.leaveTypeId.toString());
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    formData.append('reason', data.reason);
    formData.append('totalDays', days.toString());
    
    if (data.document) {
      formData.append('document', data.document);
    }

    await applyForLeave(formData);
  };

  const selectedLeaveType = leaveTypes.find(t => t.id === selectedType);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Apply for Leave</h2>
          <p className="text-gray-600 mt-1">Submit your leave application for approval</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Leave Balance Info */}
          {balance && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-900">Available Leave Balance:</span>
                <span className="text-2xl font-bold text-green-700">{balance.remainingDays} days</span>
              </div>
              <div className="mt-2 text-xs text-green-700">
                Total: {balance.totalDays} days | Used: {balance.usedDays} days
              </div>
            </div>
          )}

          {/* Leave Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              {...register('leaveTypeId', { valueAsNumber: true })}
              onChange={(e) => setSelectedType(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select leave type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.maxDays ? `(Max ${type.maxDays} days)` : '(Unlimited)'}
                </option>
              ))}
            </select>
            {errors.leaveTypeId && (
              <p className="mt-1 text-sm text-red-600">{errors.leaveTypeId.message}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min={startDate || format(new Date(), 'yyyy-MM-dd')}
                onChange={() => calculateDays()}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Calculated Days */}
          {calculatedDays > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-600">Total Days:</span>
              <span className="ml-2 text-lg font-semibold text-green-600">{calculatedDays} days</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave *
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Please provide detailed reason for your leave..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Document Upload */}
          {selectedLeaveType?.requiresDoc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="document" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>Upload a file</span>
                      <input
                        id="document"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setValue('document', e.target.files?.[0])}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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