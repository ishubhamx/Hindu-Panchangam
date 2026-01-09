import { getPlanetaryPosition } from '../src/core/calculations';
import { getAyanamsa } from '../src/core/ayanamsa';
import { Body } from 'astronomy-engine';

const results = [];
const startDate = new Date('2025-01-01T00:00:00Z'); // Using UTC to match python script

for (let i = 0; i < 10; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const ayanamsa = getAyanamsa(date);
    const sunPos = getPlanetaryPosition(Body.Sun, date, ayanamsa);
    const moonPos = getPlanetaryPosition(Body.Moon, date, ayanamsa);

    // Tithi = (Moon - Sun) / 12
    let diff = moonPos.longitude - sunPos.longitude;
    if (diff < 0) diff += 360;
    const tithiIndex = Math.floor(diff / 12) + 1;

    // Nakshatra = Moon / 13.3333
    const nakIndex = Math.floor(moonPos.longitude / (13 + 1 / 3));

    results.push({
        date: date.toISOString(),
        sun_lon: sunPos.longitude,
        moon_lon: moonPos.longitude,
        tithi_index: tithiIndex,
        nakshatra_index: nakIndex
    });
}

console.log(JSON.stringify(results, null, 2));
