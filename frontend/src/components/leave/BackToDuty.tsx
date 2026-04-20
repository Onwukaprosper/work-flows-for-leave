import React, { useState } from 'react';
import { useLeave } from '../../hooks/useLeave';
import { BellIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BackToDuty: React.FC = () => {
  const { activeLeaves, notifyBackToDuty, loading } = useLeave();
  const [notifying, setNotifying] = useState<number | null>(null);

  const handleNotify = async (leaveId: number) => {
    setNotifying(leaveId);
    try {
      await notifyBackToDuty(leaveId);
      toast.success('HOD/HR notified that you have returned to duty');
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setNotifying(null);
    }
  };

  if (!activeLeaves || activeLeaves.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <BellIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800">You are currently on leave</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Your leave ends on {activeLeaves[0] && new Date(activeLeaves[0].endDate).toLocaleDateString()}
          </p>
          <button
            onClick={() => handleNotify(activeLeaves[0].id)}
            disabled={loading || notifying !== null}
            className="mt-3 text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700"
          >
            {notifying === activeLeaves[0].id ? 'Notifying...' : 'I\'m Back to Duty'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackToDuty;