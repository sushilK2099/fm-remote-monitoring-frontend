import dayjs from 'dayjs';

function resolve(date) {
  if (!date) return null;
  if (typeof date === 'object' && !(date instanceof Date) && (date.ISODate || date.timestamp)) {
    return date.ISODate || date.timestamp;
  }
  return date;
}

export function formatDate(date, format = 'DD MMM YYYY') {
  const d = dayjs(resolve(date));
  return d.isValid() ? d.format(format) : '—';
}

export function formatDateTime(date) {
  const d = dayjs(resolve(date));
  return d.isValid() ? d.format('DD MMM YYYY, hh:mm A') : '—';
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}
