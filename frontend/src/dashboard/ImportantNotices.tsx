import React from 'react';
import { ExclamationTriangleIcon, GiftIcon, ClockIcon } from '@heroicons/react/24/outline';

const ImportantNotices: React.FC = () => {
  const notices = [
    {
      type: 'warning',
      icon: ExclamationTriangleIcon,
      message: 'You are absent on 10 Feb 2021',
      action: 'Apply on duty',
      color: 'orange'
    },
    {
      type: 'info',
      icon: ClockIcon,
      message: '2 Compensatory off will expires on 5 Mar 2021',
      action: null,
      color: 'blue'
    },
    {
      type: 'holiday',
      icon: GiftIcon,
      message: 'Next Holiday: Holi',
      date: '29 Mar 2021',
      color: 'green'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Important Notices</h3>
      <div className="space-y-4">
        {notices.map((notice, index) => (
          <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-3 rounded">
            <div className="flex items-start gap-3">
              <notice.icon className={`h-5 w-5 text-${notice.color}-500 mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{notice.message}</p>
                {notice.date && (
                  <p className="text-xs text-gray-500 mt-1">{notice.date}</p>
                )}
                {notice.action && (
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-2">
                    {notice.action} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportantNotices;