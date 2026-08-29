export function dateLabel(value: Date | string | null, options: Intl.DateTimeFormatOptions = { month:'short', day:'numeric', year:'numeric' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone:'UTC' }).format(new Date(value));
}
export function monthYear(value: Date | string) { return dateLabel(value,{month:'long',year:'numeric'}).toUpperCase(); }
export function inputDate(value: Date|string|null) { return value ? new Date(value).toISOString().slice(0,10) : ''; }
export function inputDateTime(value: Date|string|null) { return value ? new Date(value).toISOString().slice(0,16) : ''; }
