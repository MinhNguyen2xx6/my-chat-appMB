function isValidTimestamp(timestamp: number): boolean {
  return typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp > 0;
}

export function isSameCalendarDay(tsA: number, tsB: number): boolean {
  const a = new Date(tsA);
  const b = new Date(tsB);
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isYesterdayCalendarDay(timestamp: number, now: number): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameCalendarDay(timestamp, yesterday.getTime());
}

export function formatConversationTime(timestamp: number): string {
  if (!isValidTimestamp(timestamp)) {
    return '';
  }
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return 'Vừa xong';
  }
  if (diffMin < 60) {
    return `${diffMin} phút`;
  }

  if (isSameCalendarDay(timestamp, now)) {
    return formatClockTime(timestamp);
  }

  if (isYesterdayCalendarDay(timestamp, now)) {
    return 'Hôm qua';
  }

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function formatDateSeparator(timestamp: number): string {
  if (!isValidTimestamp(timestamp)) {
    return '';
  }
  const now = Date.now();
  if (isSameCalendarDay(timestamp, now)) {
    return 'Hôm nay';
  }
  if (isYesterdayCalendarDay(timestamp, now)) {
    return 'Hôm qua';
  }
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatClockTime(timestamp: number): string {
  if (!isValidTimestamp(timestamp)) {
    return '';
  }
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

export function formatVoiceDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
