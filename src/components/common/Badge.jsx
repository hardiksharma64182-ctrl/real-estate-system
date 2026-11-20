import React from 'react';
import { getStatusBadgeColor, getTypeBadgeColor } from '../../utils/formatters';

export const StatusBadge = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${getStatusBadgeColor(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};

export const TypeBadge = ({ type, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getTypeBadgeColor(
        type
      )} ${className}`}
    >
      {type}
    </span>
  );
};
