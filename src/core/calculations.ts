import { Body, GeoVector, Ecliptic as EclipticFunc, Observer, SearchRiseSet } from "astronomy-engine";
import { repeatingKaranaNames, tithiNames, nakshatraNames, yogaNames, rashiNames, horaRulers } from "./constants";
import { KaranaTransition, TithiTransition, NakshatraTransition, YogaTransition, PlanetaryPosition, MuhurtaTime } from "./types";

export function getTithi(sunLon: number, moonLon: number): number {
    let longitudeDifference = moonLon - sunLon;
    if (longitudeDifference < 0) {
        longitudeDifference += 360;
    }
    return Math.floor(longitudeDifference / 12);
}

export function getNakshatra(moonLon: number): number {
    return Math.floor(moonLon / (13 + 1 / 3));
}

export function getYoga(sunLon: number, moonLon: number): number {
    const totalLongitude = sunLon + moonLon;
    return Math.floor(totalLongitude / (13 + 1 / 3)) % 27;
}

export function getKarana(sunLon: number, moonLon: number): string {
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

export function getVara(date: Date): number {
    return date.getDay();
}

export function getSunrise(date: Date, observer: Observer): Date | null {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Sun, observer, 1, startOfDay, 1);
    if (!time) return null;

    const sunrise = time.date;

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (sunrise >= startOfDay && sunrise <= endOfDay) {
        return sunrise;
    }

    return null;
}

export function getSunset(date: Date, observer: Observer): Date | null {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Sun, observer, -1, startOfDay, 1);
    if (!time) return null;

    const sunset = time.date;

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (sunset >= startOfDay && sunset <= endOfDay) {
        return sunset;
    }

    return null;
}

export function getMoonrise(date: Date, observer: Observer): Date | null {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Moon, observer, 1, startOfDay, 1);
    if (!time) return null;

    const moonrise = time.date;

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (moonrise >= startOfDay && moonrise <= endOfDay) {
        return moonrise;
    }
    return moonrise;
}

export function getMoonset(date: Date, observer: Observer): Date | null {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Moon, observer, -1, startOfDay, 1);
    if (!time) return null;

    const moonset = time.date;

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (moonset >= startOfDay && moonset <= endOfDay) {
        return moonset;
    }
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

export function findNakshatraStart(date: Date, ayanamsa: number): Date | null {
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    // Sidereal Longitude
    const moonLonSidereal = (moonLonInitial - ayanamsa + 360) % 360;

    const currentNakshatraIndex = Math.floor(moonLonSidereal / (13 + 1 / 3));
    const startNakshatraLongitude = currentNakshatraIndex * (13 + 1 / 3);

    const targetLon = startNakshatraLongitude; // This is in Sidereal frame

    const nakshatraFunc = (d: Date): number => {
        let moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let moonLonSid = (moonLon - ayanamsa + 360) % 360;

        // Handle the 360->0 wrap-around for the search.
        if (moonLonSid > targetLon + 180) {
            moonLonSid -= 360;
        }

        // Standard diff logic
        let diff = moonLonSid - targetLon;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        return diff;
    };

    // A nakshatra lasts about a day. Searching from 25 hours before should be safe.
    const searchStartDate = new Date(date.getTime() - 25 * 60 * 60 * 1000);
    return search(nakshatraFunc, searchStartDate);
}

export function findNakshatraEnd(date: Date, ayanamsa: number): Date | null {
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;
    const moonLonSidereal = (moonLonInitial - ayanamsa + 360) % 360;

    const currentNakshatra = Math.floor(moonLonSidereal / (13 + 1 / 3));
    const nextNakshatraLongitude = (currentNakshatra + 1) * (13 + 1 / 3);

    const targetLon = nextNakshatraLongitude % 360;

    const nakshatraFunc = (d: Date): number => {
        let moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let moonLonSid = (moonLon - ayanamsa + 360) % 360;

        // Handle the 360->0 wrap-around
        let diff = moonLonSid - targetLon;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        return diff;
    };

    return search(nakshatraFunc, date);
}

export function findTithiStart(date: Date): Date | null {
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

export function findTithiEnd(date: Date): Date | null {
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

export function findYogaEnd(date: Date, ayanamsa: number): Date | null {
    const sunLonInitial = EclipticFunc(GeoVector(Body.Sun, date, true)).elon;
    const moonLonInitial = EclipticFunc(GeoVector(Body.Moon, date, true)).elon;

    const sunLonSid = (sunLonInitial - ayanamsa + 360) % 360;
    const moonLonSid = (moonLonInitial - ayanamsa + 360) % 360;

    const totalLongitudeInitial = sunLonSid + moonLonSid;

    const yogaWidth = 360 / 27; // 13 degrees 20 minutes
    const currentYogaTotalIndex = Math.floor(totalLongitudeInitial / yogaWidth);
    const nextYogaBoundary = (currentYogaTotalIndex + 1) * yogaWidth;

    const yogaFunc = (d: Date): number => {
        const sunLon = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const moonLon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;

        let sunLonS = (sunLon - ayanamsa + 360) % 360;
        let moonLonS = (moonLon - ayanamsa + 360) % 360;

        let totalLon = sunLonS + moonLonS;

        if (totalLon < nextYogaBoundary - 270) {
            totalLon += 360;
        }

        return totalLon - nextYogaBoundary;
    };

    return search(yogaFunc, date);
}

export function getPlanetaryPosition(body: Body, date: Date, ayanamsa: number): PlanetaryPosition {
    const vector = GeoVector(body, date, true);
    const ecliptic = EclipticFunc(vector);
    const tropicalLon = ecliptic.elon;

    const longitude = (tropicalLon - ayanamsa + 360) % 360;

    const rashi = Math.floor(longitude / 30);
    const degree = longitude % 30;

    return {
        longitude,
        rashi,
        rashiName: rashiNames[rashi],
        degree
    };
}

export function calculateAbhijitMuhurta(sunrise: Date, sunset: Date): MuhurtaTime | null {
    if (!sunrise || !sunset) return null;

    const dayDuration = sunset.getTime() - sunrise.getTime();
    const noonTime = sunrise.getTime() + (dayDuration / 2);

    // Abhijit Muhurta is typically 1 Muhurta (48 minutes) centered around solar noon
    // So 24 minutes before and after local noon
    const abhijitStart = new Date(noonTime - 24 * 60 * 1000);
    const abhijitEnd = new Date(noonTime + 24 * 60 * 1000);

    return {
        start: abhijitStart,
        end: abhijitEnd
    };
}

export function calculateBrahmaMuhurta(sunrise: Date): MuhurtaTime | null {
    if (!sunrise) return null;

    // Brahma Muhurta is the last 1/8th of the night, approximately 96 minutes before sunrise
    const brahmaMuhurtaStart = new Date(sunrise.getTime() - 96 * 60 * 1000);
    const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 48 * 60 * 1000);

    return {
        start: brahmaMuhurtaStart,
        end: brahmaMuhurtaEnd
    };
}

export function calculateGovardhanMuhurta(sunrise: Date, sunset: Date): MuhurtaTime | null {
    if (!sunrise || !sunset) return null;

    const dayDuration = sunset.getTime() - sunrise.getTime();
    // Govardhan Muhurta is in the afternoon, typically in the 6th hour (5/8 to 6/8 of day)
    const govardhanStart = new Date(sunrise.getTime() + (5 * dayDuration / 8));
    const govardhanEnd = new Date(sunrise.getTime() + (6 * dayDuration / 8));

    return {
        start: govardhanStart,
        end: govardhanEnd
    };
}

export function calculateYamagandaKalam(sunrise: Date, sunset: Date, vara: number): MuhurtaTime | null {
    if (!sunrise || !sunset) return null;

    const daylightMillis = sunset.getTime() - sunrise.getTime();
    const portionMillis = daylightMillis / 8;

    // Yamaganda Kalam portions for each day: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    // Rule: Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6
    const yamagandaPortionIndex = [5, 4, 3, 2, 1, 7, 6];
    const portionIndex = yamagandaPortionIndex[vara];

    const startMillis = sunrise.getTime() + (portionIndex - 1) * portionMillis;
    const endMillis = sunrise.getTime() + portionIndex * portionMillis;

    return {
        start: new Date(startMillis),
        end: new Date(endMillis)
    };
}

export function calculateGulikaKalam(sunrise: Date, sunset: Date, vara: number): MuhurtaTime | null {
    if (!sunrise || !sunset) return null;

    const daylightMillis = sunset.getTime() - sunrise.getTime();
    const portionMillis = daylightMillis / 8;

    // Gulika Kalam portions for each day: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    // Rule: Sun=7, Mon=6, Tue=5, Wed=4, Thu=3, Fri=2, Sat=1
    const gulikaPortionIndex = [7, 6, 5, 4, 3, 2, 1];
    const portionIndex = gulikaPortionIndex[vara];

    const startMillis = sunrise.getTime() + (portionIndex - 1) * portionMillis;
    const endMillis = sunrise.getTime() + portionIndex * portionMillis;

    return {
        start: new Date(startMillis),
        end: new Date(endMillis)
    };
}

export function calculateDurMuhurta(sunrise: Date, sunset: Date): MuhurtaTime[] | null {
    if (!sunrise || !sunset) return null;

    const dayDuration = sunset.getTime() - sunrise.getTime();
    const muhurtaDuration = dayDuration / 15; // Day is divided into 15 muhurtas

    const durMuhurtas: MuhurtaTime[] = [];

    // 4th Muhurta (around 10-11 AM)
    const fourthStart = new Date(sunrise.getTime() + 3 * muhurtaDuration);
    const fourthEnd = new Date(sunrise.getTime() + 4 * muhurtaDuration);
    durMuhurtas.push({ start: fourthStart, end: fourthEnd });

    // 6th Muhurta (around 12-1 PM)  
    const sixthStart = new Date(sunrise.getTime() + 5 * muhurtaDuration);
    const sixthEnd = new Date(sunrise.getTime() + 6 * muhurtaDuration);
    durMuhurtas.push({ start: sixthStart, end: sixthEnd });

    // 14th Muhurta (late afternoon)
    const fourteenthStart = new Date(sunrise.getTime() + 13 * muhurtaDuration);
    const fourteenthEnd = new Date(sunrise.getTime() + 14 * muhurtaDuration);
    durMuhurtas.push({ start: fourteenthStart, end: fourteenthEnd });

    return durMuhurtas;
}

export function calculateChandraBalam(moonLon: number, sunLon: number): number {
    // Calculate moon strength based on the angular distance from sun
    let angularDistance = Math.abs(moonLon - sunLon);
    if (angularDistance > 180) {
        angularDistance = 360 - angularDistance;
    }

    // Full moon (180 degrees apart) = 100% strength
    // New moon (0 degrees apart) = 0% strength
    return Math.round((angularDistance / 180) * 100);
}

export function getCurrentHora(date: Date, sunrise: Date): string {
    if (!sunrise) return horaRulers[0]; // Default to Sun

    const dayOfWeek = date.getDay();
    const millisecondsFromSunrise = date.getTime() - sunrise.getTime();

    // If the time is before sunrise, use the previous day's calculation
    if (millisecondsFromSunrise < 0) {
        // Calculate previous day's sunrise
        const prevDay = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const prevDayOfWeek = prevDay.getDay();
        const hoursFromPrevSunrise = Math.abs(millisecondsFromSunrise) / (1000 * 60 * 60);

        const dayStartPlanet = [0, 3, 6, 2, 5, 1, 4]; // Sun=0, Moon=3, Mars=6, Mercury=2, Jupiter=5, Venus=1, Saturn=4
        const startPlanetIndex = dayStartPlanet[prevDayOfWeek];
        const horaIndex = (startPlanetIndex + Math.floor(24 - hoursFromPrevSunrise)) % 7;
        return horaRulers[horaIndex];
    }

    const hoursFromSunrise = millisecondsFromSunrise / (1000 * 60 * 60);

    // Each hora is approximately 1 hour
    // Starting planet varies by day of week
    const dayStartPlanet = [0, 3, 6, 2, 5, 1, 4]; // Sun=0, Moon=3, Mars=6, Mercury=2, Jupiter=5, Venus=1, Saturn=4
    const startPlanetIndex = dayStartPlanet[dayOfWeek];

    const horaIndex = (startPlanetIndex + Math.floor(hoursFromSunrise)) % 7;
    return horaRulers[horaIndex];
}

export function calculateRahuKalam(sunrise: Date, sunset: Date, vara: number): { start: Date, end: Date } | null {
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

export function findKaranaTransitions(startDate: Date, endDate: Date): KaranaTransition[] {
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

export function findTithiTransitions(startDate: Date, endDate: Date): TithiTransition[] {
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

export function findNakshatraTransitions(startDate: Date, endDate: Date, ayanamsa: number): NakshatraTransition[] {
    const transitions: NakshatraTransition[] = [];
    let current = new Date(startDate);

    const getSiderealMoon = (d: Date) => {
        const m = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        return (m - ayanamsa + 360) % 360;
    };

    let lastNakshatra = getNakshatra(getSiderealMoon(current));

    while (current < endDate) {
        const nextNakshatraEnd = (() => {
            const moonLonSid = getSiderealMoon(current);
            const nakshatraIndex = Math.floor(moonLonSid / (13 + 1 / 3));
            const nextNakshatraLongitude = (nakshatraIndex + 1) * (13 + 1 / 3);
            const targetLon = nextNakshatraLongitude % 360;

            const nakshatraFunc = (d: Date): number => {
                let m = getSiderealMoon(d);
                let diff = m - targetLon;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                return diff;
            };
            return search(nakshatraFunc, current);
        })();
        if (!nextNakshatraEnd || nextNakshatraEnd > endDate) {
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), endTime: nextNakshatraEnd });
            current = new Date(nextNakshatraEnd.getTime() + 60 * 1000);
            lastNakshatra = getNakshatra(getSiderealMoon(current));
        }
    }
    return transitions;
}

export function findYogaTransitions(startDate: Date, endDate: Date, ayanamsa: number): YogaTransition[] {
    const transitions: YogaTransition[] = [];
    let current = new Date(startDate);

    const getSiderealSum = (d: Date) => {
        const sun = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const moon = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        return ((sun - ayanamsa + 360) % 360) + ((moon - ayanamsa + 360) % 360);
    };

    let lastYoga = getYoga(
        (EclipticFunc(GeoVector(Body.Sun, current, true)).elon - ayanamsa + 360) % 360,
        (EclipticFunc(GeoVector(Body.Moon, current, true)).elon - ayanamsa + 360) % 360
    );

    while (current < endDate) {
        const nextYogaEnd = (() => {
            const totalLongitude = getSiderealSum(current);
            const yogaWidth = 360 / 27;
            const yogaIndex = Math.floor(totalLongitude / yogaWidth);
            const nextYogaBoundary = (yogaIndex + 1) * yogaWidth;

            const yogaFunc = (d: Date): number => {
                let totalLon = getSiderealSum(d);
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

            const s = (EclipticFunc(GeoVector(Body.Sun, current, true)).elon - ayanamsa + 360) % 360;
            const m = (EclipticFunc(GeoVector(Body.Moon, current, true)).elon - ayanamsa + 360) % 360;
            lastYoga = getYoga(s, m);
        }
    }
    return transitions;
}
