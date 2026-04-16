import React from 'react';
import type { LeaveBalance } from '../../types';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-8 text-white">
      <h3 className="text-lg font-semibold mb-4">Leave Balance</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{balance.totalDays}</div>
          <div className="text-sm opacity-90">Total Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{balance.usedDays}</div>
          <div className="text-sm opacity-90">Used Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{balance.remainingDays}</div>
          <div className="text-sm opacity-90">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;