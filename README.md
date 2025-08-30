# Panchangam JS


A TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements including Tithi, Nakshatra, Yoga, Karana, and Vara using Swiss Ephemeris astronomical calculations.

## Features

- **Tithi Calculation**: Calculate lunar phases and tithi (lunar day)
- **Nakshatra**: Determine the lunar mansion (nakshatra)
- **Yoga**: Calculate the combination of solar and lunar longitudes
- **Karana**: Determine the half-tithi periods
- **Vara**: Calculate the day of the week
- **Sunrise/Sunset**: Accurate sunrise and sunset times
- **Moonrise/Moonset**: Lunar rise and set times
- **End Times**: Calculate when tithi, nakshatra, and yoga end
- **Rahu Kalam**: Calculate inauspicious time periods

## Installation

```bash
npm install @ishubhamx/panchangam-js
```

## Usage

### Basic Usage

```typescript
import { getPanchangam, Observer } from '@ishubhamx/panchangam-js';

// Create an observer for a specific location
const observer = new Observer(12.9716, 77.5946, 920); // Bangalore coordinates

// Get panchangam for a specific date
const date = new Date('2025-06-15');
const panchangam = getPanchangam(date, observer);

console.log('Tithi:', panchangam.tithi);
console.log('Nakshatra:', panchangam.nakshatra);
console.log('Yoga:', panchangam.yoga);
console.log('Karana:', panchangam.karana);
console.log('Vara:', panchangam.vara);
console.log('Sunrise:', panchangam.sunrise);
console.log('Sunset:', panchangam.sunset);
```

Note: The `Observer` class and other astronomy utilities are re-exported from the astronomy-engine package for convenience. You can import them directly from our package without needing to install astronomy-engine separately.

### Generate HTML Calendar

```typescript
import { generateHtmlCalendar } from '@ishubhamx/panchangam-js';

const year = 2025;
const month = 6; // June
const observer = new Observer(12.9716, 77.5946, 920);
const timeZone = 'Asia/Kolkata';

const htmlContent = generateHtmlCalendar(year, month, observer, timeZone);
// Save to file or serve as web page
```

### Available Constants

```typescript
import { karanaNames, yogaNames } from '@ishubhamx/panchangam-js';

// Karana names: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]
console.log('Karana:', karanaNames[panchangam.karana]);

// Yoga names: ["Vishkambha", "Priti", "Ayushman", ...]
console.log('Yoga:', yogaNames[panchangam.yoga]);
```

## API Reference

### `getPanchangam(date: Date, observer: Observer): Panchangam`

Returns a complete panchangam object for the given date and location.

**Parameters:**
- `date`: JavaScript Date object
- `observer`: Astronomy Engine Observer object with latitude, longitude, and elevation

**Returns:**
```typescript
interface Panchangam {
    tithi: number;                    // 0-29 (Prathama to Amavasya/Purnima)
    nakshatra: number;               // 0-26 (Ashwini to Revati)
    yoga: number;                    // 0-26 (Vishkambha to Vaidhriti)
    karana: string;                  // Karana name
    vara: number;                    // 0-6 (Sunday to Saturday)
    sunrise: Date | null;            // Sunrise time
    sunset: Date | null;             // Sunset time
    moonrise: Date | null;           // Moonrise time
    moonset: Date | null;            // Moonset time
    nakshatraStartTime: Date | null; // When current nakshatra started
    nakshatraEndTime: Date | null;   // When current nakshatra ends
    tithiStartTime: Date | null;     // When current tithi started
    tithiEndTime: Date | null;       // When current tithi ends
    yogaEndTime: Date | null;        // When current yoga ends
    rahuKalamStart: Date | null;     // Rahu Kalam start time
    rahuKalamEnd: Date | null;       // Rahu Kalam end time
}
```

### `generateHtmlCalendar(year: number, month: number, observer: Observer, timeZone: string): string`

Generates a complete HTML calendar for the specified month.

**Parameters:**
- `year`: Year (e.g., 2025)
- `month`: Month (1-12)
- `observer`: Observer object for location
- `timeZone`: IANA timezone string

**Returns:** HTML string with complete calendar

## Dependencies

- `astronomy-engine`: Swiss Ephemeris calculations
- `luxon`: Date/time handling

## Examples

### Node.js Usage

```javascript
const { getPanchangam, Observer } = require('@ishubhamx/panchangam-js');

const observer = new Observer(12.9716, 77.5946, 920);
const date = new Date();
const panchangam = getPanchangam(date, observer);

console.log('Today\'s Panchangam:', panchangam);
```

### Browser Usage

```html
<script type="module">
import { getPanchangam, Observer } from 'https://unpkg.com/@ishubhamx/panchangam-js/dist/index.js';

const observer = new Observer(12.9716, 77.5946, 920);
const date = new Date();
const panchangam = getPanchangam(date, observer);

console.log('Today\'s Panchangam:', panchangam);
</script>
```

## Environment Compatibility

This library is designed to work in any JavaScript environment:
- Node.js
- Browser (with ES modules)
- React applications
- React Native applications
- Other JavaScript frameworks

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 