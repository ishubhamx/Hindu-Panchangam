# @ishubhamx/panchangam-js

**The most comprehensive Hindu Panchang / Panchangam library for JavaScript & TypeScript.** Calculate Tithi, Nakshatra, Yoga, Karana, Muhurta, Kundli, Dasha, planetary positions, and 80+ Hindu festivals — all offline, with Swiss Ephemeris precision.

Whether you're building a **Hindu calendar app**, **Vedic astrology software**, **Jyotish tool**, **daily Panchang website**, or a **horoscope matching application** — this library has everything you need.

[![npm version](https://img.shields.io/npm/v/@ishubhamx/panchangam-js)](https://www.npmjs.com/package/@ishubhamx/panchangam-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live Demo**: [hindu-panchang-c1a81.web.app](https://hindu-panchang-c1a81.web.app)

---

## Why This Library?

| What you get | Details |
|---|---|
| **Full Panchang** | Tithi, Nakshatra, Yoga, Karana, Vara with precise transition times |
| **Muhurta & Timings** | Choghadiya, Rahu Kalam, Abhijit Muhurta, Brahma Muhurta, and more |
| **Kundli / Birth Chart** | Ascendant, Bhava houses, Varga charts (D1 – D12) |
| **Kundli Matching** | Ashtakoota (Gun Milan) with all 8 Kootas & Dosha analysis |
| **Vimshottari Dasha** | Full 120-year Mahadasha & Antardasha cycle |
| **Planetary Positions** | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu with Rashi placement |
| **80+ Festivals** | Diwali, Holi, Navratri, Ekadashi, Sankranti, and 75+ more — auto-detected |
| **Offline & Fast** | No API calls. ~5–10 ms per calculation. Works in Node.js & browsers |
| **98.64% Accuracy** | Validated against 643,797 Drik Panchang test cases |

---

## Features

### Core Panchangam (Daily Panchang)
- ✅ **Tithi** — Lunar day (1–30) with precise start/end times & transitions
- ✅ **Nakshatra** — Lunar mansion (0–26) with Pada and transitions
- ✅ **Yoga** — Solar-lunar combination (0–26)
- ✅ **Karana** — Half-tithi periods with transitions
- ✅ **Vara** — Day of the week (Ravivaar, Somvaar, etc.)

### Muhurta & Auspicious/Inauspicious Timings
- ✅ **Abhijit Muhurta** — Most auspicious noon period for starting new work
- ✅ **Brahma Muhurta** — Sacred pre-dawn period for meditation & prayer
- ✅ **Govardhan Muhurta** — Afternoon auspicious time
- ✅ **Choghadiya** — Day & night Choghadiya with Shubh/Labh/Amrit/Kaal ratings
- ✅ **Gowri Panchangam** — Day & night Gowri intervals with ratings
- ✅ **Rahu Kalam** — Inauspicious Rahu period (Rahu Kaal)
- ✅ **Yamaganda Kalam** — Inauspicious Yama period
- ✅ **Gulika Kalam** — Inauspicious Gulika period
- ✅ **Dur Muhurta** — Inauspicious muhurta windows
- ✅ **Amrit Kalam & Varjyam** — Auspicious/inauspicious Nakshatra-based windows

### Vedic Astrology (Jyotish)
- ✅ **Planetary Positions** — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu with Rashi, longitude, and degree
- ✅ **Vimshottari Dasha** — Mahadasha, Antardasha, full 120-year Dasha cycle
- ✅ **Kundli (Birth Chart / Janam Kundali)** — Bhava (house) calculations and Varga charts (D1–D12)
- ✅ **Kundli Matching (Gun Milan / Horoscope Matching)** — Ashtakoota matching with all 8 Kootas and Mangal Dosha analysis
- ✅ **Ayanamsa** — Lahiri ayanamsa (Chitrapaksha) calculation
- ✅ **Udaya Lagna** — Rising sign (Ascendant) at sunrise

### Compatibility & Personalized Features
- ✅ **Tarabalam** — Nakshatra-based daily auspiciousness check
- ✅ **Chandrashtama** — Moon in 8th house from birth Rashi (inauspicious Moon transit)
- ✅ **Disha Shoola** — Directional inauspiciousness by day of the week

### Hindu Calendar & Festival Detection
- ✅ **Masa (Hindu Month)** — Chaitra, Vaishakha, Jyeshtha, and all 12 months
- ✅ **Paksha** — Shukla Paksha (waxing) & Krishna Paksha (waning)
- ✅ **Ritu (Season)** — Vasanta, Grishma, Varsha, Sharad, Hemanta, Shishira
- ✅ **Ayana** — Uttarayana & Dakshinayana
- ✅ **Samvat** — Vikram Samvat year
- ✅ **80+ Hindu Festivals** — Diwali, Holi, Ram Navami, Janmashtami, Ganesh Chaturthi, Maha Shivaratri, Navratri, Durga Puja, Raksha Bandhan, Makar Sankranti, Pongal, Ugadi, Ekadashi, Purnima, Amavasya, and many more
- ✅ **Named Ekadashis** — All 24 Ekadashi names for each Masa/Paksha
- ✅ **Sankranti Detection** — Solar ingress dates for all 12 Rashis
- ✅ **Special Yogas** — Amrit Siddhi Yoga, Sarvartha Siddhi Yoga, Guru Pushya Yoga, Ravi Pushya Yoga

### Sunrise & Sunset
- ✅ **Sunrise & Sunset** — Precise times for any location using Swiss Ephemeris
- ✅ **Moonrise & Moonset** — Accurate lunar rise/set times
- ✅ **Location-based** — Works for any latitude/longitude worldwide

### Technical Highlights
- ✅ **TypeScript** — Full type definitions included
- ✅ **CommonJS + ESM** — Works with `require()` and `import`
- ✅ **Offline-first** — No external API calls, works completely offline
- ✅ **High Accuracy** — 98.64% match with Drik Panchang (643,797 test cases)
- ✅ **Lightweight** — ~2 MB memory footprint
- ✅ **Cross-platform** — Node.js, Browser, React Native

---

## Installation

```bash
npm install @ishubhamx/panchangam-js
```

```bash
yarn add @ishubhamx/panchangam-js
```

```bash
pnpm add @ishubhamx/panchangam-js
```

---

## Quick Start

### Get Today's Panchang (ESM / TypeScript)

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

---

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

### Muhurta & Choghadiya

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

### Rahu Kalam, Yamaganda & Gulika Kalam

Rahu Kalam (also known as Rahu Kaal) and other inauspicious periods are included in the Panchangam result:

```typescript
const p = getPanchangam(new Date(), observer, { timezoneOffset: 330 });

console.log(`Rahu Kalam: ${p.rahuKalam.start} - ${p.rahuKalam.end}`);
console.log(`Yamaganda: ${p.yamaganda.start} - ${p.yamaganda.end}`);
console.log(`Gulika: ${p.gulika.start} - ${p.gulika.end}`);
```

### Tarabalam, Chandrashtama & Disha Shoola

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

### Kundli / Birth Chart (Janam Kundali)

Generate a Vedic birth chart (Kundli) with house placements and Varga charts:

```typescript
import { calculateKundli, Observer } from '@ishubhamx/panchangam-js';

const kundli = calculateKundli(new Date('1990-05-15T10:30:00'), observer);
console.log('Ascendant:', kundli.ascendant);
console.log('Houses:', kundli.houses);
console.log('Vargas:', kundli.vargas); // D1, D2, D3, D4, D7, D9, D10, D12
```

### Kundli Matching / Gun Milan (Horoscope Matching)

Match two horoscopes using the traditional Ashtakoota system:

```typescript
import { calculateMatch } from '@ishubhamx/panchangam-js';

const result = calculateMatch(
    { nakshatra: 0, rashi: 0 },  // Person 1 (Bride/Groom)
    { nakshatra: 13, rashi: 6 }  // Person 2 (Bride/Groom)
);

console.log(`Total Score: ${result.totalScore}/36`);
console.log('Kootas:', result.kootas);
console.log('Doshas:', result.doshas);
```

### Hindu Festival Detection

Detect 80+ festivals for any date — Diwali, Holi, Ekadashi, Navratri, and more:

```typescript
import { getFestivals, Observer } from '@ishubhamx/panchangam-js';

const festivals = getFestivals({
    date: new Date('2026-01-23'),
    observer,
    timezoneOffset: 330
});

festivals.forEach(f => console.log(`${f.name} (${f.category})`));
```

### Vimshottari Dasha

Calculate the full 120-year Mahadasha and Antardasha cycle:

```typescript
const p = getPanchangam(new Date('1990-05-15'), observer, { timezoneOffset: 330 });
console.log('Dasha:', p.dasha);
```

### Helper Arrays & Constants

```typescript
import {
    tithiNames,        // 30 Tithi names (Pratipada to Amavasya)
    nakshatraNames,    // 27 Nakshatra names (Ashwini to Revati)
    yogaNames,         // 27 Yoga names (Vishkumbha to Vaidhriti)
    rashiNames,        // 12 Rashi names (Mesha to Meena)
    masaNames,         // 12 Masa names (Chaitra to Phalguna)
    rituNames,         // 6 Ritu names (Vasanta to Shishira)
    dayNames           // 7 Day names (Ravivaar to Shanivaar)
} from '@ishubhamx/panchangam-js';
```

---

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
|----------|----------|-------------------|
| India | Asia/Kolkata | 330 |
| Nepal | Asia/Kathmandu | 345 |
| Sri Lanka | Asia/Colombo | 330 |
| UK | Europe/London | 0 |
| US East | America/New_York | −300 |
| US West | America/Los_Angeles | −480 |
| Singapore | Asia/Singapore | 480 |
| Australia | Australia/Sydney | 660 |

---

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

---

## Accuracy & Validation

- ✅ Validated against **Drik Panchang** (98.64% match over 643,797 test cases)
- ✅ 200 consecutive days (Sep 2025 – Apr 2026) verified at **100% accuracy**
- ✅ Swiss Ephemeris precision (±0.001° accuracy) via `astronomy-engine`
- ✅ Regression tested for 25+ years into the future
- ✅ **1,075 unit tests** covering edge cases, DST, leap years, and timezone boundaries

---

## Compatibility

| Platform | Status |
|----------|--------|
| Node.js 18+ | ✅ Supported |
| Chrome/Edge 90+ | ✅ Supported |
| Firefox 88+ | ✅ Supported |
| Safari 14+ | ✅ Supported |
| React Native | ✅ Supported |
| CommonJS (`require()`) | ✅ Supported |
| ESM (`import`) | ✅ Supported |

---

## Performance

| Metric | Value |
|--------|-------|
| Calculation time | ~5–10 ms per date |
| Memory usage | ~2 MB |
| Network calls | Zero (fully offline) |

---

## Use Cases

This library is ideal for building:

- 📅 **Hindu Calendar / Panchang apps** — Daily Tithi, Nakshatra, and Muhurta
- 🕉️ **Temple & Puja apps** — Auspicious times, festival alerts, Brahma Muhurta reminders
- 🔮 **Jyotish / Vedic Astrology software** — Kundli, Dasha, planetary positions
- 💍 **Marriage / Kundli matching apps** — Ashtakoota Gun Milan, Dosha checking
- 🗓️ **Festival calendar apps** — Auto-detect Diwali, Holi, Navratri, Ekadashi dates
- ⏰ **Muhurta / Auspicious time finders** — Choghadiya, Rahu Kalam, Abhijit Muhurta
- 📰 **Daily Panchang widgets** — For websites, blogs, and news portals
- 🌍 **Diaspora community apps** — Location-based Panchang for any city worldwide

---

## Related Keywords

<details>
<summary>What people search for (SEO)</summary>

hindu calendar api, panchangam javascript, panchang npm, tithi calculator, nakshatra finder, today panchang, daily panchangam, vedic calendar library, jyotish software, hindu festival api, kundli software javascript, birth chart calculator, horoscope matching api, gun milan api, choghadiya today, rahu kalam today, auspicious time calculator, muhurta calculator, dasha calculator, vimshottari dasha, planetary positions api, sunrise sunset api, indian calendar npm, lunar calendar javascript, hindu month calculator, ekadashi dates, sankranti dates, tamil panchangam, telugu panchangam, kannada panchangam, marathi panchang, gujarati panchang, north indian panchang, south indian panchangam, drik panchang api alternative, swiss ephemeris javascript, ayanamsa calculator, lahiri ayanamsa, udaya tithi, panchang widget, React panchang component, Node.js astrology library

</details>

---

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
