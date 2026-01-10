import { rashiNames } from "../core/constants";
import { Body } from "astronomy-engine";
import { VargaChart, Bhava } from "./types";
import { getHouses } from "./houses";

// --- Helper for creating full Chart ---
function createVargaChart(ascendantLength: number, planets: Record<string, { longitude: number }>, calculationFn: (lon: number) => number): VargaChart {
    const ascRashi = calculationFn(ascendantLength);
    const dPlanets: Record<string, { rashi: number; rashiName: string }> = {};

    for (const [name, data] of Object.entries(planets)) {
        const sign = calculationFn(data.longitude);
        dPlanets[name] = { rashi: sign, rashiName: rashiNames[sign] };
    }

    // Assign planets to Houses (Whole Sign System for Vargas)
    // House 1 is the sign of the Ascendant.
    const ascDegree = (ascRashi * 30) + 15;
    const houses = getHouses(ascDegree, 'whole_sign');

    for (const [pName, pData] of Object.entries(dPlanets)) {
        const pRashi = pData.rashi;
        const house = houses.find(h => h.rashi === pRashi);
        if (house) house.planets.push(pName);
    }

    return {
        ascendant: { rashi: ascRashi, rashiName: rashiNames[ascRashi] },
        planets: dPlanets,
        houses: houses
    };
}

// --- D1 (Rashi) ---
function getRashiSign(longitude: number): number {
    return Math.floor(longitude / 30);
}

// --- D2 (Hora) ---
// Parashara Hora: Odd Signs (0-15° = Sun/Leo, 15-30° = Moon/Cancer)
// Even Signs (0-15° = Moon/Cancer, 15-30° = Sun/Leo)
function getHoraSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;
    const isOdd = (rashi % 2 === 0); // 0=Aries (Odd)

    if (isOdd) {
        return (degrees < 15) ? 4 : 3; // Leo(4), Cancer(3)
    } else {
        return (degrees < 15) ? 3 : 4; // Cancer(3), Leo(4)
    }
}

// --- D3 (Drekkana) ---
// 0-10: Same Sign, 10-20: 5th, 20-30: 9th
function getDrekkanaSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;

    if (degrees < 10) return rashi;
    if (degrees < 20) return (rashi + 4) % 12;
    return (rashi + 8) % 12;
}

// --- D4 (Chaturthamsha) ---
function getChaturthamshaSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;
    const part = Math.floor(degrees / 7.5);
    return (rashi + (part * 3)) % 12;
}

// --- D7 (Saptamsa) ---
function getSaptamsaSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;
    const part = Math.floor(degrees / (30 / 7)); // 0 to 6
    const isOdd = (rashi % 2 === 0);

    if (isOdd) {
        return (rashi + part) % 12;
    } else {
        const startSign = (rashi + 6) % 12;
        return (startSign + part) % 12;
    }
}

// --- D9 (Navamsa) ---
export function getNavamsaSign(longitude: number): number {
    const navamsaSpan = 360 / 108;
    const index = Math.floor(longitude / navamsaSpan);
    return index % 12;
}

// --- D10 (Dasamsa) ---
function getDasamsaSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;
    const part = Math.floor(degrees / 3);
    const isOdd = (rashi % 2 === 0);

    if (isOdd) {
        return (rashi + part) % 12;
    } else {
        const startSign = (rashi + 8) % 12;
        return (startSign + part) % 12;
    }
}

// --- D12 (Dwadasamsa) ---
function getDwadasamsaSign(longitude: number): number {
    const rashi = Math.floor(longitude / 30);
    const degrees = longitude % 30;
    const part = Math.floor(degrees / 2.5);
    return (rashi + part) % 12;
}


// --- Main Export ---
export function getAllVargas(ascendantLength: number, planets: Record<string, { longitude: number }>): Record<string, VargaChart> {
    return {
        d1: createVargaChart(ascendantLength, planets, getRashiSign),
        d2: createVargaChart(ascendantLength, planets, getHoraSign),
        d3: createVargaChart(ascendantLength, planets, getDrekkanaSign),
        d4: createVargaChart(ascendantLength, planets, getChaturthamshaSign),
        d7: createVargaChart(ascendantLength, planets, getSaptamsaSign),
        d9: createVargaChart(ascendantLength, planets, getNavamsaSign),
        d10: createVargaChart(ascendantLength, planets, getDasamsaSign),
        d12: createVargaChart(ascendantLength, planets, getDwadasamsaSign)
    };
}

// Keep the old single export for backward compatibility or direct use if needed, 
// though getAllVargas covers it.
export function getNavamsaChart(ascendantLength: number, planets: Record<string, { longitude: number }>): VargaChart {
    return createVargaChart(ascendantLength, planets, getNavamsaSign);
}
