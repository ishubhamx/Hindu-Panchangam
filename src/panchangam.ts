import { Body, GeoVector, Ecliptic as EclipticFunc, Observer, SearchRiseSet } from "astronomy-engine";

export interface KaranaTransition {
    name: string;
    endTime: Date;
}

export interface TithiTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface NakshatraTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface YogaTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface Panchangam {
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: string;
    vara: number;
    sunrise: Date | null;
    sunset: Date | null;
    moonrise: Date | null;
    moonset: Date | null;
    nakshatraStartTime: Date | null;
    nakshatraEndTime: Date | null;
    tithiStartTime: Date | null;
    tithiEndTime: Date | null;
    yogaEndTime: Date | null;
    rahuKalamStart: Date | null;
    rahuKalamEnd: Date | null;
    karanaTransitions: KaranaTransition[];
    tithiTransitions: TithiTransition[];
    nakshatraTransitions: NakshatraTransition[];
    yogaTransitions: YogaTransition[];
}

export interface PanchangamDetails extends Panchangam {
    sunrise: Date | null;
}

const repeatingKaranaNames = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"
];

const fixedKaranaNames = [
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

export const karanaNames = [...repeatingKaranaNames, ...fixedKaranaNames];

export const yogaNames = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha",
    "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const tithiNames = [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getTithi(sunLon: number, moonLon: number): number {
    let longitudeDifference = moonLon - sunLon;
    if (longitudeDifference < 0) {
        longitudeDifference += 360;
    }
    return Math.floor(longitudeDifference / 12);
}

function getNakshatra(moonLon: number): number {
    return Math.floor(moonLon / (13 + 1/3));
}

function getYoga(sunLon: number, moonLon: number): number {
    const totalLongitude = sunLon + moonLon;
    return Math.floor(totalLongitude / (13 + 1/3)) % 27;
}

function getKarana(sunLon: number, moonLon: number): string {
    let longitudeDifference = moonLon - sunLon;
    if (longitudeDifference < 0) {
        longitudeDifference += 360;
    }

    const karanaIndexAbs = Math.floor(longitudeDifference / 6);

    if (karanaIndexAbs === 0) {
        return "Kimstughna";
    }
    if (karanaIndexAbs === 57) {
        return "Shakuni";
    }
    if (karanaIndexAbs === 58) {
        return "Chatushpada";
    }
    if (karanaIndexAbs === 59) {
        return "Naga";
    }
    
    const repeatingIndex = (karanaIndexAbs - 1) % 7;
    return repeatingKaranaNames[repeatingIndex];
}

function getVara(date: Date): number {
    return date.getDay();
}

function getSunrise(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day to ensure we get sunrise for the correct date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const time = SearchRiseSet(Body.Sun, observer, 1, startOfDay, 1);
    if (!time) return null;
    
    const sunrise = time.date;
    
    // Check if sunrise is within the same calendar day (UTC)
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    if (sunrise >= startOfDay && sunrise <= endOfDay) {
        return sunrise;
    }
    
    return null;
}

function getSunset(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day to ensure we get sunset for the correct date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const time = SearchRiseSet(Body.Sun, observer, -1, startOfDay, 1);
    if (!time) return null;
    
    const sunset = time.date;
    
    // Check if sunset is within the same calendar day (UTC)
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    if (sunset >= startOfDay && sunset <= endOfDay) {
        return sunset;
    }
    
    return null;
}

function getMoonrise(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const time = SearchRiseSet(Body.Moon, observer, 1, startOfDay, 1);
    if (!time) return null;
    
    const moonrise = time.date;
    
    // Check if moonrise is within the same calendar day (UTC)
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    if (moonrise >= startOfDay && moonrise <= endOfDay) {
        return moonrise;
    }
    
    // Moon might rise the next day, which is valid
    return moonrise;
}

function getMoonset(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const time = SearchRiseSet(Body.Moon, observer, -1, startOfDay, 1);
    if (!time) return null;
    
    const moonset = time.date;
    
    // Check if moonset is within the same calendar day (UTC)
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    if (moonset >= startOfDay && moonset <= endOfDay) {
        return moonset;
    }
    
    // Moon might set the next day, which is valid
    return moonset;
}

/**
 * A generic search function to find the time when a function f(t) crosses zero.
 * It uses a binary search approach.
 */
function search(f: (date: Date) => number, startDate: Date): Date | null {
    let a = startDate;
    let b = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000); // Look ahead 2 days

    let fa = f(a);
    let fb = f(b);

    if (fa * fb >= 0) {
        // We need the function to cross zero in the interval. 
        // If not, we might not find a root.
        // This can happen if a tithi/nakshatra doesn't end within the next 2 days, which is rare.
        return null;
    }

    for (let i = 0; i < 20; i++) { // 20 iterations are enough for high precision
        const m = new Date((a.getTime() + b.getTime()) / 2);
        const fm = f(m);
        if (fm * fa < 0) {
            b = m;
            fb = fm;
        } else {
            a = m;
            fa = fm;
        }
    }
    return a;
}

function findNakshatraStart(date: Date): Date | null {
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    const currentNakshatraIndex = Math.floor(moonLonInitial / (13 + 1/3));
    const startNakshatraLongitude = currentNakshatraIndex * (13 + 1/3);

    const targetLon = startNakshatraLongitude % 360;

    const nakshatraFunc = (d: Date): number => {
        let moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        // Handle the 360->0 wrap-around for the search.
        if (moonLon > targetLon + 180) {
            moonLon -= 360;
        }
        return moonLon - targetLon;
    };

    // A nakshatra lasts about a day. Searching from 25 hours before should be safe.
    const searchStartDate = new Date(date.getTime() - 25 * 60 * 60 * 1000);
    return search(nakshatraFunc, searchStartDate);
}

function findNakshatraEnd(date: Date): Date | null {
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    const currentNakshatra = Math.floor(moonLonInitial / (13 + 1/3));
    const nextNakshatraLongitude = (currentNakshatra + 1) * (13 + 1/3);
    
    const targetLon = nextNakshatraLongitude % 360;

    const nakshatraFunc = (d: Date): number => {
        let moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        // Handle the 360->0 wrap-around
        if (moonLon < targetLon - 180) {
            moonLon += 360;
        }
        return moonLon - targetLon;
    };

    return search(nakshatraFunc, date);
}

function findTithiStart(date: Date): Date | null {
    const sunLonInitial = EclipticFunc(GeoVector(Body.Sun, date, true)).elon;
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    let diffInitial = moonLonInitial - sunLonInitial;
    if (diffInitial < 0) diffInitial += 360;

    const currentTithi = Math.floor(diffInitial / 12);
    const startTithiAngle = currentTithi * 12;
    const targetAngle = startTithiAngle % 360;

    const tithiFunc = (d: Date): number => {
        const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let diff = moonLon - sunLon;
        if (diff < 0) diff += 360;

        // Handle the 360->0 wrap-around for search.
        if (diff > targetAngle + 180) {
            diff -= 360;
        }
        return diff - targetAngle;
    }

    // A tithi is slightly less than a day. Searching from 25h before is safe.
    const searchStartDate = new Date(date.getTime() - 25 * 60 * 60 * 1000);
    return search(tithiFunc, searchStartDate);
}

function findTithiEnd(date: Date): Date | null {
    const sunLonInitial = EclipticFunc(GeoVector(Body.Sun, date, true)).elon;
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    let diffInitial = moonLonInitial - sunLonInitial;
    if (diffInitial < 0) diffInitial += 360;

    const currentTithi = Math.floor(diffInitial / 12);
    const nextTithiAngle = (currentTithi + 1) * 12;
    const targetAngle = nextTithiAngle % 360;

    const tithiFunc = (d: Date): number => {
        const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let diff = moonLon - sunLon;
        if (diff < 0) diff += 360;

        if (diff < targetAngle - 180) {
            diff += 360;
        }
        return diff - targetAngle;
    }

    return search(tithiFunc, date);
}

function findYogaEnd(date: Date): Date | null {
    const sunLonInitial = EclipticFunc(GeoVector(Body.Sun, date, true)).elon;
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    const totalLongitudeInitial = sunLonInitial + moonLonInitial;

    const yogaWidth = 360 / 27; // 13 degrees 20 minutes
    const currentYogaTotalIndex = Math.floor(totalLongitudeInitial / yogaWidth);
    const nextYogaBoundary = (currentYogaTotalIndex + 1) * yogaWidth;

    const yogaFunc = (d: Date): number => {
        const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let totalLon = sunLon + moonLon;

        // If totalLon is much smaller than our target, it means one of the
        // components (likely the moon) has wrapped around from 360 to 0.
        // We add 360 to make the value monotonic for the search function.
        if (totalLon < nextYogaBoundary - 270) {
            totalLon += 360;
        }

        return totalLon - nextYogaBoundary;
    };

    return search(yogaFunc, date);
}

function calculateRahuKalam(sunrise: Date, sunset: Date, vara: number): { start: Date, end: Date } | null {
    if (!sunrise || !sunset) {
        return null;
    }

    const daylightMillis = sunset.getTime() - sunrise.getTime();
    const portionMillis = daylightMillis / 8;

    const rahuKalamPortionIndex = [8, 2, 7, 5, 6, 4, 3]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const portionIndex = rahuKalamPortionIndex[vara];

    const startMillis = sunrise.getTime() + (portionIndex - 1) * portionMillis;
    const endMillis = sunrise.getTime() + portionIndex * portionMillis;

    return {
        start: new Date(startMillis),
        end: new Date(endMillis)
    };
}

/**
 * Find all Karana transitions (end times and names) between startDate and endDate (typically sunrise to next sunrise)
 */
function findKaranaTransitions(startDate: Date, endDate: Date): KaranaTransition[] {
    const transitions: KaranaTransition[] = [];
    let current = new Date(startDate);
    let lastKarana = getKarana(
        EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
        EclipticFunc(GeoVector(Body.Moon, current, true)).elon
    );
    while (current < endDate) {
        // Find next Karana end
        const nextKaranaEnd = (() => {
            // Karana changes every 6 degrees of moon-sun difference
            const sunLon = EclipticFunc(GeoVector(Body.Sun, current, true)).elon;
            const moonLon = EclipticFunc(GeoVector(Body.Moon, current, true)).elon;
            let diff = moonLon - sunLon;
            if (diff < 0) diff += 360;
            const karanaIndexAbs = Math.floor(diff / 6);
            const nextKaranaAngle = (karanaIndexAbs + 1) * 6;
            const targetAngle = nextKaranaAngle % 360;
            const karanaFunc = (d: Date): number => {
                const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
                const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
                let diff = moonLon - sunLon;
                if (diff < 0) diff += 360;
                if (diff < targetAngle - 180) diff += 360;
                return diff - targetAngle;
            };
            return search(karanaFunc, current);
        })();
        if (!nextKaranaEnd || nextKaranaEnd > endDate) {
            // Last Karana for the day
            transitions.push({ name: lastKarana, endTime: endDate });
            break;
        } else {
            transitions.push({ name: lastKarana, endTime: nextKaranaEnd });
            current = new Date(nextKaranaEnd.getTime() + 60 * 1000); // move 1 min ahead to avoid infinite loop
            lastKarana = getKarana(
                EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
                EclipticFunc(GeoVector(Body.Moon, current, true)).elon
            );
        }
    }
    return transitions;
}

function findTithiTransitions(startDate: Date, endDate: Date): TithiTransition[] {
    const transitions: TithiTransition[] = [];
    let current = new Date(startDate);
    let lastTithi = getTithi(
        EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
        EclipticFunc(GeoVector(Body.Moon, current, true)).elon
    );
    while (current < endDate) {
        const nextTithiEnd = (() => {
            const sunLon = EclipticFunc(GeoVector(Body.Sun, current, true)).elon;
            const moonLon = EclipticFunc(GeoVector(Body.Moon, current, true)).elon;
            let diff = moonLon - sunLon;
            if (diff < 0) diff += 360;
            const tithiIndex = Math.floor(diff / 12);
            const nextTithiAngle = (tithiIndex + 1) * 12;
            const targetAngle = nextTithiAngle % 360;
            const tithiFunc = (d: Date): number => {
                const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
                const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
                let diff = moonLon - sunLon;
                if (diff < 0) diff += 360;
                if (diff < targetAngle - 180) diff += 360;
                return diff - targetAngle;
            };
            return search(tithiFunc, current);
        })();
        if (!nextTithiEnd || nextTithiEnd > endDate) {
            transitions.push({ index: lastTithi, name: tithiNames[lastTithi] || String(lastTithi), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastTithi, name: tithiNames[lastTithi] || String(lastTithi), endTime: nextTithiEnd });
            current = new Date(nextTithiEnd.getTime() + 60 * 1000);
            lastTithi = getTithi(
                EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
                EclipticFunc(GeoVector(Body.Moon, current, true)).elon
            );
        }
    }
    return transitions;
}

function findNakshatraTransitions(startDate: Date, endDate: Date): NakshatraTransition[] {
    const transitions: NakshatraTransition[] = [];
    let current = new Date(startDate);
    let lastNakshatra = getNakshatra(
        EclipticFunc(GeoVector(Body.Moon, current, true)).elon
    );
    while (current < endDate) {
        const nextNakshatraEnd = (() => {
            const moonLon = EclipticFunc(GeoVector(Body.Moon, current, true)).elon;
            const nakshatraIndex = Math.floor(moonLon / (13 + 1/3));
            const nextNakshatraLongitude = (nakshatraIndex + 1) * (13 + 1/3);
            const targetLon = nextNakshatraLongitude % 360;
            const nakshatraFunc = (d: Date): number => {
                let moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
                if (moonLon < targetLon - 180) moonLon += 360;
                return moonLon - targetLon;
            };
            return search(nakshatraFunc, current);
        })();
        if (!nextNakshatraEnd || nextNakshatraEnd > endDate) {
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), endTime: nextNakshatraEnd });
            current = new Date(nextNakshatraEnd.getTime() + 60 * 1000);
            lastNakshatra = getNakshatra(
                EclipticFunc(GeoVector(Body.Moon, current, true)).elon
            );
        }
    }
    return transitions;
}

function findYogaTransitions(startDate: Date, endDate: Date): YogaTransition[] {
    const transitions: YogaTransition[] = [];
    let current = new Date(startDate);
    let lastYoga = getYoga(
        EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
        EclipticFunc(GeoVector(Body.Moon, current, true)).elon
    );
    while (current < endDate) {
        const nextYogaEnd = (() => {
            const sunLon = EclipticFunc(GeoVector(Body.Sun, current, true)).elon;
            const moonLon = EclipticFunc(GeoVector(Body.Moon, current, true)).elon;
            const totalLongitude = sunLon + moonLon;
            const yogaWidth = 360 / 27;
            const yogaIndex = Math.floor(totalLongitude / yogaWidth);
            const nextYogaBoundary = (yogaIndex + 1) * yogaWidth;
            const yogaFunc = (d: Date): number => {
                const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
                const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
                let totalLon = sunLon + moonLon;
                if (totalLon < nextYogaBoundary - 270) totalLon += 360;
                return totalLon - nextYogaBoundary;
            };
            return search(yogaFunc, current);
        })();
        if (!nextYogaEnd || nextYogaEnd > endDate) {
            transitions.push({ index: lastYoga, name: yogaNames[lastYoga] || String(lastYoga), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastYoga, name: yogaNames[lastYoga] || String(lastYoga), endTime: nextYogaEnd });
            current = new Date(nextYogaEnd.getTime() + 60 * 1000);
            lastYoga = getYoga(
                EclipticFunc(GeoVector(Body.Sun, current, true)).elon,
                EclipticFunc(GeoVector(Body.Moon, current, true)).elon
            );
        }
    }
    return transitions;
}

export function getPanchangam(date: Date, observer: Observer): Panchangam {
    const sunVector = GeoVector(Body.Sun, date, true);
    const moonVector = GeoVector(Body.Moon, date, true);
    
    const sunEcliptic = EclipticFunc(sunVector);
    const moonEcliptic = EclipticFunc(moonVector);

    const sunrise = getSunrise(date, observer);
    const sunset = getSunset(date, observer);
    const moonrise = getMoonrise(date, observer);
    const moonset = getMoonset(date, observer);

    const nakshatraStartTime = findNakshatraStart(date);
    const nakshatraEndTime = findNakshatraEnd(date);
    const tithiStartTime = findTithiStart(date);
    const tithiEndTime = findTithiEnd(date);
    const yogaEndTime = findYogaEnd(date);

    const rahuKalam = (sunrise && sunset) ? calculateRahuKalam(sunrise, sunset, getVara(date)) : null;

    // For Karana transitions, use sunrise to next day's sunrise
    let nextSunrise: Date | null = null;
    if (sunrise) {
        const nextDay = new Date(sunrise.getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        nextSunrise = getSunrise(nextDay, observer);
    }
    const karanaTransitions = (sunrise && nextSunrise)
        ? findKaranaTransitions(sunrise, nextSunrise)
        : [];
    const tithiTransitions = (sunrise && nextSunrise)
        ? findTithiTransitions(sunrise, nextSunrise)
        : [];
    const nakshatraTransitions = (sunrise && nextSunrise)
        ? findNakshatraTransitions(sunrise, nextSunrise)
        : [];
    const yogaTransitions = (sunrise && nextSunrise)
        ? findYogaTransitions(sunrise, nextSunrise)
        : [];

    return {
        tithi: getTithi(sunEcliptic.elon, moonEcliptic.elon),
        nakshatra: getNakshatra(moonEcliptic.elon),
        yoga: getYoga(sunEcliptic.elon, moonEcliptic.elon),
        karana: getKarana(sunEcliptic.elon, moonEcliptic.elon),
        vara: getVara(date),
        sunrise,
        sunset,
        moonrise,
        moonset,
        nakshatraStartTime,
        nakshatraEndTime,
        tithiStartTime,
        tithiEndTime,
        yogaEndTime,
        rahuKalamStart: rahuKalam?.start || null,
        rahuKalamEnd: rahuKalam?.end || null,
        karanaTransitions,
        tithiTransitions,
        nakshatraTransitions,
        yogaTransitions,
    };
}

export function getPanchangamDetails(date: Date, observer: Observer): PanchangamDetails {
    const panchangam = getPanchangam(date, observer);
    const sunrise = getSunrise(date, observer);
    const sunset = getSunset(date, observer);
    const nakshatraEndTime = findNakshatraEnd(date);

    return {
        ...panchangam,
        sunrise,
        sunset,
        nakshatraEndTime,
    };
}