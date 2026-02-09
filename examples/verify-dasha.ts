
import { getPanchangam } from '../packages/core/src/index';
import { Observer } from "astronomy-engine";

async function verifyDasha() {
    const date = new Date('2025-06-22T12:00:00+05:30'); // Drik Reference
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore

    const p = getPanchangam(date, observer);

    console.log("=== Dasha Balance Verification (22 June 2025) ===");
    console.log(`Moon Longitude: ${p.planetaryPositions.moon.longitude.toFixed(2)} deg`);
    // Need Nakshatra info to be sure
    // p.nakshatra is index.
    const nakNames = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
    console.log(`Nakshatra: ${nakNames[p.nakshatra - 1] || 'Unknown'} (${p.nakshatra})`); // p.nakshatra might be 1-based? Library returns 1-based usually.
    // Check types.ts or previous outputs. simple-test says "Nakshatra: 10". Magha. 
    // 22 June 2025 Moon is in Aries 23 deg. 
    // Nakshatras: 1 (Ashwini 0-13.20), 2 (Bharani 13.20-26.40).
    // So it should be 2.

    const dasha = p.vimshottariDasha;
    console.log(`Dasha Balance: ${dasha.dashaBalance}`);
    console.log(`Current Mahadasha: ${dasha.currentMahadasha.planet} (Ends: ${dasha.currentMahadasha.endTime.toDateString()})`);

    if (dasha.currentAntardasha) {
        console.log(`Current Antardasha: ${dasha.currentAntardasha.planet} (Ends: ${dasha.currentAntardasha.endTime.toDateString()})`);
    }

    // Manual Calculation Check
    // Moon = 23.20 deg.
    // Bharani End = 26.666 deg.
    // Remaining = 26.666 - 23.20 = 3.466 deg.
    // Total Span = 13.333 deg.
    // Fraction = 3.466 / 13.333 = 0.26 roughly.
    // Venus 20 years. 0.26 * 20 = 5.2 years.
}

verifyDasha();
