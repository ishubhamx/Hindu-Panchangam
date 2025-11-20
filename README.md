# Panchangam JS


A TypeScript/JavaScript library for calculating Indian Panchangam (Hindu Calendar) elements including Tithi, Nakshatra, Yoga, Karana, and Vara using Swiss Ephemeris astronomical calculations.

## Features

### Core Panchangam Elements
- **Tithi Calculation**: Calculate lunar phases and tithi (lunar day)
- **Nakshatra**: Determine the lunar mansion (nakshatra)
- **Yoga**: Calculate the combination of solar and lunar longitudes
- **Karana**: Determine the half-tithi periods
- **Vara**: Calculate the day of the week

### Astronomical Times
- **Sunrise/Sunset**: Accurate sunrise and sunset times
- **Moonrise/Moonset**: Lunar rise and set times
- **End Times**: Calculate when tithi, nakshatra, and yoga end

### Enhanced Vedic Features

#### Muhurta (Auspicious Times)
- **Abhijit Muhurta**: Most auspicious time of the day (24 minutes around noon)
- **Brahma Muhurta**: Pre-dawn meditation time (96 minutes before sunrise)
- **Govardhan Muhurta**: Afternoon auspicious period

#### Inauspicious Times  
- **Rahu Kalam**: Calculate inauspicious time periods
- **Yamaganda Kalam**: Death-related inauspicious periods
- **Gulika Kalam**: Saturn-influenced unfavorable times
- **Dur Muhurta**: Multiple inauspicious periods throughout the day

#### Planetary Calculations
- **Planetary Positions**: Longitude, Rashi (zodiac sign), and degrees for all major planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
- **Chandra Balam**: Moon strength calculation (0-100%)
- **Hora**: Current planetary hour based on traditional system

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

// Enhanced Vedic Features
console.log('Abhijit Muhurta:', panchangam.abhijitMuhurta);
console.log('Brahma Muhurta:', panchangam.brahmaMuhurta);
console.log('Chandra Balam:', panchangam.chandrabalam + '%');
console.log('Current Hora:', panchangam.currentHora);
console.log('Sun in:', panchangam.planetaryPositions.sun.rashiName);
console.log('Moon in:', panchangam.planetaryPositions.moon.rashiName);
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
import { 
  karanaNames, 
  yogaNames, 
  tithiNames, 
  nakshatraNames, 
  rashiNames, 
  horaRulers 
} from '@ishubhamx/panchangam-js';

// Karana names: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]
console.log('Karana:', karanaNames[panchangam.karana]);

// Yoga names: ["Vishkambha", "Priti", "Ayushman", ...]
console.log('Yoga:', yogaNames[panchangam.yoga]);

// Rashi names: ["Aries", "Taurus", "Gemini", ...]
console.log('Sun Rashi:', rashiNames[panchangam.planetaryPositions.sun.rashi]);

// Hora rulers: ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]
console.log('Current Hora Planet:', panchangam.currentHora);
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
    // Core Panchangam Elements
    tithi: number;                    // 0-29 (Prathama to Amavasya/Purnima)
    nakshatra: number;               // 0-26 (Ashwini to Revati)
    yoga: number;                    // 0-26 (Vishkambha to Vaidhriti)
    karana: string;                  // Karana name
    vara: number;                    // 0-6 (Sunday to Saturday)
    
    // Astronomical Times
    sunrise: Date | null;            // Sunrise time
    sunset: Date | null;             // Sunset time
    moonrise: Date | null;           // Moonrise time
    moonset: Date | null;            // Moonset time
    nakshatraStartTime: Date | null; // When current nakshatra started
    nakshatraEndTime: Date | null;   // When current nakshatra ends
    tithiStartTime: Date | null;     // When current tithi started
    tithiEndTime: Date | null;       // When current tithi ends
    yogaEndTime: Date | null;        // When current yoga ends
    
    // Inauspicious Times
    rahuKalamStart: Date | null;     // Rahu Kalam start time
    rahuKalamEnd: Date | null;       // Rahu Kalam end time
    yamagandaKalam: MuhurtaTime | null;  // Yamaganda Kalam period
    gulikaKalam: MuhurtaTime | null;     // Gulika Kalam period
    durMuhurta: MuhurtaTime[] | null;    // Multiple Dur Muhurta periods
    
    // Auspicious Times
    abhijitMuhurta: MuhurtaTime | null;  // Abhijit Muhurta period
    brahmaMuhurta: MuhurtaTime | null;   // Brahma Muhurta period
    govardhanMuhurta: MuhurtaTime | null; // Govardhan Muhurta period
    
    // Planetary Information
    planetaryPositions: {
        sun: PlanetaryPosition;      // Sun's position in rashi
        moon: PlanetaryPosition;     // Moon's position in rashi
        mars: PlanetaryPosition;     // Mars position
        mercury: PlanetaryPosition;  // Mercury position
        jupiter: PlanetaryPosition;  // Jupiter position
        venus: PlanetaryPosition;    // Venus position
        saturn: PlanetaryPosition;   // Saturn position
    };
    chandrabalam: number;            // Moon strength (0-100)
    currentHora: string;             // Current planetary hour
    
    // Transition Information
    karanaTransitions: KaranaTransition[];
    tithiTransitions: TithiTransition[];
    nakshatraTransitions: NakshatraTransition[];
    yogaTransitions: YogaTransition[];
}

interface PlanetaryPosition {
    longitude: number;      // Longitude in degrees (0-360)
    rashi: number;         // Rashi index (0-11: Aries to Pisces)
    rashiName: string;     // Rashi name (e.g., "Aries", "Taurus")
    degree: number;        // Degree within the rashi (0-30)
}

interface MuhurtaTime {
    start: Date;           // Start time of the period
    end: Date;             // End time of the period
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

### Enhanced Vedic Features Example

```javascript
const { getPanchangam, Observer, rashiNames, horaRulers } = require('@ishubhamx/panchangam-js');

const observer = new Observer(12.9716, 77.5946, 920); // Bangalore coordinates
const date = new Date('2025-06-22');
const panchangam = getPanchangam(date, observer);

// Core Panchangam
console.log('Tithi:', panchangam.tithi);
console.log('Nakshatra:', panchangam.nakshatra);
console.log('Yoga:', panchangam.yoga);

// Muhurta Times
console.log('Abhijit Muhurta:', panchangam.abhijitMuhurta);
console.log('Brahma Muhurta:', panchangam.brahmaMuhurta);

// Inauspicious Times
console.log('Rahu Kalam:', panchangam.rahuKalamStart, 'to', panchangam.rahuKalamEnd);
console.log('Yamaganda Kalam:', panchangam.yamagandaKalam);
console.log('Gulika Kalam:', panchangam.gulikaKalam);

// Planetary Information
console.log('Sun in:', panchangam.planetaryPositions.sun.rashiName, 
            `(${panchangam.planetaryPositions.sun.degree.toFixed(2)}°)`);
console.log('Moon in:', panchangam.planetaryPositions.moon.rashiName,
            `(${panchangam.planetaryPositions.moon.degree.toFixed(2)}°)`);
console.log('Moon Strength (Chandra Balam):', panchangam.chandrabalam + '%');

// Current Hora
console.log('Current Planetary Hour (Hora):', panchangam.currentHora);

// Dur Muhurta periods
if (panchangam.durMuhurta) {
    console.log('Dur Muhurta periods:');
    panchangam.durMuhurta.forEach((period, index) => {
        console.log(`  ${index + 1}: ${period.start} to ${period.end}`);
    });
}
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

## Testing and Examples

### Run the Example
```bash
npm run vedic-example
```
This will run a comprehensive example showing all the enhanced Vedic features.

### Run Simple Test
```bash
npm run simple-test
```
Basic functionality test to verify the library is working correctly.

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