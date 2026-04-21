/**
 * Parses a date string (e.g. "2026-04-05" or "2026-04-05T00:00:00.000Z")
 * into a local Date at midnight, ignoring any timezone suffix.
 * This prevents UTC→local shifts that cause off-by-one day errors.
 */
export const parseDateLocal = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const adjustWeekendToFriday = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = parseDateLocal(dateStr);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    if (day === 6) { // Saturday -> Friday (-1 day)
        date.setDate(date.getDate() - 1);
    } else if (day === 0) { // Sunday -> Friday (-2 days)
        date.setDate(date.getDate() - 2);
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
