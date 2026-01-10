import { Observer, Body, GeoVector, Ecliptic } from "astronomy-engine";
import { getAyanamsa } from "../core/ayanamsa";
import { getUdayaLagna, getTithi, getNakshatra, getNakshatraPada, calculateVimshottariDasha, getPlanetaryPosition, getRahuPosition, getKetuPosition } from "../core/calculations";
import { rashiNames, nakshatraNames } from "../core/constants";
import { PlanetaryPosition } from "../core/types";
import { getHouses } from "./houses";
import { getAllVargas } from "./vargas";
import { Kundli, KundliConfig, Bhava } from "./types";

/**
 * Generates a Janam Kundli (Birth Chart) for a given date and location.
 * 
 * @param date The Date object of birth (ensure timezone is handled correctly by caller or passed in UTC)
 * @param observer The Observer object (Location)
 * @param config Configuration options (optional)
 */
export function getKundli(date: Date, observer: Observer, config: KundliConfig = {}): Kundli {
    const ayanamsa = getAyanamsa(date);

    // 1. Calculate Ascendant (Lagna)
    const lagnaLon = getUdayaLagna(date, observer, ayanamsa);
    const lagnaRashiIndex = Math.floor(lagnaLon / 30);
    const lagnaNakshatraIndex = getNakshatra(lagnaLon);
    const lagnaPada = getNakshatraPada(lagnaLon);

    const ascendant = {
        rashi: lagnaRashiIndex,
        rashiName: rashiNames[lagnaRashiIndex],
        longitude: lagnaLon,
        nakshatra: nakshatraNames[lagnaNakshatraIndex],
        pada: lagnaPada
    };

    // 2. Calculate Planets (Sidereal)
    const planets: Record<string, PlanetaryPosition> = {};
    const bodies = [
        Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn,
        Body.Uranus, Body.Neptune, Body.Pluto
    ];
    const bodyNames = [
        "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
        "Uranus", "Neptune", "Pluto"
    ];

    bodies.forEach((body, idx) => {
        const name = bodyNames[idx];
        planets[name] = getPlanetaryPosition(body, date, ayanamsa);
    });

    // Nodes
    const rahuPos = getRahuPosition(date, ayanamsa);
    planets["Rahu"] = rahuPos;
    planets["Ketu"] = getKetuPosition(rahuPos);

    // 3. Calculate Houses
    // Default to 'whole_sign' if not specified
    // Explicitly cast or handle default for compiler safety
    const houseSystem = (config.houseSystem === 'equal_house') ? 'equal_house' : 'whole_sign';
    const houses = getHouses(lagnaLon, houseSystem);

    // 4. Map Planets to Houses
    // Iterate through planets and find which house they fall into
    for (const [pName, pData] of Object.entries(planets)) {
        const pLon = pData.longitude;

        // Find the house where startLon <= pLon < endLon
        // Handle wrapping 360 case carefully
        const house = houses.find(h => {
            // Normal case: Start < End (e.g., 30 to 60)
            if (h.startLongitude < h.endLongitude) {
                return pLon >= h.startLongitude && pLon < h.endLongitude;
            }
            // Wrap case: Start > End (e.g., 330 to 0/360 -> Pisces)
            else {
                return pLon >= h.startLongitude || pLon < h.endLongitude;
            }
        });

        if (house) {
            house.planets.push(pName);
        }
    }

    // 5. Calculate Dasha
    const moonLon = planets["Moon"].longitude;
    const dasha = calculateVimshottariDasha(moonLon, date);

    // 6. Calculate Vargas (D1-D12)
    const vargas = getAllVargas(lagnaLon, planets);

    return {
        birthDetails: {
            date,
            lat: observer.latitude,
            lon: observer.longitude,
            timezone: 0
        },
        ascendant,
        planets,
        houses,
        dasha,
        vargas
    };
}
