import { getPanchangam } from '../src';
import { varjyamStartGhatis, nakshatraNames } from '../src/core/constants';
import { Observer } from 'astronomy-engine';

const date = new Date('2025-04-12T06:00:00+05:30'); // Apr 12 morning
const location = { latitude: 12.9716, longitude: 77.5946, height: 0 };
const observer = new Observer(location.latitude, location.longitude, 0);

const p = getPanchangam(date, observer);

console.log('Date:', date.toISOString());
console.log('Nakshatra:', nakshatraNames[p.nakshatra], `(${p.nakshatra})`);
console.log('Nakshatra Start:', p.nakshatraStartTime?.toISOString());
console.log('Nakshatra End:', p.nakshatraEndTime?.toISOString());
console.log('Varjyam Start (Lib):', p.varjyam?.start.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }));
console.log('Varjyam Constant (Ghatis):', varjyamStartGhatis[p.nakshatra]);

// Calculate manually:
// Duration = End - Start
// Ghati duration = Duration / 60
// Start = NakshatraStart + (Constant * GhatiDuration)

if (p.nakshatraStartTime && p.nakshatraEndTime) {
    const durationMs = p.nakshatraEndTime.getTime() - p.nakshatraStartTime.getTime();
    const ghatiMs = durationMs / 60;
    const offsetGhatis = varjyamStartGhatis[p.nakshatra];
    const offsetMs = offsetGhatis * ghatiMs;
    const calcStart = new Date(p.nakshatraStartTime.getTime() + offsetMs);
    console.log('Manual Calc Varjyam Start:', calcStart.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }));

    // Amrit Kalam
    const akOffsetGhatis = 45; // Hardcoded for Hasta (or import constant)
    const akOffsetMs = akOffsetGhatis * ghatiMs;
    const akStart = new Date(p.nakshatraStartTime.getTime() + akOffsetMs);
    console.log('Amrit Kalam Start (Lib):', p.amritKalam?.start.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }));
    console.log('Manual Calc Amrit Start (45G):', akStart.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }));
}
