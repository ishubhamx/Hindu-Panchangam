# @ishubhamx/panchangam-js

A professional, rigorously tested TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements. Built on high-precision Swiss Ephemeris calculations (`astronomy-engine`) and validated against Drik Panchang data.

[![npm version](https://img.shields.io/npm/v/@ishubhamx/panchangam-js)](https://www.npmjs.com/package/@ishubhamx/panchangam-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live Demo**: [hindu-panchang-c1a81.web.app](https://hindu-panchang-c1a81.web.app)

## Features

### Core Panchangam
- ✅ **Tithi** — Lunar day (1–30) with precise start/end times & transitions
- ✅ **Nakshatra** — Lunar mansion (0–26) with Pada and transitions
- ✅ **Yoga** — Solar-lunar combination (0–26)
- ✅ **Karana** — Half-tithi periods with transitions
- ✅ **Vara** — Day of the week

### Muhurta & Timings
- ✅ **Abhijit Muhurta** — Auspicious noon period
- ✅ **Brahma Muhurta** — Pre-dawn spiritual window
- ✅ **Govardhan Muhurta** — Afternoon auspicious time
- ✅ **Choghadiya** — Day & night Choghadiya intervals with Good/Bad ratings
- ✅ **Gowri Panchangam** — Day & night Gowri intervals with ratings
- ✅ **Rahu Kalam, Yamaganda Kalam, Gulika Kalam** — Inauspicious periods
- ✅ **Dur Muhurta** — Inauspicious muhurta windows
- ✅ **Amrit Kalam & Varjyam** — Auspicious/inauspicious Nakshatra windows

### Vedic Astrology
- ✅ **Planetary Positions** — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu with Rashi, longitude, and degree
- ✅ **Vimshottari Dasha** — Mahadasha, Antardasha, full 120-year cycle
- ✅ **Kundli (Birth Chart)** — Bhava (house) calculations and Varga charts (D1–D12)
- ✅ **Kundli Matching** — Ashtakoota matching with all 8 Kootas and Dosha analysis
- ✅ **Ayanamsa** — Lahiri ayanamsa calculation
- ✅ **Udaya Lagna** — Rising sign at sunrise

### Compatibility Features
- ✅ **Tarabalam** — Nakshatra-based daily auspiciousness
- ✅ **Chandrashtama** — Moon in 8th house from birth Rashi
- ✅ **Disha Shoola** — Directional inauspiciousness by Vara

### Calendar & Festivals
- ✅ **Masa, Paksha, Ritu, Ayana, Samvat** — Complete Hindu calendar context
- ✅ **Festival Detection** — 80+ major & minor Hindu festivals based on Udaya Tithi
- ✅ **Ekadashi Names** — Named Ekadashis for each Masa/Paksha
- ✅ **Sankranti Detection** — Solar ingress dates
- ✅ **Special Yogas** — Amrit Siddhi, Sarvartha Siddhi, Guru Pushya, Ravi Pushya

### Technical
- ✅ **CommonJS Output** — Works with `require()` and `import` (via esModuleInterop)
- ✅ **TypeScript** — Full type definitions included
- ✅ **Offline** — No external API calls, works completely offline
- ✅ **98.64% Accuracy** — Validated against 643,797  Panchang test cases

## Installation

```bash
npm install @ishubhamx/panchangam-js
```

## Quick Start

### ESM (TypeScript / Modern JS)

```typescript
import { getPanchangam, Observer, tithiNames, nakshatraNames } from '@ishubhamx/panchangam-js';

const observer = new Observer(28.6139, 77.2090, 216); // Delhi
const panchang = getPanchangam(new Date(), observer, {
    timezoneOffset: 330  // IST = UTC+5:30 = 330 minutes
});

console.log(`Tithi: ${tithiNames[panchang.tithi]}`);
console.log(`Nakshatra: ${nakshatraNames[panchang.nakshatra]}`);
console.log(`Sunrise: ${panchang.sunrise?.toLocaleTimeString()}`);
console.log(`Paksha: ${panchang.paksha}`);
console.log(`Masa: ${panchang.masa.name}`);
console.log(`Ritu: ${panchang.ritu}`);
```

### CommonJS (Node.js)

```javascript
const { getPanchangam, Observer } = require('@ishubhamx/panchangam-js');

const observer = new Observer(19.0760, 72.8777, 10); // Mumbai
const panchang = getPanchangam(new Date(), observer, { timezoneOffset: 330 });
console.log(panchang.tithi);
```

## API Reference

### `getPanchangam(date, observer, options?)`

Calculate complete Panchang for a given date and location.

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `Date` | JavaScript Date object |
| `observer` | `Observer` | Location (latitude, longitude, elevation) |
| `options.timezoneOffset` | `number` | Offset from UTC in minutes (e.g., 330 for IST) |

**Returns:** `Panchangam` object with all calculated data.

### `Observer(latitude, longitude, elevation)`

Create an observer for a geographic location (from `astronomy-engine`).

| Parameter | Type | Range |
|-----------|------|-------|
| `latitude` | `number` | −90 to 90 (decimal degrees) |
| `longitude` | `number` | −180 to 180 (decimal degrees) |
| `elevation` | `number` | Meters above sea level |

### Muhurta Functions

```typescript
const p = getPanchangam(new Date(), observer);

// Choghadiya — 8 day + 8 night intervals
p.choghadiya.day.forEach(interval => {
    console.log(`${interval.name}: ${interval.startTime.toLocaleTimeString()} - ${interval.endTime.toLocaleTimeString()} (${interval.rating})`);
});

// Gowri Panchangam — 8 day + 8 night intervals
p.gowri.day.forEach(interval => {
    console.log(`${interval.name} (${interval.rating}): ${interval.startTime.toLocaleTimeString()}`);
});
```

### Compatibility Features

```typescript
import { getDishaShoola, getTarabalam, getChandrashtama } from '@ishubhamx/panchangam-js';

// Disha Shoola — directional inauspiciousness
const shoola = getDishaShoola(0); // 0 = Sunday
console.log(shoola.direction, shoola.description);

// Tarabalam — Nakshatra-based auspiciousness
const tara = getTarabalam(0, 5); // birthNakshatra, currentNakshatra
console.log(tara.taraName, tara.isAuspicious);

// Chandrashtama — Moon in 8th from birth Rashi
const chandra = getChandrashtama(0, 7); // birthRashi, moonRashi
console.log(chandra.isChandrashtama);
```

### Kundli (Birth Chart)

```typescript
import { calculateKundli, Observer } from '@ishubhamx/panchangam-js';

const kundli = calculateKundli(new Date('1990-05-15T10:30:00'), observer);
console.log('Ascendant:', kundli.ascendant);
console.log('Houses:', kundli.houses);
console.log('Vargas:', kundli.vargas); // D1, D2, D3, D4, D7, D9, D10, D12
```

### Kundli Matching (Ashtakoota)

```typescript
import { calculateMatch } from '@ishubhamx/panchangam-js';

const result = calculateMatch(
    { nakshatra: 0, rashi: 0 },  // Person 1
    { nakshatra: 13, rashi: 6 }  // Person 2
);

console.log(`Total Score: ${result.totalScore}/36`);
console.log('Kootas:', result.kootas);
console.log('Doshas:', result.doshas);
```

### Festival Detection

```typescript
import { getFestivals, Observer } from '@ishubhamx/panchangam-js';

const festivals = getFestivals({
    date: new Date('2026-01-23'),
    observer,
    timezoneOffset: 330
});

festivals.forEach(f => console.log(`${f.name} (${f.category})`));
```

### Helper Arrays

```typescript
import {
    tithiNames,        // 30 Tithi names
    nakshatraNames,    // 27 Nakshatra names
    yogaNames,         // 27 Yoga names
    rashiNames,        // 12 Rashi names
    masaNames,         // 12 Masa names
    rituNames,         // 6 Ritu names
    dayNames           // 7 Day names
} from '@ishubhamx/panchangam-js';
```

## Timezone Handling

The library requires timezone offset in minutes for accurate sunrise-anchored calculations.

```typescript
function getTimezoneOffset(timeZone: string, date: Date): number {
    const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
    const match = str.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    if (!match) return 0;
    const sign = match[1].startsWith('+') ? 1 : -1;
    const hours = parseInt(match[1].replace(/[+-]/, ''), 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return sign * (hours * 60 + minutes);
}

const offset = getTimezoneOffset('Asia/Kolkata', new Date()); // 330
```

### Common Timezones

| Location | Timezone | Offset (minutes) |
|----------|----------|------------------|
| India | Asia/Kolkata | 330 |
| Nepal | Asia/Kathmandu | 345 |
| Sri Lanka | Asia/Colombo | 330 |
| UK | Europe/London | 0 |
| US East | America/New_York | −300 |
| US West | America/Los_Angeles | −480 |
| Singapore | Asia/Singapore | 480 |
| Australia | Australia/Sydney | 660 |

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
    Panchangam,
    PanchangamOptions,
    PlanetaryPosition,
    TithiTransition,
    NakshatraTransition,
    Festival,
    DashaResult,
    ChoghadiyaResult,
    GowriResult,
    TarabalamInfo,
    DishaShoola,
    ChandrashtamaInfo
} from '@ishubhamx/panchangam-js';
```

## Accuracy & Validation

- Validated against Drik Panchang (98.64% match over 643,797 test cases)
- 200 consecutive days (Sep 2025 – Apr 2026) verified at 100% accuracy
- Swiss Ephemeris precision (±0.001° accuracy) via `astronomy-engine`
- Regression tested for 25+ years into the future
- 1075 unit tests covering edge cases, DST, leap years, and timezone boundaries

## Compatibility

- ✅ Node.js 18+
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ React Native
- ✅ CommonJS (`require()`) and ESM (`import`) via `esModuleInterop`

## Performance

- Calculation time: ~5–10ms per date
- Memory usage: ~2MB
- No external API calls — works completely offline

## License

MIT License — see [LICENSE](https://github.com/ishubhamx/Hindu-Panchangam/blob/main/LICENSE)

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@ishubhamx/panchangam-js)
- 🌐 [Live Demo](https://hindu-panchang-c1a81.web.app)
- 📖 [GitHub Repository](https://github.com/ishubhamx/Hindu-Panchangam)
- 🐛 [Report Issues](https://github.com/ishubhamx/Hindu-Panchangam/issues)

## Credits

Built with [astronomy-engine](https://github.com/cosinekitty/astronomy) for precise Swiss Ephemeris calculations.

---

**Made with ❤️ for preserving Vedic astronomy traditions**
