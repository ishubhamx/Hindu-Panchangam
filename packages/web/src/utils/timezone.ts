// Utility functions for timezone handling

/**
 * Get timezone offset in minutes for a given IANA timezone string
 * Uses the Intl API as recommended in the Hindu-Panchangam README
 */
export function getTimezoneOffset(timeZone: string, date: Date = new Date()): number {
    try {
        const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
        const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);

        if (!match) {
            console.warn(`Could not parse timezone offset for ${timeZone}, using 0`);
            return 0;
        }

        const sign = match[1].startsWith('+') ? 1 : -1;
        const hours = parseInt(match[1].replace(/[+-]/, ''), 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;

        return sign * (hours * 60 + minutes);
    } catch (error) {
        console.error(`Error getting timezone offset for ${timeZone}:`, error);
        return 0;
    }
}

/**
 * Common timezone presets for quick selection
 */
export const TIMEZONE_PRESETS = {
    IST: { name: 'Asia/Kolkata', offset: 330, label: 'IST (India)' },
    EST: { name: 'America/New_York', offset: -300, label: 'EST (US East)' },
    PST: { name: 'America/Los_Angeles', offset: -480, label: 'PST (US West)' },
    GMT: { name: 'Europe/London', offset: 0, label: 'GMT (London)' },
    JST: { name: 'Asia/Tokyo', offset: 540, label: 'JST (Tokyo)' },
    AEST: { name: 'Australia/Sydney', offset: 660, label: 'AEST (Sydney)' },
} as const;
