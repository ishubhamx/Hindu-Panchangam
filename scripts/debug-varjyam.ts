
import { Observer } from 'astronomy-engine';
import { getPanchangam } from '../src/core/panchangam';
import { varjyamStartGhatis, nakshatraNames } from '../src/core/constants';
import { findNakshatraStart, findNakshatraEnd } from '../src/core/calculations';
import { getAyanamsa } from '../src/core/ayanamsa';
import { GeoVector, Ecliptic, Body } from 'astronomy-engine';

function debugNakshatra(date: Date, observer: Observer) {
    const ayanamsa = getAyanamsa(date);
    const moonVector = GeoVector(Body.Moon, date, true);
    const moonLon = (Ecliptic(moonVector).elon - ayanamsa + 360) % 360;
    const nakIndex = Math.floor(moonLon / (13 + 1 / 3));

    console.log(`\nTime: ${date.toLocaleString()}`);
    console.log(`Current Nakshatra: ${nakshatraNames[nakIndex]} (${nakIndex})`);

    const start = findNakshatraStart(date, ayanamsa);
    const end = findNakshatraEnd(date, ayanamsa);

    console.log(`Start: ${start?.toLocaleString()}`);
    console.log(`End:   ${end?.toLocaleString()}`);

    if (start && end) {
        const duration = end.getTime() - start.getTime();
        const startGhatis = varjyamStartGhatis[nakIndex];

        console.log(`Varjyam Ghati Constant: ${startGhatis}`);

        const ghatis = Array.isArray(startGhatis) ? startGhatis : [startGhatis];

        for (const g of ghatis) {
            const offset = (duration * g) / 60;
            const vStart = new Date(start.getTime() + offset);
            const vEnd = new Date(vStart.getTime() + (duration * 4 / 60));
            console.log(`Calculated Varjyam (Ghati ${g}): ${vStart.toLocaleString()} - ${vEnd.toLocaleString()}`);
        }
    }
}

async function run() {
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore

    // Date: April 4, 2029
    // Lib 15:49 vs Drik 17:27
    console.log("\n=== Debug Varjyam for April 4, 2029 ===");
    debugNakshatra(new Date('2029-04-04T12:00:00+05:30'), observer);
    console.log("--- Prev ---");
    debugNakshatra(new Date('2029-04-04T00:00:00+05:30'), observer);
}

run();
