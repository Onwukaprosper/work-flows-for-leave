import { useContext } from 'react';
import { LeaveContext } from '../contexts/LeaveContexts';

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within LeaveProvider');
  }
  return context;
};