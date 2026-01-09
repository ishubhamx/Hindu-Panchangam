import { getPanchangam } from '../index';
import { calculateTaraBalam, calculateChandraBalamFromRashi } from '../core/calculations';
import { nakshatraNames, yogaNames, tithiNames, karanaNames, rashiNames } from "../core/constants";
import { Observer } from 'astronomy-engine';

const BANGALORE = new Observer(12.9716, 77.5946, 920); // Assuming Bangalore as usual for Drik defaults

// Date from HTML: Jan 8, 2026
// JAN 8, 2025 for Debugging (Ashwini)
// Debug Aug 31, 2025 Moonset
const date = new Date('2025-08-31T12:00:00+05:30');

// Get Panchangam
const p = getPanchangam(date, BANGALORE);

console.log(`--- Library Calculation for ${date.toLocaleDateString()} ---`);
console.log(`Sunrise: ${p.sunrise?.toLocaleString()}`);
console.log(`Nakshatra: ${nakshatraNames[p.nakshatra]} (${p.nakshatra})`);
console.log(`Nakshatra Start: ${p.nakshatraStartTime?.toLocaleString()}`);
console.log(`Nakshatra End:   ${p.nakshatraEndTime?.toLocaleString()}`);
console.log(`Sunset:  ${p.sunset?.toLocaleString()}`);
console.log(`Moonrise: ${p.moonrise?.toLocaleString()}`);
console.log(`Moonset:  ${p.moonset?.toLocaleString()}`);

console.log(`\n--- Calendar Units ---`);
console.log(`Samvat: ${p.samvat.vikram} (Vikram), ${p.samvat.shaka} (Shaka) - ${p.samvat.samvatsara}`);
console.log(`Masa:   ${p.masa.name} (Adhika: ${p.masa.isAdhika})`);
console.log(`Paksha: ${p.paksha}`);
console.log(`Ritu:   ${p.ritu}`);
console.log(`Ayana:  ${p.ayana}`);

console.log(`\n--- Planetary Details (Phase 3) ---`);
console.log(`Moon Rashi: ${p.moonRashi.name} (${p.moonRashi.index})`);
console.log(`Moon Nakshatra Pada: ${p.nakshatraPada}`);
console.log(`Sun Rashi: ${p.sunRashi.name} (${p.sunRashi.index})`);
console.log(`Sun Nakshatra: ${p.sunNakshatra.name} (Pada: ${p.sunNakshatra.pada})`);
console.log(`Udaya Lagna (Ascendant): ${Math.floor(p.udayaLagna)}° (${Math.floor(p.udayaLagna / 30)} - ${rashiNames[Math.floor(p.udayaLagna / 30)]})`);

console.log(`\nTithi: ${tithiNames[p.tithi]} (${p.tithi})`);
console.log(`Nakshatra: ${nakshatraNames[p.nakshatra]} (${p.nakshatra})`);
console.log(`Yoga: ${yogaNames[p.yoga]} (${p.yoga})`);
console.log(`Karana: ${p.karana}`);

console.log('\n--- Transitions ---');
console.log('Nakshatra Transitions:');
p.nakshatraTransitions.forEach(t => console.log(`  ${t.name} ends at ${t.endTime.toLocaleString()}`));

console.log('Yoga Transitions:');
p.yogaTransitions.forEach(t => console.log(`  ${t.name} ends at ${t.endTime.toLocaleString()}`));

console.log('Tithi Transitions:');
p.tithiTransitions.forEach(t => console.log(`  ${t.name} ends at ${t.endTime.toLocaleString()}`));

console.log('Moon Rashi Transitions:');
if (p.moonRashiTransitions.length === 0) {
    console.log(`  No transition today.`);
} else {
    p.moonRashiTransitions.forEach(t => console.log(`  ${t.name} ends at ${t.endTime.toLocaleString()}`));
}

console.log('\n--- Advanced Muhurta (Phase 4) ---');
console.log(`Brahma Muhurta: ${p.brahmaMuhurta ? p.brahmaMuhurta.start.toLocaleString() : 'N/A'}`);
console.log(`Amrit Kalam:     ${p.amritKalam.length > 0 ? p.amritKalam[0].start.toLocaleString() : 'N/A'}`);
console.log(`Varjyam:         ${p.varjyam.length > 0 ? p.varjyam[0].start.toLocaleString() : 'N/A'}`);

// Dummy Birth Data for verification (e.g., Birth Star: Ashwini (0), Birth Rashi: Aries (0))
const birthNakshatra = 0; // Ashwini
const birthRashi = 0;     // Aries
console.log(`\n--- Personalised Strength (For Birth Star: Ashwini, Rashi: Aries) ---`);
const tara = calculateTaraBalam(p.nakshatra, birthNakshatra);
const chandra = calculateChandraBalamFromRashi(p.moonRashi.index, birthRashi);
console.log(`Tara Balam:    ${tara.strength} (${tara.type})`);
console.log(`Chandra Balam: ${chandra.strength} (${chandra.type})`);

console.log('\n--- Special Yogas (Phase 5) ---');
if (p.specialYogas.length === 0) {
    console.log("No special yogas active.");
} else {
    p.specialYogas.forEach(y => console.log(`${y.name}: ${y.description}`));
}

console.log('\n--- Vimshottari Dasha (Phase 6) ---');
console.log(`Balance: ${p.vimshottariDasha.dashaBalance}`);
console.log(`Current Mahadasha: ${p.vimshottariDasha.currentMahadasha.planet} (Ends: ${p.vimshottariDasha.currentMahadasha.endTime.toLocaleDateString()})`);
console.log(`Current Antardasha: ${p.vimshottariDasha.currentAntardasha?.planet || 'N/A'} (Ends: ${p.vimshottariDasha.currentAntardasha?.endTime.toLocaleDateString()})`);

console.log('\n--- Festivals (Phase 7) ---');
if (p.festivals.length === 0) {
    console.log("No major festivals today.");
} else {
    p.festivals.forEach(f => console.log(`🎉 ${f}`));
}
