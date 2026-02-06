/**
 * Tarabalam - Nakshatra Strength Calculation
 * 
 * Tarabalam measures the strength/auspiciousness of a day based on the
 * relationship between one's birth Nakshatra and the current day's Nakshatra.
 */

import { nakshatraNames } from './constants';

export interface TarabalamInfo {
    birthNakshatra: number;       // Birth Nakshatra index (0-26)
    birthNakshatraName: string;   // Birth Nakshatra name
    currentNakshatra: number;     // Current Nakshatra index (0-26)
    currentNakshatraName: string; // Current Nakshatra name
    taraNumber: number;           // Tara number (1-9)
    taraName: string;             // Tara name (Janma, Sampat, etc.)
    isAuspicious: boolean;        // True if this Tara is considered good
    description: string;          // Brief description of the Tara's effect
}

// Tara names and their nature (1-9)
const TARA_INFO: Record<number, { name: string; isAuspicious: boolean; description: string }> = {
    1: { name: 'Janma', isAuspicious: false, description: 'Birth star - may cause physical discomfort' },
    2: { name: 'Sampat', isAuspicious: true, description: 'Wealth star - good for financial matters' },
    3: { name: 'Vipat', isAuspicious: false, description: 'Danger star - obstacles and troubles possible' },
    4: { name: 'Kshema', isAuspicious: true, description: 'Well-being star - prosperity and good health' },
    5: { name: 'Pratyak', isAuspicious: false, description: 'Opposition star - hindrances and delays' },
    6: { name: 'Sadhana', isAuspicious: true, description: 'Achievement star - success in endeavors' },
    7: { name: 'Naidhana', isAuspicious: false, description: 'Death star - avoid important activities' },
    8: { name: 'Mitra', isAuspicious: true, description: 'Friend star - support and cooperation' },
    9: { name: 'Parama Mitra', isAuspicious: true, description: 'Great friend star - highly favorable' },
};

/**
 * Calculate Tarabalam based on birth and current Nakshatra
 * 
 * @param birthNakshatra - Birth Nakshatra index (0-26, where 0 = Ashwini)
 * @param currentNakshatra - Current day's Nakshatra index (0-26)
 * @returns TarabalamInfo object with Tara details and auspiciousness
 * 
 * @example
 * ```typescript
 * // Person born in Ashwini (0), current Nakshatra is Bharani (1)
 * const tara = getTarabalam(0, 1);
 * console.log(tara.taraName); // "Sampat"
 * console.log(tara.isAuspicious); // true
 * ```
 */
export function getTarabalam(
    birthNakshatra: number,
    currentNakshatra: number
): TarabalamInfo {
    // Normalize inputs to 0-26 range
    const normalizedBirth = ((birthNakshatra % 27) + 27) % 27;
    const normalizedCurrent = ((currentNakshatra % 27) + 27) % 27;

    // Count from birth to current (inclusive)
    // If current >= birth: count = current - birth + 1
    // If current < birth: count = (27 - birth) + current + 1
    let count: number;
    if (normalizedCurrent >= normalizedBirth) {
        count = normalizedCurrent - normalizedBirth + 1;
    } else {
        count = (27 - normalizedBirth) + normalizedCurrent + 1;
    }

    // Calculate Tara number (1-9)
    // Divide count by 9, remainder gives Tara
    // If remainder is 0, it's the 9th Tara
    const remainder = count % 9;
    const taraNumber = remainder === 0 ? 9 : remainder;

    const taraInfo = TARA_INFO[taraNumber];

    return {
        birthNakshatra: normalizedBirth,
        birthNakshatraName: nakshatraNames[normalizedBirth],
        currentNakshatra: normalizedCurrent,
        currentNakshatraName: nakshatraNames[normalizedCurrent],
        taraNumber,
        taraName: taraInfo.name,
        isAuspicious: taraInfo.isAuspicious,
        description: taraInfo.description,
    };
}

/**
 * Get all auspicious Nakshatras for a given birth Nakshatra
 * 
 * @param birthNakshatra - Birth Nakshatra index (0-26)
 * @returns Array of Nakshatra indices that are auspicious (Taras 2,4,6,8,9)
 */
export function getAuspiciousNakshatras(birthNakshatra: number): number[] {
    const auspicious: number[] = [];
    const auspiciousTaras = [2, 4, 6, 8, 9]; // Sampat, Kshema, Sadhana, Mitra, Parama Mitra

    for (let i = 0; i < 27; i++) {
        const tara = getTarabalam(birthNakshatra, i);
        if (auspiciousTaras.includes(tara.taraNumber)) {
            auspicious.push(i);
        }
    }

    return auspicious;
}
