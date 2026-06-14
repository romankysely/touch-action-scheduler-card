export function roundUpToInterval(now: Date, intervalMinutes: number): Date {
  const ms = intervalMinutes * 60 * 1000;
  const floored = Math.floor(now.getTime() / ms) * ms;
  const candidate = new Date(floored + ms);
  return candidate;
}

export function addMinutes(dt: Date, delta: number): Date {
  return new Date(dt.getTime() + delta * 60 * 1000);
}

export function isFuture(dt: Date, now: Date = new Date()): boolean {
  return dt > now;
}

export function setTomorrowTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);
  return tomorrow;
}

export function setTodayTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today;
}

export function formatDisplay(dt: Date): string {
  const now = new Date();
  const todayDate = now.toDateString();
  const dtDate = dt.toDateString();

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);

  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  if (dtDate === todayDate) {
    return `Dnes ${timeStr}`;
  } else if (dtDate === tomorrowDate.toDateString()) {
    return `Zítra ${timeStr}`;
  } else {
    const d = String(dt.getDate()).padStart(2, '0');
    const mo = String(dt.getMonth() + 1).padStart(2, '0');
    return `${d}.${mo}. ${timeStr}`;
  }
}

export function formatRelative(dt: Date, now: Date = new Date()): string | null {
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
  const ss = '00';
  return { date: `${year}-${month}-${day}`, time: `${hh}:${mm}:${ss}` };
}

export function clampToFuture(dt: Date, intervalMinutes: number): Date {
  const now = new Date();
  if (dt > now) return dt;
  return roundUpToInterval(now, intervalMinutes);
}
