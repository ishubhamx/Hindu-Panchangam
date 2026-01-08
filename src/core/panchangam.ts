import { Body, GeoVector, Ecliptic, Observer } from "astronomy-engine";
import { getAyanamsa } from "./ayanamsa";
import { Panchangam, PanchangamDetails } from "./types";
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
    getPlanetaryPosition, calculateChandraBalam, getCurrentHora
} from "./calculations";

export function getPanchangam(date: Date, observer: Observer): Panchangam {
    const ayanamsa = getAyanamsa(date);

    const sunVector = GeoVector(Body.Sun, date, true);
    const moonVector = GeoVector(Body.Moon, date, true);

    // Tropical Longitudes
    const sunTrop = Ecliptic(sunVector).elon;
    const moonTrop = Ecliptic(moonVector).elon;

    // Sidereal Longitudes
    const sunLon = (sunTrop - ayanamsa + 360) % 360;
    const moonLon = (moonTrop - ayanamsa + 360) % 360;

    const sunrise = getSunrise(date, observer);
    const sunset = getSunset(date, observer);
    const moonrise = getMoonrise(date, observer);
    const moonset = getMoonset(date, observer);

    const nakshatraStartTime = findNakshatraStart(date, ayanamsa);
    const nakshatraEndTime = findNakshatraEnd(date, ayanamsa);

    // Tithi doesn't need Ayanamsa (diff is same)
    const tithiStartTime = findTithiStart(date);
    const tithiEndTime = findTithiEnd(date);

    const yogaEndTime = findYogaEnd(date, ayanamsa);

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
        ? findNakshatraTransitions(sunrise, nextSunrise, ayanamsa)
        : [];
    const yogaTransitions = (sunrise && nextSunrise)
        ? findYogaTransitions(sunrise, nextSunrise, ayanamsa)
        : [];

    // Enhanced Vedic Features
    const abhijitMuhurta = (sunrise && sunset) ? calculateAbhijitMuhurta(sunrise, sunset) : null;
    const brahmaMuhurta = sunrise ? calculateBrahmaMuhurta(sunrise) : null;
    const govardhanMuhurta = (sunrise && sunset) ? calculateGovardhanMuhurta(sunrise, sunset) : null;
    const yamagandaKalam = (sunrise && sunset) ? calculateYamagandaKalam(sunrise, sunset, getVara(date)) : null;
    const gulikaKalam = (sunrise && sunset) ? calculateGulikaKalam(sunrise, sunset, getVara(date)) : null;
    const durMuhurta = (sunrise && sunset) ? calculateDurMuhurta(sunrise, sunset) : null;

    // Planetary positions
    const planetaryPositions = {
        sun: getPlanetaryPosition(Body.Sun, date, ayanamsa),
        moon: getPlanetaryPosition(Body.Moon, date, ayanamsa),
        mars: getPlanetaryPosition(Body.Mars, date, ayanamsa),
        mercury: getPlanetaryPosition(Body.Mercury, date, ayanamsa),
        jupiter: getPlanetaryPosition(Body.Jupiter, date, ayanamsa),
        venus: getPlanetaryPosition(Body.Venus, date, ayanamsa),
        saturn: getPlanetaryPosition(Body.Saturn, date, ayanamsa)
    };

    const chandrabalam = calculateChandraBalam(moonLon, sunLon);
    const currentHora = getCurrentHora(date, sunrise || date);

    return {
        tithi: getTithi(sunLon, moonLon),
        nakshatra: getNakshatra(moonLon),
        yoga: getYoga(sunLon, moonLon),
        karana: getKarana(sunLon, moonLon),
        vara: getVara(date),
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
        // Enhanced Vedic Features
        abhijitMuhurta,
        brahmaMuhurta,
        govardhanMuhurta,
        yamagandaKalam,
        gulikaKalam,
        durMuhurta,
        planetaryPositions,
        chandrabalam,
        currentHora
    };
}

export function getPanchangamDetails(date: Date, observer: Observer): PanchangamDetails {
    const panchangam = getPanchangam(date, observer);
    const sunrise = getSunrise(date, observer);
    const sunset = getSunset(date, observer);
    const nakshatraEndTime = findNakshatraEnd(date, panchangam.ayanamsa);

    return {
        ...panchangam,
        sunrise,
        sunset,
        nakshatraEndTime,
    };
}
