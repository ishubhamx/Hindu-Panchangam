/**
 * Disha Shoola - Direction-based Travel Dosha
 * 
 * Certain directions are inauspicious for travel on specific weekdays.
 * This is a traditional Vedic concept used in Panchang calculations.
 */

import { dayNames } from './constants';

export interface DishaShoola {
    vara: number;                    // Day of week (0=Sunday, 6=Saturday)
    varaName: string;                // Name of the day
    inauspiciousDirection: string;   // Direction to avoid for travel
    safeDirections: string[];        // Safe directions for travel
}

// Mapping of weekday to inauspicious direction
// Based on traditional Vedic texts
const SHOOLA_DIRECTIONS: Record<number, string> = {
    0: 'West',    // Sunday
    1: 'East',    // Monday
    2: 'North',   // Tuesday
    3: 'North',   // Wednesday
    4: 'South',   // Thursday
    5: 'West',    // Friday
    6: 'East',    // Saturday
};

const ALL_DIRECTIONS = ['East', 'West', 'North', 'South'];

/**
 * Get Disha Shoola information for a given weekday
 * 
 * @param vara - Day of week index (0 = Sunday, 6 = Saturday)
 * @returns DishaShoola object with inauspicious and safe directions
 * 
 * @example
 * ```typescript
 * const shoola = getDishaShoola(0); // Sunday
 * console.log(shoola.inauspiciousDirection); // "West"
 * console.log(shoola.safeDirections); // ["East", "North", "South"]
 * ```
 */
export function getDishaShoola(vara: number): DishaShoola {
    // Normalize vara to 0-6 range
    const normalizedVara = ((vara % 7) + 7) % 7;

    const inauspiciousDirection = SHOOLA_DIRECTIONS[normalizedVara];
    const safeDirections = ALL_DIRECTIONS.filter(d => d !== inauspiciousDirection);

    return {
        vara: normalizedVara,
        varaName: dayNames[normalizedVara],
        inauspiciousDirection,
        safeDirections,
    };
}

/**
 * Check if a specific direction is safe for travel on a given day
 * 
 * @param vara - Day of week index (0 = Sunday, 6 = Saturday)
 * @param direction - Direction to check ('East', 'West', 'North', 'South')
 * @returns true if direction is safe, false if it's the Shoola direction
 */
export function isDirectionSafe(vara: number, direction: string): boolean {
    const shoola = getDishaShoola(vara);
    return direction.toLowerCase() !== shoola.inauspiciousDirection.toLowerCase();
}
