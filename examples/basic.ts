import { getPanchangam, Observer } from '../index';

// 1. Define Location (Observer)
// Example: Bangalore (12.9716° N, 77.5946° E, 920m elevation)
const observer = new Observer(12.9716, 77.5946, 920);

// 2. Define Date
const date = new Date();

// 3. Get Panchangam
const panchangam = getPanchangam(date, observer);

console.log('--- Basic Panchangam ---');
console.log('Date:', date.toDateString());
console.log('Tithi:', panchangam.tithi);
console.log('Nakshatra:', panchangam.nakshatra);
console.log('Yoga:', panchangam.yoga);
console.log('Karana:', panchangam.karana);
console.log('Sunrise:', panchangam.sunrise?.toLocaleTimeString());
console.log('Sunset:', panchangam.sunset?.toLocaleTimeString());
