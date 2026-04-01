import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link
          to="/leave/apply"
          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Apply Leave</span>
          </div>
          <span className="text-xs text-blue-600">→</span>
        </Link>
        
        <Link
          to="/duty/apply"
          className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Apply on Duty</span>
          </div>
          <span className="text-xs text-green-600">→</span>
        </Link>
        
        <Link
          to="/policy"
          className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpenIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Read Leave Policy</span>
          </div>
          <span className="text-xs text-purple-600">→</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;