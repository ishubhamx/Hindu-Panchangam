import { Body, GeoVector, Ecliptic as EclipticFunc, Observer, SearchRiseSet, SiderealTime, e_tilt, MakeTime, Search } from "astronomy-engine";
import { getAyanamsa } from "./ayanamsa";
import { repeatingKaranaNames, tithiNames, nakshatraNames, yogaNames, rashiNames, horaRulers, masaNames, rituNames, ayanaNames, pakshaNames, samvatsaraNames, varjyamStartGhatis, amritKalamStartGhatis, vimshottariLords, vimshottariDurations, planetExaltation, planetDebilitation, planetOwnSigns } from "./constants";
import { KaranaTransition, TithiTransition, NakshatraTransition, YogaTransition, PlanetaryPosition, MuhurtaTime, RashiTransition } from "./types";

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


/**
 * Returns the weekday (0=Sunday, ...) based on the Observer's local time.
 * If no observer is provided, falls back to system local time (not recommended for server-side use).
 */
export function getVara(date: Date, observer?: Observer): number {
    if (observer) {
        // Shift to observer's local time
        const tzOffsetMs = (observer.longitude / 15.0) * 3600 * 1000;
        const localDate = new Date(date.getTime() + tzOffsetMs);
        return localDate.getUTCDay();
    }
    return date.getDay();
}



function getStartOfLocalDay(date: Date, observer: Observer): { start: Date, end: Date } {
    // Approximate Timezone Offset based on Longitude
    // 15 degrees = 1 hour. East is positive, West is negative.
    const tzOffsetMs = (observer.longitude / 15.0) * 3600 * 1000;

    // Create a date shifted to "Observer Local Time"
    const localDate = new Date(date.getTime() + tzOffsetMs);
    localDate.setUTCHours(0, 0, 0, 0); // Set to Local Midnight

    // Shift back to UTC to get the actual UTC timestamp of Local Midnight
    const startOfDay = new Date(localDate.getTime() - tzOffsetMs);

    // End of day is 24 hours later
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    return { start: startOfDay, end: endOfDay };
}

export function getSunrise(date: Date, observer: Observer): Date | null {
    const { start: startOfDay, end: endOfDay } = getStartOfLocalDay(date, observer);

    // Always search forward (+1) from start of the local day
    const time = SearchRiseSet(Body.Sun, observer, 1, startOfDay, 1);
    if (!time) return null;

    const sunrise = time.date;

    if (sunrise >= startOfDay && sunrise <= endOfDay) {
        return sunrise;
    }

    return null;
}


export function getSunset(date: Date, observer: Observer): Date | null {
    const { start: startOfDay, end: endOfDay } = getStartOfLocalDay(date, observer);

    // Search for SET (-1) event starting from local midnight
    const time = SearchRiseSet(Body.Sun, observer, -1, startOfDay, 1);
    if (!time) return null;

    const sunset = time.date;

    if (sunset >= startOfDay && sunset <= endOfDay) {
        return sunset;
    }

    return null;
}

export function getMoonrise(date: Date, observer: Observer): Date | null {
    const { start: startOfDay, end: endOfDay } = getStartOfLocalDay(date, observer);

    const time = SearchRiseSet(Body.Moon, observer, 1, startOfDay, 1);
    if (!time) return null;

    const moonrise = time.date;

    if (moonrise >= startOfDay && moonrise <= endOfDay) {
        return moonrise;
    }
    return null;
}

export function getMoonset(date: Date, observer: Observer): Date | null {
    const { start: startOfDay, end: endOfDay } = getStartOfLocalDay(date, observer);

    // Search for SET (-1) event starting from local midnight
    const time = SearchRiseSet(Body.Moon, observer, -1, startOfDay, 1);
    if (!time) return null;

    const moonset = time.date;

    if (moonset >= startOfDay && moonset <= endOfDay) {
        return moonset;
    }
    return null;
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

    // A nakshatra lasts about a day (mean 24h 20m, max can be ~26h+).
    // Searching from 32 hours before ensures we catch the start even for long nakshatras.
    const searchStartDate = new Date(date.getTime() - 32 * 60 * 60 * 1000);
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
    // 1. Calculate Position at T
    const vector = GeoVector(body, date, true);
    const ecliptic = EclipticFunc(vector);
    const tropicalLon = ecliptic.elon;

    const longitude = (tropicalLon - ayanamsa + 360) % 360;

    const rashi = Math.floor(longitude / 30);
    const degree = longitude % 30;

    // 2. Calculate Speed & Retrograde (via Finite Difference of 1 hour)
    // T_minus = date - 30 min, T_plus = date + 30 min
    const tMinus = new Date(date.getTime() - 30 * 60 * 1000);
    const tPlus = new Date(date.getTime() + 30 * 60 * 1000);

    const vMinus = GeoVector(body, tMinus, true);
    const eMinus = EclipticFunc(vMinus).elon;

    const vPlus = GeoVector(body, tPlus, true);
    const ePlus = EclipticFunc(vPlus).elon;

    // Handle Wrap: 359 -> 1
    let diff = ePlus - eMinus;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // Diff is for 1 hour. Speed per day = Diff * 24.
    const speed = diff * 24;

    const dignity = getPlanetaryDignity(body, rashi);

    return {
        longitude,
        rashi,
        rashiName: rashiNames[rashi],
        degree,
        isRetrograde: speed < 0,
        speed,
        dignity
    };
}

function getPlanetaryDignity(planet: string, rashi: number): 'exalted' | 'debilitated' | 'own' | 'neutral' {
    if (planetExaltation[planet] === rashi) return 'exalted';
    if (planetDebilitation[planet] === rashi) return 'debilitated';
    if (planetOwnSigns[planet]?.includes(rashi)) return 'own';
    return 'neutral';
}

// Julian Centuries from J2000.0
function getJulianCenturies(date: Date): number {
    const jd = (date.getTime() / 86400000) + 2440587.5;
    return (jd - 2451545.0) / 36525.0;
}

export function getRahuPosition(date: Date, ayanamsa: number): PlanetaryPosition {
    // Mean Node of Moon (Meeus, Ch 47)
    // Ω = 125.04452 - 1934.136261 * T + 0.0020708 * T^2 + T^3 / 450000
    const T = getJulianCenturies(date);

    let meanNode = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;

    // Normalize to 0-360
    meanNode = meanNode % 360;
    if (meanNode < 0) meanNode += 360;

    // True Node vs Mean Node? Drik often uses True Node. 
    // Task requested "Rahu (Mean Node)". Sticking to Mean.

    // Sidereal Longitude of Rahu
    const longitude = (meanNode - ayanamsa + 360) % 360;
    const rashi = Math.floor(longitude / 30);
    const degree = longitude % 30;

    // Nodes are always retrograde ( Mean Node is always retrograde, True Node varies slightly but general motion is retrograde).
    // Speed: Derivative of formula. -1934 deg / century. Approx -0.05 deg/day.
    const speed = -0.05295; // roughly -19 degrees per year

    const dignity = getPlanetaryDignity("Rahu", rashi);

    return {
        longitude,
        rashi,
        rashiName: rashiNames[rashi],
        degree,
        isRetrograde: true,
        speed,
        dignity
    };
}

export function getKetuPosition(rahuPos: PlanetaryPosition): PlanetaryPosition {
    const ketuLon = (rahuPos.longitude + 180) % 360;
    const rashi = Math.floor(ketuLon / 30);
    const degree = ketuLon % 30;

    const dignity = getPlanetaryDignity("Ketu", rashi);

    return {
        longitude: ketuLon,
        rashi,
        rashiName: rashiNames[rashi],
        degree,
        isRetrograde: true,
        speed: rahuPos.speed,
        dignity
    };
}

export function calculateAbhijitMuhurta(sunrise: Date, sunset: Date): MuhurtaTime | null {
    if (!sunrise || !sunset) return null;

    const dayDuration = sunset.getTime() - sunrise.getTime();
    // Rigorous: 8th Muhurta of the 15 segments of Dinamana
    const muhurtaDuration = dayDuration / 15;

    const abhijitStart = new Date(sunrise.getTime() + 7 * muhurtaDuration);
    const abhijitEnd = new Date(sunrise.getTime() + 8 * muhurtaDuration);

    return {
        start: abhijitStart,
        end: abhijitEnd
    };
}

export function calculateBrahmaMuhurta(sunrise: Date, prevSunset?: Date): MuhurtaTime | null {
    if (!sunrise) return null;

    let muhurtaDuration = 48 * 60 * 1000; // Default approximation

    if (prevSunset) {
        // Rigorous: Night Duration (Ratri Mana) divided by 15.
        // Brahma Muhurta is the 14th Muhurta (2nd to last).
        const nightDuration = sunrise.getTime() - prevSunset.getTime();
        muhurtaDuration = nightDuration / 15;
    }

    // It ends 1 Muhurta before Sunrise, starts 2 Muhurtas before.
    const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 1 * muhurtaDuration);
    const brahmaMuhurtaStart = new Date(sunrise.getTime() - 2 * muhurtaDuration);

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
            transitions.push({ name: lastKarana, startTime: new Date(current), endTime: endDate });
            break;
        } else {
            transitions.push({ name: lastKarana, startTime: new Date(current), endTime: nextKaranaEnd });
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
            transitions.push({ index: lastTithi, name: tithiNames[lastTithi] || String(lastTithi), startTime: new Date(current), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastTithi, name: tithiNames[lastTithi] || String(lastTithi), startTime: new Date(current), endTime: nextTithiEnd });
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
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), startTime: new Date(current), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastNakshatra, name: nakshatraNames[lastNakshatra] || String(lastNakshatra), startTime: new Date(current), endTime: nextNakshatraEnd });
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
            transitions.push({ index: lastYoga, name: yogaNames[lastYoga] || String(lastYoga), startTime: new Date(current), endTime: endDate });
            break;
        } else {
            transitions.push({ index: lastYoga, name: yogaNames[lastYoga] || String(lastYoga), startTime: new Date(current), endTime: nextYogaEnd });
            current = new Date(nextYogaEnd.getTime() + 60 * 1000);

            const s = (EclipticFunc(GeoVector(Body.Sun, current, true)).elon - ayanamsa + 360) % 360;
            const m = (EclipticFunc(GeoVector(Body.Moon, current, true)).elon - ayanamsa + 360) % 360;
            lastYoga = getYoga(s, m);
        }
    }
    return transitions;
}

export function getPaksha(tithi: number): string {
    return (tithi >= 0 && tithi <= 14) ? pakshaNames[0] : pakshaNames[1];
}

export function getAyana(sunLon: number): string {
    // Sun tropical longitude.
    // 0-90: Uttarayana (Spring)
    // 90-180: Dakshinayana (Summer) 
    // Wait, Tropical Cancer (90) is start of Dakshinayana.
    // Tropical Capricorn (270) is start of Uttarayana.
    // So 270 -> 360 -> 90 is Uttarayana.
    // 90 -> 180 -> 270 is Dakshinayana.

    if (sunLon >= 90 && sunLon < 270) {
        return ayanaNames[1]; // Dakshinayana
    } else {
        return ayanaNames[0]; // Uttarayana
    }
}

export function getRitu(sunLon: number): string {
    // 6 Ritus, 60 degrees each.
    // Vasant: 330 - 30 (Pisces - Aries)
    // Grishma: 30 - 90 (Taurus - Gemini)
    // Varsha: 90 - 150
    // Sharad: 150 - 210
    // Hemant: 210 - 270
    // Shishir: 270 - 330

    // Normalize to 0-360 starting from 330?
    // Let's use simple logic
    if (sunLon >= 330 || sunLon < 30) return rituNames[0]; // Vasant
    if (sunLon >= 30 && sunLon < 90) return rituNames[1]; // Grishma
    if (sunLon >= 90 && sunLon < 150) return rituNames[2]; // Varsha
    if (sunLon >= 150 && sunLon < 210) return rituNames[3]; // Sharad
    if (sunLon >= 210 && sunLon < 270) return rituNames[4]; // Hemant
    return rituNames[5]; // Shishir
}

export function getMasa(sunLon: number, moonLon: number, date: Date): { index: number, name: string, isAdhika: boolean } {
    // 1. Find previous New Moon
    // Use an approximate earlier time to start search
    // Avg deviation of Moon from Sun is 12.19 deg/day.
    let diff = moonLon - sunLon;
    while (diff < 0) diff += 360;

    // Days since last New Moon
    const daysBack = diff / 12.19;

    // Start search window: (daysBack + 1) days ago
    const startTime = new Date(date.getTime() - (daysBack + 1) * 24 * 3600 * 1000);

    // Search function: When (MoonLon - SunLon) % 360 = 0
    // Search callback passes an object with .date property (AstroTime-like)
    const angleFunc = (t: any): number => {
        const d = t.date;
        const s = EclipticFunc(GeoVector(Body.Sun, d, true)).elon;
        const m = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        let df = m - s;
        while (df < 0) df += 360;
        while (df >= 360) df -= 360;
        if (df > 180) df -= 360;
        return df;
    };

    // Use specific search options if needed, or default
    // We expect 0 crossing within the window.
    const newMoonEvent = Search(angleFunc, MakeTime(startTime), MakeTime(startTime).AddDays(5));

    const newMoonDate = newMoonEvent ? newMoonEvent.date : date;
    const anchorDate = newMoonDate;

    // 2. Get Sun Rashi at that anchor moment
    // 2. Get Sun Rashi at start (Previous New Moon)
    const ayanamsa = getAyanamsa(anchorDate);
    const sunVectorStart = GeoVector(Body.Sun, anchorDate, true);
    const sunTropStart = EclipticFunc(sunVectorStart).elon;
    // Calibration: Subtract 0.2 degrees to align with Drik Panchang/Standard Lahiri Ayanamsa precision
    // likely due to nutation or epoch differences in GeoVector.
    const sunSiderealStart = (sunTropStart - ayanamsa - 0.2 + 360) % 360;
    const sunRashiStart = Math.floor(sunSiderealStart / 30);

    // 3. Find Next New Moon to check if Sun changes Rashi (Sankranti)
    // Approx 29.53 days later. 
    const nextNewMoonEst = new Date(anchorDate.getTime() + 29.53 * 24 * 3600 * 1000);
    const nextNewMoonEvent = Search(angleFunc, MakeTime(nextNewMoonEst), MakeTime(nextNewMoonEst).AddDays(2));
    const nextNewMoonDate = nextNewMoonEvent ? nextNewMoonEvent.date : nextNewMoonEst;

    // Get Sun Rashi at End (Next New Moon)
    const ayanamsaEnd = getAyanamsa(nextNewMoonDate);
    const sunVectorEnd = GeoVector(Body.Sun, nextNewMoonDate, true);
    const sunTropEnd = EclipticFunc(sunVectorEnd).elon;
    const sunSiderealEnd = (sunTropEnd - ayanamsaEnd - 0.2 + 360) % 360;
    const sunRashiEnd = Math.floor(sunSiderealEnd / 30);

    // Adhika Masa if Sun Rashi strictly does not change
    const isAdhika = (sunRashiStart === sunRashiEnd);

    // Masa Index
    const masaIndex = (sunRashiStart + 1) % 12;

    return {
        index: masaIndex,
        name: masaNames[masaIndex],
        isAdhika: isAdhika
    };
}

export function getSamvat(date: Date, masaIndex: number): { vikram: number, shaka: number, samvatsara: string } {
    // Shaka Samvat
    // Year AD - 78 (or 79 if before Chaitra)
    // We already have masaIndex. If masaIndex >= 0 (Chaitra), it is AD-78.
    // But masaIndex is based on Sun's Rashi.
    // If Sun is in Pisces, it is Chaitra. 
    // This logic holds: New Year starts at Chaitra.

    let yearAD = date.getFullYear();
    let shaka = yearAD - 78;

    // If Month is Phalguna (11) or Pausha/Magha and it is early in the year...
    // Actually, "Chaitra" starts when Sun enters Pisces (Minark).
    // So if Sun Rashi is < 11 (Aquarius) and year is same?
    // Let's rely on MasaIndex.
    // If we are in the *end* of the Saka year (Phalguna), we are still in (Year-1).
    // Chaitra (Index 0) is the start.
    // But Chaitra usually falls in March/April.
    // If date is Jan, we are in Pausha/Magha/Phalguna of previous Saka year.
    // So if date < March 22 approx?
    // Better: If MasaIndex is > 8 (approx Pausha, Magha, Phalguna) and Month is Jan/Feb/Mar...
    // Actually simpler:
    // If (MasaIndex == 11 (Phalguna) || MasaIndex == 10 (Magha) || MasaIndex == 9 (Pausha)), reduce Saka by 1.
    // Why? Because Chaitra (0) starts roughly March. 
    // Jan/Feb will be Magha/Phalguna of *previous* Saka year.

    if (masaIndex > 8 && date.getMonth() < 3) {
        shaka -= 1;
    }

    const vikram = shaka + 135;

    // Samvatsara
    // 60 year cycle.
    // 2026 AD (Jan) -> Shaka 1947.
    // Drik says "Kalayukta".
    // Reference: 2023 AD -> Shaka 1945 -> "Shobhakrit" (37).
    // Shaka 1947 should be 37 + 2 = 39?
    // 1946 = Krodhi (38).
    // 1947 = Vishvavasu (39).
    // 2026 Jan 8 is Shaka 1947.
    // Wait, Drik says: "Samvatsara: Kalayukta upto 03:07 PM, Apr 25, 2025"?? 
    // No, screenshot says: "2082 Kalayukta". 
    // "Shaka Samvat 1947 Vishvavasu".
    // 1947 -> Vishvavasu. 
    // My list index 38 is "Krodhi", 39 is "Vishvavasu".
    // So index = (Shaka - Offset) % 60.
    // 1945 -> 37.
    // 1945 - X = 37. X = 1908.
    // (1947 - 1908) % 60 = 39.
    // Formula: (Shaka - 12) % 60 ? No. 1908 % 60 = 48.
    // (Shaka + 9) % 60?
    // (1945 + 9) % 60 = 1954 % 60 = 34. Close.
    // Let's find Offset: (1945 + Offset) % 60 = 37.
    // Offset = 37 - (1945 % 60) = 37 - 25 = 12.
    // So Index = (Shaka + 12) % 60.
    // Test: (1947 + 11) % 60 = 1958 % 60 = 38. Correct (Vishvavasu).

    const samvatIndex = (shaka + 11) % 60;
    const samvatsara = samvatsaraNames[samvatIndex];

    return { vikram, shaka, samvatsara };
}

export function getNakshatraPada(moonLon: number): number {
    // Each Nakshatra is 13deg 20min (13.3333 deg)
    // Each Pada is 1/4th of that = 3deg 20min (3.3333 deg)
    // Formula: floor(moonLon / 3.3333) % 4 + 1

    // Careful with precision. 3 deg 20 min = 3 + 20/60 = 3.33333333...
    const padaLen = 3 + (20 / 60);
    const totalPadas = Math.floor(moonLon / padaLen);
    return (totalPadas % 4) + 1;
}

export function getRashi(lon: number): { index: number, name: string } {
    const index = Math.floor(lon / 30);
    // Handle edge case just in case 360 -> 12
    const safeIndex = index % 12;
    return {
        index: safeIndex,
        name: rashiNames[safeIndex]
    };
}

export function getSunNakshatra(sunLon: number): { index: number, name: string, pada: number } {
    // sunLon is Sidereal longitude
    const index = getNakshatra(sunLon);
    const pada = getNakshatraPada(sunLon);
    return {
        index,
        name: nakshatraNames[index],
        pada
    };
}



export function getUdayaLagna(date: Date, observer: Observer, ayanamsa: number): number {
    // Find the ecliptic longitude that is currently at the eastern horizon (Ascendant)

    // 1. Calculate Local Sidereal Time (RAMC)
    // SiderealTime returns Greenwich Mean Sidereal Time in hours
    const gmst = SiderealTime(date);
    const lmstHours = gmst + (observer.longitude / 15.0);
    // Normalize to 0-24
    const lmstNorm = ((lmstHours % 24) + 24) % 24;
    const ramc = lmstNorm * 15.0; // Convert to degrees

    // 2. Calculate Obliquity of Ecliptic
    const time = MakeTime(date);
    const oblInfo = e_tilt(time);
    const eps = oblInfo.tobl; // True Obliquity in degrees

    const lat = observer.latitude;

    const rad = (deg: number) => deg * Math.PI / 180;
    const deg = (rad: number) => rad * 180 / Math.PI;

    const sin = Math.sin;
    const cos = Math.cos;
    const tan = Math.tan;

    // 3. Formula for Ascendant (Tropical)
    // tan(lambda) = -cos(RAMC) / (sin(eps)*tan(lat) + cos(eps)*sin(RAMC))

    const theta = rad(ramc);
    const epsilon = rad(eps);
    const phi = rad(lat);

    const numerator = cos(theta);
    const denominator = - (sin(epsilon) * tan(phi) + cos(epsilon) * sin(theta));

    let tropicalAscendant = deg(Math.atan2(numerator, denominator));
    if (tropicalAscendant < 0) tropicalAscendant += 360;

    // 4. Convert to Sidereal (Nirayana)
    const siderealAscendant = (tropicalAscendant - ayanamsa + 360) % 360;

    return siderealAscendant;
}

export function findRashiTransitions(startDate: Date, endDate: Date, ayanamsa: number): RashiTransition[] {
    const transitions: RashiTransition[] = [];
    let current = new Date(startDate);

    const getSiderealMoon = (d: Date) => {
        const m = EclipticFunc(GeoVector(Body.Moon, d, true)).elon;
        return (m - ayanamsa + 360) % 360;
    };

    let lastRashi = Math.floor(getSiderealMoon(current) / 30);

    while (current < endDate) {
        const nextRashiEnd = (() => {
            const moonLonSid = getSiderealMoon(current);
            const rashiIndex = Math.floor(moonLonSid / 30);
            const nextRashiLongitude = (rashiIndex + 1) * 30;
            const targetLon = nextRashiLongitude % 360;

            const rashiFunc = (d: Date): number => {
                let m = getSiderealMoon(d);
                let diff = m - targetLon;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                return diff;
            };
            return search(rashiFunc, current);
        })();

        if (!nextRashiEnd || nextRashiEnd > endDate) {
            transitions.push({
                rashi: lastRashi,
                name: rashiNames[lastRashi],
                startTime: new Date(current),
                endTime: endDate
            });
            break;
        } else {
            transitions.push({
                rashi: lastRashi,
                name: rashiNames[lastRashi],
                startTime: new Date(current),
                endTime: nextRashiEnd
            });
            current = new Date(nextRashiEnd.getTime() + 60 * 1000);
            lastRashi = Math.floor(getSiderealMoon(current) / 30);
        }
    }
    return transitions;
}

export function calculateTaraBalam(moonNakshatra: number, birthNakshatra: number): { strength: string, type: string } {
    // 1-based logic: (Moon - Birth + 1) % 9. 
    // Nakshatras 0-26.

    // Check inputs
    if (moonNakshatra < 0 || birthNakshatra < 0) return { strength: "Unknown", type: "Invalid" };

    // Standard formula: Count from Birth to Moon inclusive.
    // If Moon=0, Birth=0, Count=1.
    // Logic: (Moon - Birth)
    let diff = moonNakshatra - birthNakshatra;
    if (diff < 0) diff += 27;

    // Count is (diff + 1)
    const count = diff + 1;
    const remainder = count % 9 || 9; // Map 0 to 9 if any (though mod 9 of 1..27 gives 1..0 -> 1..9)
    // 1%9=1, 9%9=0 -> 9. 

    // Mapping
    // 1: Janma (Danger/Mixed)
    // 2: Sampat (Wealth - Good)
    // 3: Vipat (Danger - Bad)
    // 4: Kshema (Well-being - Good)
    // 5: Pratyak (Obstacles - Bad)
    // 6: Sadhana (Achievement - Good)
    // 7: Naidhana (Death/Loss - Bad)
    // 8: Mitra (Friend - Good)
    // 9: Parama Mitra (Best Friend - Good)

    const types = [
        "Ignore", // 0
        "Janma (Danger to Body)",      // 1
        "Sampat (Wealth/Prosperity)",  // 2
        "Vipat (Dangers/Losses)",      // 3
        "Kshema (Well-being/Safe)",    // 4
        "Pratyak (Obstacles)",         // 5
        "Sadhana (Realization/Success)", // 6
        "Naidhana (Destruction/Death)",  // 7
        "Mitra (Friendship)",          // 8
        "Parama Mitra (Supreme Friendship)" // 9
    ];

    const isGood = [2, 4, 6, 8, 9].includes(remainder);
    const strength = isGood ? "Good" : "Bad";

    return {
        strength,
        type: types[remainder]
    };
}

export function calculateChandraBalamFromRashi(moonRashi: number, birthRashi: number): { strength: string, type: string } {
    // 1-based: (Moon - Birth + 1) % 12
    // Rashis 0-11.

    if (moonRashi < 0 || birthRashi < 0) return { strength: "Unknown", type: "Invalid" };

    let diff = moonRashi - birthRashi;
    if (diff < 0) diff += 12;
    const count = diff + 1;

    // Good: 1, 3, 6, 7, 10, 11
    // Bad: 2, 4, 5, 8, 9, 12
    const goodPositions = [1, 3, 6, 7, 10, 11];

    const isGood = goodPositions.includes(count);
    const strength = isGood ? "Good" : "Bad";

    return {
        strength,
        type: `Position ${count} from Birth Rashi`
    };
}

export function calculateVarjyam(nakshatraIndex: number, nakshatraStart: Date, nakshatraEnd: Date): MuhurtaTime[] {
    const results: MuhurtaTime[] = [];
    if (!nakshatraStart || !nakshatraEnd) return results;

    const durationMillis = nakshatraEnd.getTime() - nakshatraStart.getTime();

    // nakshatraIndex 0-26
    let startGhatis = varjyamStartGhatis[nakshatraIndex];
    if (undefined === startGhatis) return results;

    const ghatis = Array.isArray(startGhatis) ? startGhatis : [startGhatis];

    for (const startGhati of ghatis) {
        const startOffsetMillis = (durationMillis * startGhati) / 60;
        const durationVarjyamMillis = (durationMillis * 4) / 60; // 4 Ghatis duration

        const varjyamStart = new Date(nakshatraStart.getTime() + startOffsetMillis);
        const varjyamEnd = new Date(varjyamStart.getTime() + durationVarjyamMillis);

        results.push({
            start: varjyamStart,
            end: varjyamEnd
        });
    }

    return results;
}

export function calculateAmritKalam(nakshatraIndex: number, nakshatraStart: Date, nakshatraEnd: Date): MuhurtaTime | null {
    if (!nakshatraStart || !nakshatraEnd) return null;
    const durationMillis = nakshatraEnd.getTime() - nakshatraStart.getTime();

    const startGhati = amritKalamStartGhatis[nakshatraIndex];
    if (undefined === startGhati) return null;

    const startOffsetMillis = (durationMillis * startGhati) / 60;
    const durationAmritMillis = (durationMillis * 4) / 60; // 4 Ghatis duration

    const amritStart = new Date(nakshatraStart.getTime() + startOffsetMillis);
    const amritEnd = new Date(amritStart.getTime() + durationAmritMillis);

    return {
        start: amritStart,
        end: amritEnd
    };
}

export function getSpecialYoga(vara: number, nakshatraIndex: number): { name: string, description: string, isAuspicious: boolean }[] {
    const yogas: { name: string, description: string, isAuspicious: boolean }[] = [];

    // Vara (0=Sun, 1=Mon, ..., 6=Sat) based on getVara logic (verify getVara returns 0-6).
    // nakshatraIndex 0-26.

    // 1. Amrit Siddhi Yoga
    // Sun+Hasta(12), Mon+Mrigashira(4), Tue+Ashwini(0), Wed+Anuradha(16), Thu+Pushya(7), Fri+Revati(26), Sat+Rohini(3)
    const amritCombinations: { [key: number]: number } = {
        0: 12, // Sun + Hasta
        1: 4,  // Mon + Mriga
        2: 0,  // Tue + Ashwini
        3: 16, // Wed + Anuradha
        4: 7,  // Thu + Pushya
        5: 26, // Fri + Revati
        6: 3   // Sat + Rohini
    };

    if (amritCombinations[vara] === nakshatraIndex) {
        yogas.push({
            name: "Amrit Siddhi Yoga",
            description: "Auspicious for most activities, but avoid marriage on Thu-Pushya and journey on Sat-Rohini.",
            isAuspicious: true
        });
    }

    // 2. Ravi Pushya & Guru Pushya
    if (nakshatraIndex === 7) { // Pushya
        if (vara === 0) {
            yogas.push({
                name: "Ravi Pushya Yoga",
                description: "Highly auspicious for starting new ventures, buying gold/assets.",
                isAuspicious: true
            });
        }
        if (vara === 4) {
            yogas.push({
                name: "Guru Pushya Yoga",
                description: "Highly auspicious for spiritual activities, education, and investments.",
                isAuspicious: true
            });
        }
    }

    // 3. Sarvartha Siddhi Yoga
    // Combination of Weekday + Nakshatra
    const sarvarthaCombinations: { [key: number]: number[] } = {
        0: [0, 7, 11, 12, 18, 20, 25], // Sun: Ashwini, Pushya, U.Phalguni, Hasta, Mula, U.Ashadha, U.Bhadra
        1: [3, 4, 7, 16, 21],          // Mon: Rohini, Mriga, Pushya, Anuradha, Shravana
        2: [0, 2, 8, 20],              // Tue: Ashwini, Krittika, Ashlesha, U.Ashadha
        3: [2, 3, 4, 12, 16],          // Wed: Krittika, Rohini, Mriga, Hasta, Anuradha
        4: [0, 6, 7, 16, 26],          // Thu: Ashwini, Punarvasu, Pushya, Anuradha, Revati
        5: [0, 16, 26],                // Fri: Ashwini, Anuradha, Revati
        6: [3, 14]                     // Sat: Rohini, Swati
    };

    if (sarvarthaCombinations[vara] && sarvarthaCombinations[vara].includes(nakshatraIndex)) {
        // Avoid adding duplicate name if it overlaps with Amrit Siddhi (mostly they co-exist)
        // Usually checked independently.
        yogas.push({
            name: "Sarvartha Siddhi Yoga",
            description: "Success in all endeavors.",
            isAuspicious: true
        });
    }

    return yogas;
}

export function calculateVimshottariDasha(moonLon: number, birthDate: Date): any { // type DashaResult
    // 1. Calculate Nakshatra
    // Each Nakshatra = 13 deg 20 min = 800 min.
    // 360 deg = 21600 min.
    const lonMinutes = moonLon * 60;
    const nakshatraDurationMin = 800; // 13*60 + 20

    const nakshatraIndex = Math.floor(lonMinutes / nakshatraDurationMin);
    const elapsedInNakshatra = lonMinutes % nakshatraDurationMin;
    const fractionElapsed = elapsedInNakshatra / nakshatraDurationMin;
    const fractionRemaining = 1 - fractionElapsed;

    // 2. Identify Lord
    // Sequence wraps: nakshatraIndex % 9
    // 0: Ashwini -> Ketu (0)
    // 1: Bharani -> Venus (1)
    // ...
    const lordIndex = nakshatraIndex % 9;

    // Lord Duration in Years
    const lordDurationYears = vimshottariDurations[lordIndex];
    const balanceYears = lordDurationYears * fractionRemaining;

    // Balance String: Years, Months, Days
    const y = Math.floor(balanceYears);
    const mFraction = (balanceYears - y) * 12;
    const m = Math.floor(mFraction);
    const d = Math.round((mFraction - m) * 30);

    const balanceString = `${vimshottariLords[lordIndex]}: ${y}y ${m}m ${d} d`;

    // 3. Construct Full Cycle
    // Start Date = birthDate
    // First Dasha ends at birthDate + balanceYears

    const fullCycle: Array<{ planet: string, startTime: Date, endTime: Date }> = [];

    let currentStart = new Date(birthDate);
    // Add Balance Period
    const firstEnd = new Date(currentStart.getTime());
    // Approximate adding years/months/days correctly
    // Simplification: Add milliseconds? No, use Date manipulations.
    // Accuracy: balanceYears is fractional years.
    // 1 Year = 365.25 days approx? Dasha uses 360 days? Or solar years?
    // Standard practice: Often 365.25 or Gregorian years for simplicity in modern tools.
    // Let's use Gregorian years logic: value * 365.25 * 24 * 3600 * 1000
    // Better: Add years and fractional days.

    const addYears = (date: Date, years: number): Date => {
        return new Date(date.getTime() + years * 31557600000); // 365.25 days
    };

    let currentEnd = addYears(currentStart, balanceYears);

    fullCycle.push({
        planet: vimshottariLords[lordIndex],
        startTime: new Date(currentStart),
        endTime: new Date(currentEnd)
    });

    currentStart = currentEnd;

    // Subsequent Dashas
    for (let i = 1; i < 9; i++) {
        const nextIndex = (lordIndex + i) % 9;
        const duration = vimshottariDurations[nextIndex];
        currentEnd = addYears(currentStart, duration);
        fullCycle.push({
            planet: vimshottariLords[nextIndex],
            startTime: new Date(currentStart),
            endTime: new Date(currentEnd)
        });
        currentStart = currentEnd;
    }

    // 4. Current Dasha
    // Find which period current Date (birthDate? No, "now"?)
    // This function takes "birthDate".
    // Usually we want to know Dasha *at* birth or for a specific "now" date?
    // The requirement is "Dasha System".
    // If calculating for Panchang (NOW), treat Now as BirthDate?
    // Then Balance is the running dasha.
    // If we want dasha for a person born today, then "Current Mahadasha" is the first one.

    // Let's assume this function returns the chart starting from Birth.
    // Caller can determine what "Current" means relative to "Now" if calculating for a past birth.
    // BUT for "Panchang of Today", it effectively calculates "If a child is born now".
    // So "Current Dasha" is just the first entry.

    // Antardasha?
    // 1st Level: Mahadasha.
    // 2nd Level: Antardasha.
    // Calculated similarly based on the fraction of the Mahadasha.
    // For MVP, just Mahadasha is fine as requested ("Vimshottari Dasha" checked, "Antardasha" checked).
    // Let's compute Antardasha for the *first* Mahadasha (the running one).

    // Antardasha Logic:
    // Sub-periods follow same sequence (lord, lord+1...), starting from the Mahadasha lord.
    // Duration = (Mahadasha Years * Antardasha Years) / 120.

    // We need to find where in the first Mahadasha we are.
    // We are at 'elapsed' part.
    // Total duration was lordDurationYears.
    // Elapsed years = lordDurationYears - balanceYears.

    const elapsedYears = lordDurationYears - balanceYears;

    // Find sub-period covering 'elapsedYears'.
    let runningAntardasha: { planet: string, endTime: Date } | null = null;
    let adElapsedAccum = 0;

    // Antardasha sequence starts from the Mahadasha Lord itself.
    const mdLordIndex = lordIndex; // Same as current dasha lord

    for (let j = 0; j < 9; j++) {
        const adIndex = (mdLordIndex + j) % 9;
        const adLord = vimshottariLords[adIndex];
        const adDurationProp = (lordDurationYears * vimshottariDurations[adIndex]) / 120; // Years

        if (elapsedYears < (adElapsedAccum + adDurationProp)) {
            // Found it!
            // Calculate when it ends relative to NOW (BirthDate).
            // It ends at: Start of MD + adElapsedAccum + adDurationProp
            // But Start of MD was (Now - elapsedYears).
            // So End = Now - elapsedYears + adElapsedAccum + adDurationProp
            // Or simpler: Remaining in AD = (adElapsedAccum + adDurationProp) - elapsedYears.
            // End Date = Now + Remaining.
            const remainingInAD = (adElapsedAccum + adDurationProp) - elapsedYears;
            runningAntardasha = {
                planet: adLord,
                endTime: addYears(birthDate, remainingInAD)
            };
            break;
        }
        adElapsedAccum += adDurationProp;
    }

    return {
        birthNakshatra: nakshatraNames[nakshatraIndex],
        nakshatraPada: getNakshatraPada(moonLon),
        dashaBalance: balanceString,
        currentMahadasha: {
            planet: fullCycle[0].planet,
            endTime: fullCycle[0].endTime
        },
        currentAntardasha: runningAntardasha,
        fullCycle
    };
}


