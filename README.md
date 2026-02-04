# Panchangam JS

A professional, rigorously tested TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements. Built on high-precision Swiss Ephemeris calculations (`astronomy-engine`) and validated against Drik Panchang data.

🌐 **Live Demo**: [hindu-panchang-c1a81.web.app](https://hindu-panchang-c1a81.web.app)

## 📦 Packages

This is a monorepo containing:

| Package | Description | npm |
|---------|-------------|-----|
| [@panchangam/core](./packages/core) | Core calculation library | [![npm](https://img.shields.io/npm/v/@ishubhamx/panchangam-js)](https://www.npmjs.com/package/@ishubhamx/panchangam-js) |
| [@panchangam/web](./packages/web) | Modern React web application | - |

## Features

### Core Panchangam Elements
- **Tithi**: Lunar day and phases (0-29)
- **Nakshatra**: Lunar mansion (0-26)
- **Yoga**: Solar-lunar combination (0-26)
- **Karana**: Half-tithi periods
- **Vara**: Day of the week

### Astronomical Calculation
- **Precision**: Uses Swiss Ephemeris algorithms via `astronomy-engine`.
- **Positioning**: Calculates exact Sunrise, Sunset, Moonrise, and Moonset for any lat/long/elevation.
- **End Times**: precise end times for Tithi, Nakshatra, and Yoga.

### Enhanced Vedic Features
- **Muhurats**:
  - **Abhijit Muhurta**: Auspicious noon period
  - **Brahma Muhurta**: Pre-dawn spiritual window
  - **Govardhan Muhurta**: Afternoon auspicious time
- **Inauspicious Periods**:
  - **Rahu Kalam**
  - **Yamaganda Kalam**
  - **Gulika Kalam**
  - **Dur Muhurta**
- **Planetary Info**:
  - **Positions**: Rashi (Sign), Longitude, and Degrees for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn.
  - **Chandra Balam**: Moon strength calculation.
  - **Hora**: Current planetary hour ruler.
- **Vimshottari Dasha**:
  - **Dasha Balance**: Current ruling planet and time remaining.
  - **Full Cycle**: Complete 120-year prediction.
  - **Antardasha**: Sub-periods.
- **Special Yogas**:
  - **Amrit Siddhi Yoga**
  - **Sarvartha Siddhi Yoga**
  - **Guru/Ravi Pushya**
- **Festivals**:
  - Major festivals (Diwali, Rama Navami, etc.) detected automatically based on Tithi/Masa.

### Day Interpretation Rules
- **Sunrise Anchoring**: All daily attributes (Tithi, Nakshatra, Yoga, Karana, Vara) are calculated at the exact moment of **Sunrise** for the given location, strictly following standard Panchangam rules.
- **Instantaneous Values**: Planetary positions and Ascendant (Lagna) are calculated for the *exact input time* provided.

## Accuracy & Validation

This library is **rigorously tested** to ensure reliability for real-world usage:

- **Real-World Data**: Verified against **200 consecutive days** (Sep 2025 - Apr 2026) of Drik Panchang data with **100% accuracy**.
- **Long-Term Stability**: Regression tested for 25+ years into the future (2030, 2035, 2040, 2045, 2050) against ground truth data.
- **Unit Testing**: Comprehensive test suite covering edge cases, leap years, and timezone boundaries.
- **High Performance**: Benchmarked at **~5ms per calculation** (193 ops/sec) on standard hardware, ready for real-time mobile use.

## Installation

```bash
npm install @ishubhamx/panchangam-js
```

## Usage

### Basic Example

```typescript
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

// 1. Define Location (Observer)
// Example: Bangalore (12.9716° N, 77.5946° E, 920m elevation)
const observer = new Observer(12.9716, 77.5946, 920);

// 2. Define Date
const date = new Date(); // or new Date('2025-06-15')

// 3. Get Panchangam
const panchangam = getPanchangam(date, observer);

console.log('Tithi:', panchangam.tithi);
console.log('Nakshatra:', panchangam.nakshatra);
console.log('Sunrise:', panchangam.sunrise);
console.log('Rahu Kalam:', panchangam.rahuKalamStart, '-', panchangam.rahuKalamEnd);
```

### Advanced Vedic Example

```typescript
import { getPanchangam, Observer, rashiNames, yogaNames } from '@ishubhamx/panchangam-js';

const observer = new Observer(12.9716, 77.5946, 920);
const p = getPanchangam(new Date(), observer);

console.log(`Current Yoga: ${yogaNames[p.yoga]}`);
console.log(`Sun Rashi: ${p.planetaryPositions.sun.rashiName} (Pada: ${p.sunNakshatra.pada})`);
console.log(`Current Dasha: ${p.vimshottariDasha.currentMahadasha.planet} (${p.vimshottariDasha.dashaBalance})`);
console.log(`Festivals: ${p.festivals.join(', ')}`);
console.log(`Brahma Muhurta: ${p.brahmaMuhurta?.start.toLocaleTimeString()} - ${p.brahmaMuhurta?.end.toLocaleTimeString()}`);
```

### Advanced Muhurta Example (Choghadiya & Gowri)

```typescript
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

const observer = new Observer(19.0760, 72.8777, 10); // Mumbai
const p = getPanchangam(new Date(), observer);

// Access Choghadiya
console.log('--- Day Choghadiya ---');
p.choghadiya.day.forEach(interval => {
    // Output: "Amrit: 6:00 AM - 7:30 AM (good)"
    console.log(`${interval.name}: ${interval.startTime.toLocaleTimeString()} - ${interval.endTime.toLocaleTimeString()} (${interval.rating})`);
});

console.log('--- Night Choghadiya ---');
p.choghadiya.night.forEach(interval => {
    console.log(`${interval.name}: ${interval.rating}`);
});

// Access Gowri Panchangam
console.log('--- Gowri Panchangam ---');
p.gowri.day.forEach(interval => {
    console.log(`${interval.name} (${interval.rating}): ${interval.startTime.toLocaleTimeString()}`);
});
```

### Generating an HTML Calendar

The library includes a utility to generate a monthly HTML calendar view.

```typescript
import { generateHtmlCalendar, Observer } from '@ishubhamx/panchangam-js';

const html = generateHtmlCalendar(2025, 6, new Observer(12.9716, 77.5946, 920), 'Asia/Kolkata');
// Write 'html' string to a .html file
```

## Timezone Handling

**Important**: This library does **not** bundle large timezone databases (like `tz-lookup`) to keep the bundle size small.

### Default Behavior
If no timezone offset is provided, the library **approximates** the timezone based on Longitude (`Longitude / 15`). This can be inaccurate for Civil Day calculations (e.g., India is 5.5h ahead, but approximation gives 5.0h).

### Best Practice (Critical for Accuracy)
You **MUST** provide the `timezoneOffset` in the `options` object to ensure the library calculates the Panchang for the correct Civil Day. 
Since Tithi and Nakshatra are anchored to the local Sunrise, an incorrect offset can shift the Sunrise time, potentially leading to off-by-one-day errors.

```typescript
// 1. Get Timezone Offset (Local Time - UTC) in Minutes
// Method A: Using standard Intl API (Browser/Node)
const getOffset = (timeZone: string) => {
    const now = new Date();
    const str = now.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
    const match = str.match(/GMT([+-]\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1].startsWith('+') ? 1 : -1;
    const hours = parseInt(match[1].slice(1), 10);
    const minutes = parseInt(match[2], 10);
    return sign * (hours * 60 + minutes);
}

// Method B: Fixed Constant (e.g. India = +330 minutes)
const IST_OFFSET = 330; 

// 2. Pass to Library
const observer = new Observer(12.9716, 77.5946, 920);
const panchang = getPanchangam(new Date(), observer, { 
    timezoneOffset: getOffset('Asia/Kolkata') // or IST_OFFSET
});
```

## Date Format Best Practices

**Important**: JavaScript Date parsing is inconsistent across browsers and environments. Always use **ISO 8601 format** to avoid unexpected behavior.

### ✅ Recommended Formats
```typescript
// ISO 8601 with timezone offset
const date = new Date("2026-01-17T00:05:00-08:00");  // Pacific Time
const date = new Date("2026-01-17T10:30:00+05:30"); // India Time

// Explicit UTC construction
const date = new Date(Date.UTC(2026, 0, 17, 8, 5, 0)); // 8:05 UTC
```

### ❌ Avoid Non-Standard Formats
```typescript
// These may parse inconsistently across environments:
const date = new Date("2026-01-17 00:05:00 GMT-0800"); // Space instead of T
const date = new Date("Jan 17, 2026 00:05:00");        // Locale-dependent
```

### Verification
Always verify your Date is parsed correctly:
```typescript
const date = new Date("2026-01-17T00:05:00-08:00");
console.log(date.toISOString()); 
// Expected: 2026-01-17T08:05:00.000Z (00:05 PST = 08:05 UTC)
```

If the output doesn't match the expected UTC time, your date string was not parsed correctly.

## Usage in Applications

This library is Isomorphic (Universal), meaning it works seamlessly in **Node.js**, **Browsers**, and **React Native**.

### 🌐 Web Application

Check out our official web app built with React + Vite:

- **Live**: [hindu-panchang-c1a81.web.app](https://hindu-panchang-c1a81.web.app)
- **Source**: [packages/web](./packages/web)

Features:
- 📅 Monthly calendar with Tithi, Nakshatra, and Moon phases
- 🌅 Sunrise/Sunset timeline visualization
- 📊 Panchang timeline chart (Tithi, Nakshatra, Yoga, Karana transitions)
- 🌓 Moon phase visualization
- ⏰ Muhurta timelines (Choghadiya, Gowri)
- 🚫 Inauspicious periods (Rahu Kalam, Yamaganda, Gulika)
- 🎉 Festival detection
- 🌙 Dark/Light theme support
- 📍 Location selector with timezone

### Custom Web Integration (React, Next.js, Vue)

The library relies on the `Observer` class from `astronomy-engine`, which is lightweight and browser-compatible.

**Next.js / React Example:**
```tsx
import { useState, useEffect } from 'react';
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

const PanchangComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 1. Get User Location (Browser API)
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      
      // 2. Create Observer & Calculate
      const observer = new Observer(latitude, longitude, 0);
      const panchang = getPanchangam(new Date(), observer);
      
      setData(panchang);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Today's Panchang</h1>
      <p>Tithi: {data.tithi}</p>
      <p>Sunrise: {data.sunrise?.toLocaleTimeString()}</p>
    </div>
  );
};
```

### 📱 Mobile Apps (React Native, Expo)

Since the calculation logic is pure TypeScript/JavaScript with no native module dependencies, it works out-of-the-box in React Native.

**React Native Example:**
```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

export default function App() {
  // Coordinates for Mumbai
  const observer = new Observer(19.0760, 72.8777, 10); 
  const panchang = getPanchangam(new Date(), observer);

  return (
    <View style={{ padding: 20 }}>
      <Text>Daily Panchang</Text>
      <Text>Nakshatra Index: {panchang.nakshatra}</Text>
      <Text>Rahu Kalam: {panchang.rahuKalamStart?.toLocaleTimeString()}</Text>
    </View>
  );
}
```

### ⚙️ Backend (Node.js API)

Ideal for building an API service that serves Panchang data to multiple clients.

**Express.js Example:**
```typescript
import express from 'express';
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

const app = express();

app.get('/api/panchang', (req, res) => {
  const { lat, lng, date } = req.query;
  
  const observer = new Observer(Number(lat), Number(lng), 10);
  const targetDate = date ? new Date(String(date)) : new Date();
  
  const result = getPanchangam(targetDate, observer);
  
  res.json(result);
});

app.listen(3000, () => console.log('Panchang API running on port 3000'));
```

## Data Types

### `Panchangam` Interface

```typescript
interface Panchangam {
    // Core
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: string;
    vara: number;

    // Times
    sunrise: Date | null;
    sunset: Date | null;
    tithiEndTime: Date | null;
    nakshatraEndTime: Date | null;
    // ... plus moonrise, moonset, yogaEndTime etc.

    // Muhurats
    rahuKalamStart: Date | null;
    rahuKalamEnd: Date | null;
    abhijitMuhurta: { start: Date, end: Date } | null;
    // ... quantities for yamaganda, brahma muhurta etc.

    // Planets
    planetaryPositions: {
        sun: { rashi: number, rashiName: string, degree: number, longitude: number };
        // ... moon, mars, mercury, jupiter, venus, saturn
    };
}
```

## Development

This project uses npm workspaces for monorepo management.

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/ishubhamx/Hindu-Panchangam.git
cd Hindu-Panchangam

# Install all dependencies
npm install

# Build all packages
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run build:core` | Build core library only |
| `npm run build:web` | Build web app only |
| `npm run dev` | Start web development server |
| `npm run test` | Run core library tests |
| `npm run lint` | Lint all packages |
| `npm run deploy` | Deploy web app to Firebase |

### Project Structure

```
Hindu-Panchangam/
├── package.json              # Root workspace config
├── packages/
│   ├── core/                 # @panchangam/core - Calculation library
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   └── web/                  # @panchangam/web - React web app
│       ├── src/
│       ├── firebase.json
│       └── package.json
├── examples/                 # Usage examples
├── scripts/                  # Utility scripts
└── doc/                      # Documentation
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License. Free for commercial and personal use.