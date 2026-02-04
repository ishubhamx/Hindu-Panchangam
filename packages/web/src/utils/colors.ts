import type { Panchangam } from '@panchangam/core';

/**
 * Get color for a day based on its Panchang data
 * Returns gradient CSS for special days, null for normal days
 */
export function getDayColor(panchang: Panchangam): string | null {
    // Check for festivals first (highest priority)
    if (panchang.festivals && panchang.festivals.length > 0) {
        return 'var(--color-festival)';
    }

    const tithi = panchang.tithi;

    // Amavasya (New Moon) - tithi 29 (30th tithi, 0-indexed)
    if (tithi === 29) {
        return 'var(--color-amavasya)';
    }

    // Purnima (Full Moon) - tithi 14 (15th tithi, 0-indexed)
    if (tithi === 14) {
        return 'var(--color-purnima)';
    }

    // Ekadashi - tithi 10 (11th tithi) in both pakshas
    if (tithi === 10 || tithi === 25) {
        return 'var(--color-ekadashi)';
    }

    return null;
}

/**
 * Get a human-readable label for a tithi
 * Combines tithi name with paksha for clarity
 */
export function getTithiLabel(
    tithiIndex: number,
    tithiName: string
): string {
    // Full moon and new moon don't need paksha
    if (tithiIndex === 14 || tithiIndex === 29) {
        return tithiName;
    }

    return `${tithiName}`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Format time for display in 12-hour format
 */
export function formatTime(date: Date | null, timezone: string): string {
    if (!date) return '--:--';

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
    }).format(date);
}

/**
 * Format time for display in 24-hour format
 */
export function formatTime24(date: Date | null, timezone: string): string {
    if (!date) return '--:--';

    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
    }).format(date);
}
