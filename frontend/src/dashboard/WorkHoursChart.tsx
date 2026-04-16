import React from 'react';

interface WorkHoursChartProps {
  data: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

const WorkHoursChart: React.FC<WorkHoursChartProps> = ({ data }) => {
  const days = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
  ];

  const maxHours = Math.max(...Object.values(data));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Work Hours</h3>
      <div className="space-y-3">
        {days.map((day) => (
          <div key={day.key} className="flex items-center">
            <span className="w-12 text-sm text-gray-600">{day.label}</span>
            <div className="flex-1 mx-3">
              <div className="h-8 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full flex items-center justify-end px-3 text-xs text-white font-medium"
                  style={{ width: `${(data[day.key as keyof typeof data] / maxHours) * 100}%` }}
                >
                  {data[day.key as keyof typeof data]}h
                </div>
              </div>
            </div>
            <span className="w-12 text-sm text-gray-500">{data[day.key as keyof typeof data]}h</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkHoursChart;