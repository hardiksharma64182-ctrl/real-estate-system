export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const generateId = (prefix = 'item') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'under offer':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'sold':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'rented':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getTypeBadgeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'villa':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'apartment':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'house':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'commercial':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
