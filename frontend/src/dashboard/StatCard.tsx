import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-green-100 border-green-200',
    green: 'bg-green-100 border-green-200',
    orange: 'bg-orange-100 border-orange-200',
    purple: 'bg-purple-100 border-purple-200',
  };

  const textColorClasses = {
    blue: 'text-green-700',
    green: 'text-green-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${textColorClasses[color]}`}>{icon}</div>
        <span className="text-2xl font-bold text-gray-800">{value.toFixed(0)}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    </div>
  );
};

export default StatCard;