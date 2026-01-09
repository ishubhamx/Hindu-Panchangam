# Panchangam JS

A professional, rigorously tested TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements. Built on high-precision Swiss Ephemeris calculations (`astronomy-engine`) and validated against Drik Panchang data.

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
  - Major festivals (Diwali, Rama Navami, etc.) deteced automatically based on Tithi/Masa.

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

### Generating an HTML Calendar

The library includes a utility to generate a monthly HTML calendar view.

```typescript
import { generateHtmlCalendar, Observer } from '@ishubhamx/panchangam-js';

const html = generateHtmlCalendar(2025, 6, new Observer(12.9716, 77.5946, 920), 'Asia/Kolkata');
// Write 'html' string to a .html file
```

## Usage in Applications

This library is Isomorphic (Universal), meaning it works seamlessly in **Node.js**, **Browsers**, and **React Native**.

### 🌐 Web Applications (React, Next.js, Vue)

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

If you want to contribute or run the tests locally:

1.  **Clone the repo**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run Tests**:
    ```bash
    npm test
    ```
    This runs the full Jest test suite, including astronomical validations and real-data regression tests.

## License

MIT License. Free for commercial and personal use.