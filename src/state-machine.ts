import type { CardState } from './types.js';

export function computeState(
  statusEntityState: string | undefined,
  datetimeValue: string | undefined,
  now: Date,
): CardState {
  if (statusEntityState === 'on') {
    return 'active';
  }

  if (datetimeValue && isDatetimeFuture(datetimeValue, now)) {
    return 'scheduled';
  }

  return 'inactive';
}

function isDatetimeFuture(datetimeValue: string, now: Date): boolean {
  const dt = parseDatetime(datetimeValue);
  if (!dt) return false;
  return dt > now;
}

export function parseDatetime(value: string): Date | null {
  if (!value || value === 'unknown' || value === 'unavailable') return null;
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}
