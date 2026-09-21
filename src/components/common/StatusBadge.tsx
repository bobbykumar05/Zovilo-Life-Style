import React from 'react';
import { AssetStatus, AssetCondition, EmployeeStatus, NocStatus } from '../../types';

interface StatusBadgeProps {
  status: AssetStatus | EmployeeStatus | NocStatus | AssetCondition | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const getStyle = (val: string) => {
    switch (val) {
      // Asset Status
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Repair':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Damaged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Lost':
      case 'Missing':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Returned':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Retired':
      case 'Disposed':
        return 'bg-slate-100 text-slate-700 border-slate-300';

      // Employee Status
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Resigned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Terminated':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Transferred':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      // NOC Status
      case 'Finalized':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
      case 'Ready':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Pending Review':
      case 'Pending Items':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Clear':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      // Condition
      case 'New':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fair':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Non-Functional':
        return 'bg-red-50 text-red-700 border-red-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const dotColor = (val: string) => {
    switch (val) {
      case 'Available':
      case 'Active':
      case 'Finalized':
      case 'Clear':
      case 'Excellent':
        return 'bg-emerald-500';
      case 'Assigned':
      case 'Ready':
      case 'Good':
        return 'bg-blue-500';
      case 'In Repair':
      case 'Pending Review':
      case 'Resigned':
      case 'Fair':
        return 'bg-amber-500';
      case 'Damaged':
      case 'Lost':
      case 'Missing':
      case 'Terminated':
      case 'Non-Functional':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getStyle(
        status
      )} ${sizeClasses} transition-colors whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor(status)}`} />
      {status}
    </span>
  );
};
