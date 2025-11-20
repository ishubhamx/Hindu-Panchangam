/**
 * Ayanamsa calculations for converting tropical to sidereal longitudes
 * Used in Indian Vedic astrology and Panchangam calculations
 */

/**
 * Calculate the Lahiri ayanamsa (precession correction) for a given date.
 * 
 * The Lahiri ayanamsa is the official ayanamsa used by the Indian government
 * for Panchang calculations since 1956. It represents the difference between
 * tropical and sidereal zodiac positions.
 * 
 * Formula based on:
 * - Base epoch: J2000.0 (January 1, 2000, 12:00 TT)
 * - Lahiri ayanamsa at J2000.0: 23° 51' 10.44" (23.85290°)
 * - Rate of change: approximately 50.29 arc-seconds per year
 * 
 * The calculation uses the standard astronomical formula:
 * ayanamsa(t) = ayanamsa_0 + rate * t
 * where t is the number of Julian centuries from J2000.0
 * 
 * @param date - The date for which to calculate the ayanamsa
 * @returns The ayanamsa value in degrees
 */
export function getLahiriAyanamsa(date: Date): number {
    // Convert date to Julian Day Number (JDN)
    const jd = dateToJulianDay(date);
    
    // J2000.0 epoch = JD 2451545.0 (January 1, 2000, 12:00 TT)
    const J2000 = 2451545.0;
    
    // Calculate Julian centuries from J2000.0
    const T = (jd - J2000) / 36525.0;
    
    // Lahiri ayanamsa at J2000.0 in degrees
    // 23° 51' 10.44" = 23.85290°
    const ayanamsa_2000 = 23.85290;
    
    // Rate of change per Julian century
    // ~50.29 arc-seconds/year * 100 years = ~5029 arc-seconds/century
    // = ~1.397 degrees/century
    const rate = 1.39722;
    
    // Calculate ayanamsa for the given date
    const ayanamsa = ayanamsa_2000 + (rate * T);
    
    return ayanamsa;
}

/**
 * Convert a JavaScript Date to Julian Day Number
 * 
 * @param date - JavaScript Date object
 * @returns Julian Day Number
 */
function dateToJulianDay(date: Date): number {
    // Get UTC values
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const milliseconds = date.getUTCMilliseconds();
    
    // Convert time to decimal day fraction
    const dayFraction = (hours + minutes / 60.0 + seconds / 3600.0 + milliseconds / 3600000.0) / 24.0;
    
    // Standard Julian Day calculation
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    return jdn + dayFraction - 0.5;
}

/**
 * Convert tropical longitude to sidereal longitude using Lahiri ayanamsa
 * 
 * @param tropicalLongitude - Tropical longitude in degrees (0-360)
 * @param date - Date for which to apply the correction
 * @returns Sidereal longitude in degrees (0-360)
 */
export function tropicalToSidereal(tropicalLongitude: number, date: Date): number {
    const ayanamsa = getLahiriAyanamsa(date);
    let siderealLongitude = tropicalLongitude - ayanamsa;
    
    // Normalize to 0-360 range
    while (siderealLongitude < 0) {
        siderealLongitude += 360;
    }
    while (siderealLongitude >= 360) {
        siderealLongitude -= 360;
    }
    
    return siderealLongitude;
}

/**
 * Get detailed ayanamsa information for debugging
 * 
 * @param date - The date to check
 * @returns Object with ayanamsa details
 */
export function getAyanamsaInfo(date: Date): {
    ayanamsa: number;
    ayanamsaDMS: string;
    julianDay: number;
    julianCenturies: number;
} {
    const ayanamsa = getLahiriAyanamsa(date);
    const jd = dateToJulianDay(date);
    const J2000 = 2451545.0;
    const T = (jd - J2000) / 36525.0;
    
    // Convert to DMS (Degrees, Minutes, Seconds)
    const degrees = Math.floor(ayanamsa);
    const minutesDecimal = (ayanamsa - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = (minutesDecimal - minutes) * 60;
    const ayanamsaDMS = `${degrees}° ${minutes}' ${seconds.toFixed(2)}"`;
    
    return {
        ayanamsa,
        ayanamsaDMS,
        julianDay: jd,
        julianCenturies: T
    };
}
