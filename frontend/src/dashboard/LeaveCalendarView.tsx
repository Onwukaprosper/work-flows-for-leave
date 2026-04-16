import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const LeaveCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">Leave Calendar</h3>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {getDates().map((date, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-sm font-medium p-2 rounded-lg ${
              date.toDateString() === new Date().toDateString()
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700'
            }`}>
              {date.getDate()}
            </div>
            <div className="text-xs mt-1 text-gray-400">{formatDate(date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveCalendarView;