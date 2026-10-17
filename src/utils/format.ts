export function formatStopwatchWithMs(totalSeconds: number): {
  main: string;
  ms: string;
} {
  const nonNegative = Math.max(0, totalSeconds);
  const hours = Math.floor(nonNegative / 3600);
  const minutes = Math.floor((nonNegative % 3600) / 60);
  const seconds = Math.floor(nonNegative % 60);
  const centiseconds = Math.floor((nonNegative % 1) * 100);

  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const csStr = centiseconds.toString().padStart(2, '0');

  return {
    main: `${hStr}:${mStr}:${sStr}`,
    ms: `.${csStr}`,
  };
}

export function formatCountdownWithMs(totalSeconds: number): {
  main: string;
  ms: string;
} {
  const nonNegative = Math.max(0, totalSeconds);
  const minutes = Math.floor(nonNegative / 60);
  const seconds = Math.floor(nonNegative % 60);
  const centiseconds = Math.floor((nonNegative % 1) * 100);

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const csStr = centiseconds.toString().padStart(2, '0');

  return {
    main: `${mStr}:${sStr}`,
    ms: `.${csStr}`,
  };
}

export function formatHMS(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');

  return `${hStr}:${mStr}:${sStr}`;
}

export function formatMS(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');

  return `${mStr}:${sStr}`;
}

export function formatFriendlyDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export function formatTimeOfDay(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}
