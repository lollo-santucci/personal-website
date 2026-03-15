const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}


/**
 * Formats an ISO date string (YYYY-MM-DD) as DD.MM.YYYY.
 */
export function formatDateDDMMYYYY(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Returns true if the given ISO date is within `thresholdDays` of now (inclusive).
 * Default threshold is 30 days.
 */
export function isRecentPost(
  isoDate: string,
  thresholdDays: number = 30,
): boolean {
  const postDate = new Date(isoDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= thresholdDays;
}

/**
 * Estimates read time in minutes from content string.
 * Rounds up, minimum 1. Default 200 WPM.
 */
export function calculateReadTime(
  content: string,
  wordsPerMinute: number = 200,
): number {
  const words = content.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

/**
 * Formats an agent index as a zero-padded 3-digit string (e.g., 1 → "001").
 */
export function formatAgentIndex(index: number): string {
  return String(index).padStart(3, '0');
}
