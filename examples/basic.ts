import { getPanchangam, Observer } from '../dist/src/index';
import { nakshatraNames, tithiNames, yogaNames } from '../src/core/constants';

// 1. Define Location (Observer)
// Example: Bangalore (12.9716° N, 77.5946° E, 920m elevation)
// const observer = new Observer(12.9716, 77.5946, 920);

// // 2. Define Date
// const date = new Date();

// // 3. Get Panchangam
// const panchangam = getPanchangam(date, observer);

// console.log('--- Basic Panchangam ---');
// console.log('Date:', date.toDateString());
// console.log('Tithi:', panchangam.tithi);
// console.log('Nakshatra:', panchangam.nakshatra);
// console.log('Yoga:', panchangam.yoga);
// console.log('Karana:', panchangam.karana);
// console.log('Sunrise:', panchangam.sunrise?.toLocaleTimeString());
// console.log('Sunset:', panchangam.sunset?.toLocaleTimeString());
const tz = "Asia/Kolkata";
const date = new Date("2026-09-20");
const observer = new Observer(17.385, 78.4867, 550); // Hyderabad

const p = getPanchangam(date, observer);


// Hack to force JSON.stringify to use local time in the specified Timezone
Date.prototype.toJSON = function () {
    return this.toLocaleString('en-IN', { timeZone: tz });
};

// console.log(JSON.stringify(p, null, 2));
p.choghadiya.day.forEach(interval => {
    console.log(`${interval.name}: ${interval.startTime.toLocaleTimeString()} - ${interval.endTime.toLocaleTimeString()} (${interval.rating})`);
});
console.log('------------------');
p.choghadiya.night.forEach(interval => {
    console.log(`${interval.name}: ${interval.startTime.toLocaleTimeString()} - ${interval.endTime.toLocaleTimeString()} (${interval.rating})`);
});
// Access Gowri
// p.gowri.day.forEach(interval => {
//     console.log(`${interval.name} (${interval.rating})`);
// });