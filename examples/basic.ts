import { getPanchangam, Observer, rashiNames, yogaNames } from '../dist/src/index';

const observer = new Observer(12.9716, 77.5946, 920);

// Option 1: Simple (Uses Longitude Approximation - Good for 99% of cases)
// const p = getPanchangam(new Date(), observer);

// Option 2: Accurate (Uses Explicit Timezone - Necessary for edge cases near midnight)
const p = getPanchangam(new Date(), observer, { timezoneOffset: 330 }); // 330 min = +5:30 IST

console.log("Input Date:", new Date().toLocaleString('en-US', { timeZone: "Asia/Kolkata" }));
console.log(`Current Yoga: ${yogaNames[p.yoga]}`);
console.log(`Sun Rashi: ${p.planetaryPositions.sun.rashiName} (Pada: ${p.sunNakshatra.pada})`);
console.log(`Current Dasha: ${p.vimshottariDasha.currentMahadasha.planet} (${p.vimshottariDasha.dashaBalance})`);
console.log(`Festivals: ${p.festivals.join(', ')}`);
console.log(`Brahma Muhurta: ${p.brahmaMuhurta?.start.toLocaleTimeString()} - ${p.brahmaMuhurta?.end.toLocaleTimeString()}`);