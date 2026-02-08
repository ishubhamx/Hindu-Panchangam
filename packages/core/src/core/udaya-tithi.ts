import { Observer, GeoVector, Body, Ecliptic as EclipticFunc } from 'astronomy-engine';
import { getTithi, getPaksha } from './calculations';
import { getAyanamsa } from './ayanamsa';

/**
 * Get the 1-indexed Tithi (1-30) at an arbitrary point in time.
 *
 * This is ayanamsa-independent because the Moon−Sun difference cancels any
 * constant offset, so tropical longitudes are used directly.
 *
 * @param time - The instant at which to evaluate
 * @returns Tithi index (1-30)
 */
export function getTithiAtTime(time: Date): number {
    const sunLon  = EclipticFunc(GeoVector(Body.Sun, time, true)).elon;
    const moonLon = EclipticFunc(GeoVector(Body.Moon, time, true)).elon;
    return getTithi(sunLon, moonLon) + 1;
}

/**
 * Udaya Tithi Calculation
 * 
 * Get the Tithi prevailing at sunrise (Udaya Tithi).
 * This is the correct method for determining festival dates per Hindu tradition.
 * 
 * @param date - Date for which to find Udaya Tithi
 * @param sunrise - Sunrise time on that date
 * @param observer - Observer location
 * @returns Tithi index (1-30) prevailing at sunrise
 */
export function getTithiAtSunrise(date: Date, sunrise: Date, observer: Observer): number {
    return getTithiAtTime(sunrise);
}

/**
 * Check if a specific Tithi touches (is prevailing at) sunrise
 * 
 * @param tithiIndex - Tithi to check (1-30)
 * @param date - Date to check
 * @param sunrise - Sunrise time
 * @param observer - Observer location
 * @returns true if the Tithi is prevailing at sunrise
 */
export function doesTithiTouchSunrise(
    tithiIndex: number,
    date: Date,
    sunrise: Date,
    observer: Observer
): boolean {
    const udayaTithi = getTithiAtSunrise(date, sunrise, observer);
    return udayaTithi === tithiIndex;
}

/**
 * Get detailed Udaya Tithi information including start/end times
 * 
 * @param date - Date for calculation
 * @param sunrise - Sunrise time
 * @param observer - Observer location
 * @returns Detailed UdayaTithiInfo
 */
export function getUdayaTithiInfo(
    date: Date,
    sunrise: Date,
    observer: Observer
): {
    tithi: number;
    paksha: string;
    tithiStart: Date;
    tithiEnd: Date;
} {
    const udayaTithi = getTithiAtSunrise(date, sunrise, observer);
    const paksha = getPaksha(udayaTithi);

    // Find when this Tithi starts and ends
    const searchStart = new Date(sunrise.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tithiTransition = findTithiTransition(udayaTithi, searchStart, new Date(sunrise.getTime() + 24 * 60 * 60 * 1000), observer);

    return {
        tithi: udayaTithi,
        paksha,
        tithiStart: tithiTransition.start,
        tithiEnd: tithiTransition.end
    };
}

/**
 * Helper to find when a specific Tithi starts and ends
 */
function findTithiTransition(
    targetTithi: number,
    searchStart: Date,
    searchEnd: Date,
    observer: Observer
): { start: Date; end: Date } {
    const tithiFunc = (d: Date): number => {
        const sv = GeoVector(Body.Sun, d, true);
        const mv = GeoVector(Body.Moon, d, true);
        const sLon = EclipticFunc(sv).elon;
        const mLon = EclipticFunc(mv).elon;
        return getTithi(sLon, mLon);
    };

    // Find start time
    let lo = searchStart.getTime();
    let hi = searchEnd.getTime();

    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        const tithiAtMid = tithiFunc(new Date(mid));

        if (tithiAtMid < targetTithi) {
            lo = mid;
        } else {
            hi = mid;
        }

        if (hi - lo < 60000) break;
    }
    const startTime = new Date((lo + hi) / 2);

    // Find end time
    const nextTithi = (targetTithi % 30) + 1;
    lo = startTime.getTime();
    hi = searchEnd.getTime();

    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        const tithiAtMid = tithiFunc(new Date(mid));

        if (tithiAtMid === targetTithi) {
            lo = mid;
        } else {
            hi = mid;
        }

        if (hi - lo < 60000) break;
    }
    const endTime = new Date((lo + hi) / 2);

    return { start: startTime, end: endTime };
}
