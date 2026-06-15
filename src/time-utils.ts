/** Extract date/time parts from a Date in the given IANA timezone. */
function tzParts(dt: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(dt).map(({ type, value }) => [type, value]));
  return {
    year: parseInt(p['year']),
    month: parseInt(p['month']),
    day: parseInt(p['day']),
    hour: parseInt(p['hour']) % 24, // hour12:false can return 24 for midnight
    minute: parseInt(p['minute']),
    second: parseInt(p['second']),
    dateKey: `${p['year']}-${p['month']}-${p['day']}`,
  };
}

/** Midnight of a given date in the target timezone, returned as UTC Date. */
function midnightInTz(year: number, month: number, day: number, timeZone: string): Date {
  // Build an ISO-like string and let the browser resolve the offset
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
  // Use Temporal-style workaround: find UTC ms that corresponds to 00:00 in timeZone
  const approx = new Date(`${iso}Z`);
  // Adjust by the observed offset
  const parts = tzParts(approx, timeZone);
  const offsetMs = approx.getTime() - new Date(`${parts.year}-${String(parts.month).padStart(2,'0')}-${String(parts.day).padStart(2,'0')}T${String(parts.hour).padStart(2,'0')}:${String(parts.minute).padStart(2,'0')}:${String(parts.second).padStart(2,'0')}Z`).getTime();
  return new Date(approx.getTime() + offsetMs);
}

export function roundUpToInterval(now: Date, intervalMinutes: number, timeZone: string): Date {
  const ms = intervalMinutes * 60 * 1000;
  const floored = Math.floor(now.getTime() / ms) * ms;
  const candidate = new Date(floored + ms);
  // Snap is done on UTC epoch ms — valid for whole-hour TZ offsets (incl. Europe/Prague)
  void timeZone;
  return candidate;
}

export function addMinutes(dt: Date, delta: number): Date {
  return new Date(dt.getTime() + delta * 60 * 1000);
}

export function isFuture(dt: Date, now: Date): boolean {
  return dt > now;
}

export function setTomorrowTime(timeStr: string, timeZone: string): Date {
  const now = new Date();
  const todayParts = tzParts(now, timeZone);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const midnight = midnightInTz(todayParts.year, todayParts.month, todayParts.day, timeZone);
  return new Date(midnight.getTime() + 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
}

export function setTodayTime(timeStr: string, timeZone: string): Date {
  const now = new Date();
  const todayParts = tzParts(now, timeZone);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const midnight = midnightInTz(todayParts.year, todayParts.month, todayParts.day, timeZone);
  return new Date(midnight.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
}

export function formatDisplay(dt: Date, timeZone: string): string {
  const now = new Date();
  const nowParts = tzParts(now, timeZone);
  const dtParts = tzParts(dt, timeZone);

  const hh = String(dtParts.hour).padStart(2, '0');
  const mm = String(dtParts.minute).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowParts = tzParts(tomorrowDate, timeZone);

  if (dtParts.dateKey === nowParts.dateKey) {
    return `Dnes ${timeStr}`;
  } else if (dtParts.dateKey === tomorrowParts.dateKey) {
    return `Zítra ${timeStr}`;
  } else {
    return `${String(dtParts.day).padStart(2, '0')}.${String(dtParts.month).padStart(2, '0')}. ${timeStr}`;
  }
}

export function formatRelative(dt: Date, now: Date): string | null {
  const diffMs = dt.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `za ${minutes} min`;
  if (minutes === 0) return `za ${hours} h`;
  return `za ${hours} h ${minutes} min`;
}

export function formatDatetimeForHA(dt: Date): { date: string; time: string } {
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return { date: `${year}-${month}-${day}`, time: `${hh}:${mm}:00` };
}

export function clampToFuture(dt: Date, intervalMinutes: number, timeZone: string): Date {
  const now = new Date();
  if (dt > now) return dt;
  return roundUpToInterval(now, intervalMinutes, timeZone);
}
