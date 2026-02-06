/**
 * Chandrashtama - Moon in 8th from Birth Rashi
 * 
 * When the transiting Moon is in the 8th sign from one's birth Moon sign (Janma Rashi),
 * it's considered an inauspicious period lasting approximately 2.5 days each month.
 */

import { rashiNames } from './constants';

export interface ChandrashtamaInfo {
    isActive: boolean;               // True if currently in Chandrashtama period
    birthRashi: number;              // Birth Moon Rashi index (0-11)
    birthRashiName: string;          // Birth Rashi name
    chandrashtamaRashi: number;      // The 8th Rashi from birth (0-11)
    chandrashtamaRashiName: string;  // Name of Chandrashtama Rashi
    currentMoonRashi: number;        // Current Moon Rashi index (0-11)
    currentMoonRashiName: string;    // Current Moon Rashi name
}

/**
 * Calculate Chandrashtama status based on birth Rashi and current Moon position
 * 
 * @param birthRashi - Birth Moon Rashi index (0 = Aries/Mesh, 11 = Pisces/Meen)
 * @param currentMoonRashi - Current transiting Moon's Rashi index (0-11)
 * @returns ChandrashtamaInfo object with active status and Rashi details
 * 
 * @example
 * ```typescript
 * // Person born with Moon in Aries (0), current Moon in Scorpio (7)
 * const info = getChandrashtama(0, 7);
 * console.log(info.isActive); // true (Scorpio is 8th from Aries)
 * ```
 */
export function getChandrashtama(
    birthRashi: number,
    currentMoonRashi: number
): ChandrashtamaInfo {
    // Normalize inputs to 0-11 range
    const normalizedBirth = ((birthRashi % 12) + 12) % 12;
    const normalizedCurrent = ((currentMoonRashi % 12) + 12) % 12;

    // 8th house is 7 signs ahead (0-indexed)
    // Example: Aries (0) → 8th house is Scorpio (0 + 7 = 7)
    const chandrashtamaRashi = (normalizedBirth + 7) % 12;

    const isActive = normalizedCurrent === chandrashtamaRashi;

    return {
        isActive,
        birthRashi: normalizedBirth,
        birthRashiName: rashiNames[normalizedBirth],
        chandrashtamaRashi,
        chandrashtamaRashiName: rashiNames[chandrashtamaRashi],
        currentMoonRashi: normalizedCurrent,
        currentMoonRashiName: rashiNames[normalizedCurrent],
    };
}

/**
 * Get the Chandrashtama Rashi for a given birth Rashi
 * 
 * @param birthRashi - Birth Moon Rashi index (0-11)
 * @returns The Rashi index that causes Chandrashtama (0-11)
 */
export function getChandrashtamaRashi(birthRashi: number): number {
    return ((birthRashi % 12) + 12 + 7) % 12;
}
