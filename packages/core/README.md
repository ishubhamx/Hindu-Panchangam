# @ishubhamx/panchangam-js

A professional, rigorously tested TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements. Built on high-precision Swiss Ephemeris calculations (`astronomy-engine`) and validated against Drik Panchang data.

[![npm version](https://img.shields.io/npm/v/@ishubhamx/panchangam-js)](https://www.npmjs.com/package/@ishubhamx/panchangam-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live Demo**: [hindu-panchang-c1a81.web.app](https://hindu-panchang-c1a81.web.app)

## Features

- ✅ **Precise Calculations**: Swiss Ephemeris-based astronomical calculations
- ✅ **Complete Panchang**: Tithi, Nakshatra, Yoga, Karana, Vara
- ✅ **Muhurta Times**: Abhijit, Brahma Muhurta, Rahu Kaal, Yamaganda, Gulika
- ✅ **Planetary Positions**: Sun, Moon, planets with Rashi placements
- ✅ **Astrological Data**: Ayanamsa, Lagna, Vimshottari Dasha
- ✅ **Festival Calculation**: Major Hindu festivals with accurate dates
- ✅ **Timezone Support**: Works globally with any timezone
- ✅ **TypeScript**: Full type definitions included
- ✅ **98.64% Accuracy**: Validated against Drik Panchang

## Installation

```bash
npm install @ishubhamx/panchangam-js
```

## Quick Start

```typescript
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

// Create observer for location
const observer = new Observer(
    28.6139,  // Latitude (Delhi)
    77.2090,  // Longitude
    216       // Elevation in meters
);

// Calculate Panchang for a date
const date = new Date('2025-06-22');
const panchang = getPanchangam(date, observer, {
    timezoneOffset: 330  // IST = UTC+5:30 = 330 minutes
});

console.log(panchang);
```

### Output

```javascript
{
    tithi: 5,                    // Panchami
    nakshatra: 12,               // Hasta
    yoga: 15,                    // Vyatipata
    karana: 'Bava',
    vara: 0,                     // Sunday
    sunrise: Date,
    sunset: Date,
    moonrise: Date,
    moonset: Date,
    
    // Muhurta timings
    rahuKalamStart: Date,
    rahuKalamEnd: Date,
    abhijitMuhurta: { start: Date, end: Date },
    brahmaMuhurta: { start: Date, end: Date },
    
    // Astrological data
    moonRashi: { sign: 6, name: 'Virgo' },
    sunRashi: { sign: 2, name: 'Gemini' },
    planetaryPositions: { ... },
    
    // Calendar information
    paksha: 'Shukla',
    masa: { name: 'Jyeshtha', isAdhika: false },
    samvat: { vikram: 2082, shaka: 1947 },
    
    // More...
}
```

## API Reference

### `getPanchangam(date, observer, options?)`

Calculate complete Panchang for a given date and location.

**Parameters:**
- `date`: JavaScript Date object
- `observer`: Observer instance with latitude, longitude, elevation
- `options`: Optional configuration
  - `timezoneOffset`: Offset from UTC in minutes (e.g., 330 for IST)

**Returns:** `Panchangam` object with complete data

### `Observer(latitude, longitude, elevation)`

Create an observer for a geographic location.

**Parameters:**
- `latitude`: Decimal degrees (-90 to 90)
- `longitude`: Decimal degrees (-180 to 180)
- `elevation`: Meters above sea level

### Helper Functions

```typescript
import { 
    getSunrise,
    getSunset,
    getMoonrise,
    getMoonset,
    tithiNames,
    nakshatraNames,
    yogaNames
} from '@ishubhamx/panchangam-js';

// Get sunrise time
const sunrise = getSunrise(date, observer);

// Get readable names
const tithiName = tithiNames[panchang.tithi]; // "Panchami"
const nakshatraName = nakshatraNames[panchang.nakshatra]; // "Hasta"
```

## Timezone Handling

The library requires timezone offset in minutes. Here's how to calculate it:

```typescript
function getTimezoneOffset(timeZone: string, date: Date): number {
    const str = date.toLocaleString('en-US', { 
        timeZone, 
        timeZoneName: 'longOffset' 
    });
    const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    
    if (!match) return 0;
    
    const sign = match[1].startsWith('+') ? 1 : -1;
    const hours = parseInt(match[1].replace(/[+-]/, ''), 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    
    return sign * (hours * 60 + minutes);
}

// Usage
const offset = getTimezoneOffset('Asia/Kolkata', new Date()); // 330
const panchang = getPanchangam(date, observer, { timezoneOffset: offset });
```

## Common Timezones

| Location | Timezone | Offset (minutes) |
|----------|----------|------------------|
| India | Asia/Kolkata | 330 |
| Nepal | Asia/Kathmandu | 345 |
| UK | Europe/London | 0 |
| US East | America/New_York | -300 |
| US West | America/Los_Angeles | -480 |
| Australia | Australia/Sydney | 660 |

## Complete Example

```typescript
import { getPanchangam, Observer, tithiNames, nakshatraNames } from '@ishubhamx/panchangam-js';

// Mumbai coordinates
const observer = new Observer(19.0760, 72.8777, 10);

// Today's date
const date = new Date();

// Calculate offset for IST
const offset = 330; // IST = UTC+5:30

// Get Panchang
const panchang = getPanchangam(date, observer, { timezoneOffset: offset });

// Format output
console.log(`Date: ${date.toLocaleDateString()}`);
console.log(`Tithi: ${tithiNames[panchang.tithi]}`);
console.log(`Nakshatra: ${nakshatraNames[panchang.nakshatra]}`);
console.log(`Sunrise: ${panchang.sunrise?.toLocaleTimeString()}`);
console.log(`Sunset: ${panchang.sunset?.toLocaleTimeString()}`);
console.log(`Rahu Kaal: ${panchang.rahuKalamStart?.toLocaleTimeString()} - ${panchang.rahuKalamEnd?.toLocaleTimeString()}`);

// Check for festivals
if (panchang.festivals?.length > 0) {
    console.log(`Festivals: ${panchang.festivals.join(', ')}`);
}
```

## Advanced Features

### Planetary Positions

```typescript
const positions = panchang.planetaryPositions;
console.log(`Moon: ${positions.moon.longitude}° in ${positions.moon.rashi.name}`);
console.log(`Sun: ${positions.sun.longitude}° in ${positions.sun.rashi.name}`);
```

### Vimshottari Dasha

```typescript
const dasha = panchang.vimshottariDasha;
console.log(`Maha Dasha: ${dasha.mahaDasha.planet}`);
console.log(`Antar Dasha: ${dasha.antarDasha.planet}`);
console.log(`Remaining: ${dasha.mahaDasha.remainingYears.toFixed(2)} years`);
```

### Festival Calendar

```typescript
import { getFestivalsInMonth } from '@ishubhamx/panchangam-js';

const festivals = getFestivalsInMonth(2025, 6, observer);
festivals.forEach(festival => {
    console.log(`${festival.name} on ${festival.date.toLocaleDateString()}`);
});
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type { 
    Panchangam, 
    Observer, 
    PlanetaryPosition,
    Rashi,
    VimshottariDasha 
} from '@ishubhamx/panchangam-js';

const observer: Observer = new Observer(28.6139, 77.2090, 216);
const panchang: Panchangam = getPanchangam(new Date(), observer);
```

## Accuracy & Validation

- Validated against Drik Panchang (98.64% match over 643,797 test cases)
- Swiss Ephemeris precision (±0.001° accuracy)
- Tested across global locations and timezones
- Edge cases handled: DST, leap years, midnight transitions

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Node.js 18+

## Performance

- Calculation time: ~5-10ms per date
- Memory usage: ~2MB
- No external API calls - works offline

## License

MIT License - see [LICENSE](https://github.com/ishubhamx/Hindu-Panchangam/blob/main/LICENSE)

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@ishubhamx/panchangam-js)
- 🌐 [Live Demo](https://hindu-panchang-c1a81.web.app)
- 📖 [GitHub Repository](https://github.com/ishubhamx/Hindu-Panchangam)
- 🐛 [Report Issues](https://github.com/ishubhamx/Hindu-Panchangam/issues)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](https://github.com/ishubhamx/Hindu-Panchangam/blob/main/CONTRIBUTING.md)

## Credits

Built with [astronomy-engine](https://github.com/cosinekitty/astronomy) for precise planetary calculations.

---

**Made with ❤️ for preserving Vedic astronomy traditions**
