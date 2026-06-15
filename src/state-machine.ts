import type { CardState } from './types.js';

const ACTIVE_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

export function computeState(
  statusEntityState: string | undefined,
  datetimeValue: string | undefined,
  now: Date,
): CardState {
  if (statusEntityState === 'on') return 'active';

  const dt = datetimeValue ? parseDatetime(datetimeValue) : null;
  if (!dt) return 'inactive';

  if (dt > now) return 'scheduled';

  // Datetime recently elapsed → assume action is running
  // Far-past date (e.g. 2000-01-01 written by clearSchedule) → inactive
  if (now.getTime() - dt.getTime() < ACTIVE_WINDOW_MS) return 'active';

  return 'inactive';
}

export function parseDatetime(value: string): Date | null {
  if (!value || value === 'unknown' || value === 'unavailable') return null;
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}
