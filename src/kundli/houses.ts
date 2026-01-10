import { Bhava } from "./types";

/**
 * Calculates the House (Bhava) cusps and spans based on the given system.
 * 
 * @param ascendantLongitude Sidereal longitude of the Ascendant (Lagna) in degrees (0-360).
 * @param system 'whole_sign' | 'equal_house' (Default: 'whole_sign')
 * @returns Array of 12 Bhava objects.
 */
export function getHouses(ascendantLongitude: number, system: 'whole_sign' | 'equal_house' = 'whole_sign'): Bhava[] {
    const bhavas: Bhava[] = [];

    // 1. Whole Sign House System (Standard for BPHS)
    // The Rashi containing the Ascendant is the entire 1st House.
    // e.g., if Ascendant is 45° (Taurus 15°), 1st House is 30°-60°.
    if (system === 'whole_sign') {
        const ascendantRashi = Math.floor(ascendantLongitude / 30); // 0-11
        const startOfRashi = ascendantRashi * 30;

        for (let i = 0; i < 12; i++) {
            const currentRashi = (ascendantRashi + i) % 12;
            const houseStart = (startOfRashi + (i * 30)) % 360;
            const houseEnd = (houseStart + 30) % 360;

            // In Whole Sign, the cusp is conceptually the start of the sign (or 15 deg in some traditions, but mostly start)
            // We'll set the cusp as 0 deg of that sign.

            bhavas.push({
                number: i + 1,
                rashi: currentRashi,
                longitude: houseStart, // Cusp is start of sign
                startLongitude: houseStart,
                endLongitude: houseEnd,
                planets: [] // Populated later
            });
        }
    }

    // 2. Equal House System
    // Ascendant Degree is the Cusp (Start) of the 1st House.
    // Each house is exactly 30 degrees.
    else if (system === 'equal_house') {
        for (let i = 0; i < 12; i++) {
            const cusp = (ascendantLongitude + (i * 30)) % 360;
            const end = (cusp + 30) % 360;
            const rashiAtCusp = Math.floor(cusp / 30);

            bhavas.push({
                number: i + 1,
                rashi: rashiAtCusp,
                longitude: cusp,
                startLongitude: cusp,
                endLongitude: end,
                planets: [] // Populated later
            });
        }
    }

    return bhavas;
}
