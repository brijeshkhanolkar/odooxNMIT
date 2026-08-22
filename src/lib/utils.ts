import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // Skip weekends
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'present':
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'inactive':
    case 'absent':
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    case 'half_day':
      return 'bg-amber-100 text-amber-700';
    case 'on_leave':
      return 'bg-blue-100 text-blue-700';
    case 'terminated':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getLeaveTypeLabel(type: string): string {
  switch (type) {
    case 'paid': return 'Paid Leave';
    case 'sick': return 'Sick Leave';
    case 'unpaid': return 'Unpaid Leave';
    default: return type;
  }
}

export function getEmploymentTypeLabel(type: string): string {
  switch (type) {
    case 'full_time': return 'Full Time';
    case 'part_time': return 'Part Time';
    case 'contract': return 'Contract';
    case 'intern': return 'Intern';
    default: return type;
  }
}

export function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function generateCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
