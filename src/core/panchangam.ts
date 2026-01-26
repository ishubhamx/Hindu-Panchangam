import { Body, GeoVector, Ecliptic, Observer } from "astronomy-engine";
import { getAyanamsa } from "./ayanamsa";
import { Panchangam, PanchangamDetails, MuhurtaTime, PanchangamOptions } from "./types";
import {
    getTithi, getNakshatra, getYoga, getKarana, getVara,
    getSunrise, getSunset, getMoonrise, getMoonset,
    findNakshatraStart, findNakshatraEnd,
    findTithiStart, findTithiEnd,
    findYogaEnd,
    calculateRahuKalam, findKaranaTransitions, findTithiTransitions,
    findNakshatraTransitions, findYogaTransitions,
    calculateAbhijitMuhurta, calculateBrahmaMuhurta, calculateGovardhanMuhurta,
    calculateYamagandaKalam, calculateGulikaKalam, calculateDurMuhurta,
    getPlanetaryPosition, getRahuPosition, getKetuPosition, calculateChandraBalam, getCurrentHora,
    getMasa, getPaksha, getRitu, getAyana, getSamvat,
    getNakshatraPada, getRashi, getSunNakshatra, getUdayaLagna, findRashiTransitions,
    calculateAmritKalam, calculateVarjyam, getSpecialYoga, calculateVimshottariDasha
} from "./calculations";
import { getFestivals } from "./festivals";
import { calculateChoghadiya } from "./muhurta/choghadiya";
import { calculateGowriPanchangam } from "./muhurta/gowri";

export function getPanchangam(date: Date, observer: Observer, options?: PanchangamOptions): Panchangam {
    const ayanamsa = getAyanamsa(date);

    const sunVector = GeoVector(Body.Sun, date, true);
    const moonVector = GeoVector(Body.Moon, date, true);

    // Tropical Longitudes
    const sunTrop = Ecliptic(sunVector).elon;
    const moonTrop = Ecliptic(moonVector).elon;

    // Sidereal Longitudes
    const sunLon = (sunTrop - ayanamsa + 360) % 360;
    const moonLon = (moonTrop - ayanamsa + 360) % 360;

    const sunrise = getSunrise(date, observer, options);
    const sunset = getSunset(date, observer, options);
    const moonrise = getMoonrise(date, observer, options);
    const moonset = getMoonset(date, observer, options);


    const nakshatraStartTime = findNakshatraStart(date, ayanamsa);
    const nakshatraEndTime = findNakshatraEnd(date, ayanamsa);

    // Tithi doesn't need Ayanamsa (diff is same)
    const tithiStartTime = findTithiStart(date);
    const tithiEndTime = findTithiEnd(date);

    const yogaEndTime = findYogaEnd(date, ayanamsa);


    const rahuKalam = (sunrise && sunset) ? calculateRahuKalam(sunrise, sunset, getVara(date, observer)) : null;

    // For Karana transitions, use sunrise to next day's sunrise
    let nextSunrise: Date | null = null;
    if (sunrise) {
        const nextDay = new Date(sunrise.getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        nextSunrise = getSunrise(nextDay, observer, options);
    }
    const karanaTransitions = (sunrise && nextSunrise)
        ? findKaranaTransitions(sunrise, nextSunrise)
        : [];
    const tithiTransitions = (sunrise && nextSunrise)
        ? findTithiTransitions(sunrise, nextSunrise)
        : [];
    const nakshatraTransitions = (sunrise && nextSunrise)
        ? findNakshatraTransitions(sunrise, nextSunrise, ayanamsa)
        : [];
    const yogaTransitions = (sunrise && nextSunrise)
        ? findYogaTransitions(sunrise, nextSunrise, ayanamsa)
        : [];

    // Enhanced Vedic Features
    const abhijitMuhurta = (sunrise && sunset) ? calculateAbhijitMuhurta(sunrise, sunset) : null;

    // Previous Sunset for Brahma Muhurta
    let prevSunset: Date | undefined;
    if (sunrise) {
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        prevSunset = getSunset(prevDate, observer, options) || undefined;
    }
    const brahmaMuhurta = sunrise ? calculateBrahmaMuhurta(sunrise, prevSunset) : null;
    const govardhanMuhurta = (sunrise && sunset) ? calculateGovardhanMuhurta(sunrise, sunset) : null;
    const yamagandaKalam = (sunrise && sunset) ? calculateYamagandaKalam(sunrise, sunset, getVara(date, observer)) : null;
    const gulikaKalam = (sunrise && sunset) ? calculateGulikaKalam(sunrise, sunset, getVara(date, observer)) : null;
    const durMuhurta = (sunrise && sunset) ? calculateDurMuhurta(sunrise, sunset) : null;

    // Planetary positions
    const rahuPos = getRahuPosition(date, ayanamsa);
    const planetaryPositions = {
        sun: getPlanetaryPosition(Body.Sun, date, ayanamsa),
        moon: getPlanetaryPosition(Body.Moon, date, ayanamsa),
        mars: getPlanetaryPosition(Body.Mars, date, ayanamsa),
        mercury: getPlanetaryPosition(Body.Mercury, date, ayanamsa),
        jupiter: getPlanetaryPosition(Body.Jupiter, date, ayanamsa),
        venus: getPlanetaryPosition(Body.Venus, date, ayanamsa),
        saturn: getPlanetaryPosition(Body.Saturn, date, ayanamsa),
        rahu: rahuPos,
        ketu: getKetuPosition(rahuPos)
    };

    const chandrabalam = calculateChandraBalam(moonLon, sunLon);
    const currentHora = getCurrentHora(date, sunrise || date);

    // Calendar Units
    const tithi = getTithi(sunLon, moonLon);
    const masa = getMasa(sunLon, moonLon, date);
    const paksha = getPaksha(tithi);
    const ritu = getRitu(sunTrop); // Use Tropical for Drik Ritu (Seasons)
    const ayana = getAyana(sunTrop); // Use Tropical for Solstice direction
    const samvat = getSamvat(date, masa.index);

    // Phase 3: Planetary Details
    const nakshatraPada = getNakshatraPada(moonLon);
    const moonRashi = getRashi(moonLon);
    const sunRashi = getRashi(sunLon);
    const sunNakshatra = getSunNakshatra(sunLon);
    const udayaLagna = getUdayaLagna(sunrise || date, observer, ayanamsa);
    const moonRashiTransitions = (sunrise && nextSunrise)
        ? findRashiTransitions(sunrise, nextSunrise, ayanamsa)
        : [];
    // Phase 4: Advanced Muhurta
    const nakshatraEnd = nakshatraTransitions.length > 0 ? nakshatraTransitions[0].endTime : nextSunrise; // Approximate if not found today
    const currentNakshatraStart = findNakshatraStart(date, ayanamsa) || date; // Fallback to now if start not found (e.g. earlier than search window)

    // Note: findNakshatraStart scans back 25h. If null, it means start is way back.
    // We calculate from current time if start not found.

    // Varjyam & Amrit Kalam: Check Current, Previous, and Next Nakshatras
    const amritKalam: MuhurtaTime[] = [];
    const varjyam: MuhurtaTime[] = [];

    const checkAndAdd = (nakIndex: number, start: Date, end: Date) => {
        if (!start || !end) return;
        const v = calculateVarjyam(nakIndex, start, end);
        varjyam.push(...v);
        const a = calculateAmritKalam(nakIndex, start, end);
        if (a) amritKalam.push(a);
    };

    // 1. Current Nakshatra
    const currentNakIndex = getNakshatra(moonLon);
    const nStart = nakshatraStartTime || date; // Fallback
    const nEnd = nakshatraEndTime || nextSunrise || date; // Fallback
    checkAndAdd(currentNakIndex, nStart, nEnd);

    // 2. Previous Nakshatra (if current started after sunrise/start of day)
    // We need the Previous Nakshatra End = Current Nakshatra Start.
    if (nakshatraStartTime) { // If start is known and valid
        const prevNakIndex = (currentNakIndex - 1 + 27) % 27;
        // We need Previous Start.
        // We can find it by searching backwards from nakshatraStartTime.
        // We search from 1 minute before current start.
        const prevSearchDate = new Date(nakshatraStartTime.getTime() - 60000);
        const prevStart = findNakshatraStart(prevSearchDate, ayanamsa);
        if (prevStart) {
            checkAndAdd(prevNakIndex, prevStart, nakshatraStartTime);
        }
    }

    // 3. Next Nakshatra (if current ends today)
    // nakshatraEndTime is the End of Current.
    if (nakshatraEndTime) {
        const nextNakIndex = (currentNakIndex + 1) % 27;
        // Next Start = Current End.
        // We search from 1 minute after next start to find its end.
        const nextSearchDate = new Date(nakshatraEndTime.getTime() + 60000);
        const nextEnd = findNakshatraEnd(nextSearchDate, ayanamsa);
        if (nextEnd) {
            checkAndAdd(nextNakIndex, nakshatraEndTime, nextEnd);
        }
    }

    // Filter out periods completely outside "Today"?
    // Usually Drik shows periods even if they spill over to next day early morning.
    // We return all found relevant to the Nakshatras spanning "Today".

    // Sort
    const sortByStart = (a: MuhurtaTime, b: MuhurtaTime) => a.start.getTime() - b.start.getTime();
    amritKalam.sort(sortByStart);
    varjyam.sort(sortByStart);

    return {
        tithi,
        nakshatra: getNakshatra(moonLon),
        yoga: getYoga(sunLon, moonLon),
        karana: getKarana(sunLon, moonLon),

        vara: getVara(date, observer),
        ayanamsa,
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
        moonRashiTransitions,

        // Unified List
        tithis: tithiTransitions,
        nakshatras: nakshatraTransitions,
        yogas: yogaTransitions,
        karanas: karanaTransitions,
        rashis: moonRashiTransitions,
        // Enhanced Vedic Features
        amritKalam,
        varjyam,
        // Special Yogas
        specialYogas: getSpecialYoga(getVara(date, observer), currentNakIndex),

        // Phase 6: Dasha System
        // We calculate Dasha based on the Moon position at the given 'date'.
        // This signifies: "If a child were born at this time, what is the Dasha?"
        // Or "What is the ruling Dasha for the day?"
        vimshottariDasha: calculateVimshottariDasha(moonLon, date),

        // Phase 7: Festivals
        festivals: getFestivals(masa.index, masa.isAdhika, paksha, tithi + 1, getVara(date, observer)),

        // Phase 8: Advanced Muhurta (v2.1)
        choghadiya: (sunrise && sunset && nextSunrise)
            ? calculateChoghadiya(sunrise, sunset, nextSunrise, getVara(date, observer))
            : { day: [], night: [] },
        gowri: (sunrise && sunset && nextSunrise)
            ? calculateGowriPanchangam(sunrise, sunset, nextSunrise, getVara(date, observer))
            : { day: [], night: [] },

        abhijitMuhurta,
        brahmaMuhurta,
        govardhanMuhurta,
        yamagandaKalam,
        gulikaKalam,
        durMuhurta,
        planetaryPositions,
        chandrabalam,
        currentHora,
        // Phase 3: Planetary Details
        nakshatraPada,
        moonRashi,
        sunRashi,
        sunNakshatra,
        udayaLagna,
        // Phase 2: Calendar Units
        masa,
        paksha,
        ritu,
        ayana,
        samvat
    };
}

export function getPanchangamDetails(date: Date, observer: Observer, options?: PanchangamOptions): PanchangamDetails {
    const panchangam = getPanchangam(date, observer, options);
    const sunrise = getSunrise(date, observer, options);
    const sunset = getSunset(date, observer, options);
    const nakshatraEndTime = findNakshatraEnd(date, panchangam.ayanamsa);

    return {
        ...panchangam,
        sunrise,
        sunset,
        nakshatraEndTime,
    };
}
