import { getPanchangam, Observer, nakshatraNames, tithiNames, yogaNames } from '../index';

// Example: Mumbai (19.0760° N, 72.8777° E, 10m elevation)
const observer = new Observer(19.0760, 72.8777, 10);
const date = new Date();

const p = getPanchangam(date, observer);

console.log('--- Advanced Vedic Panchangam ---');
console.log(`Tithi: ${tithiNames[p.tithi]} (Ends: ${p.tithiEndTime?.toLocaleTimeString()})`);
console.log(`Nakshatra: ${nakshatraNames[p.nakshatra]} (Ends: ${p.nakshatraEndTime?.toLocaleTimeString()})`);
console.log(`Yoga: ${yogaNames[p.yoga]}`);

console.log('\n--- Muhurtas ---');
if (p.rahuKalamStart && p.rahuKalamEnd) {
    console.log(`Rahu Kalam: ${p.rahuKalamStart.toLocaleTimeString()} - ${p.rahuKalamEnd.toLocaleTimeString()}`);
}
if (p.brahmaMuhurta) {
    console.log(`Brahma Muhurta: ${p.brahmaMuhurta.start.toLocaleTimeString()} - ${p.brahmaMuhurta.end.toLocaleTimeString()}`);
}

console.log('\n--- Planetary Positions ---');
console.log(`Sun: ${p.planetaryPositions.sun.rashiName} (${p.planetaryPositions.sun.degree.toFixed(2)}°)`);
console.log(`Moon: ${p.planetaryPositions.moon.rashiName} (${p.planetaryPositions.moon.degree.toFixed(2)}°)`);
