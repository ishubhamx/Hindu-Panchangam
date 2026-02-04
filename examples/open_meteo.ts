
import { getPanchangam, Observer } from '../src/index';
// @ts-ignore
import https from 'https';

// --- Helper: Fetch JSON from URL (Node.js without external deps) ---
function fetchJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// --- Helper: Get Timezone Offset in Minutes from Timezone ID (e.g. "Asia/Kolkata" -> 330) ---
function getTimezoneOffsetMinutes(timeZone: string, date: Date = new Date()): number {
    // Format: "GMT+05:30" or "GMT-05:00"
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset',
        hour12: false
    });

    const parts = dtf.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');

    if (!tzPart) return 0; // Fallback

    // content is like "GMT+05:30" or "GMT-5"
    const gmtString = tzPart.value.replace('GMT', ''); // "+05:30"
    if (gmtString === '') return 0; // UTC

    const sign = gmtString.includes('-') ? -1 : 1;
    const [hours, minutes] = gmtString.replace('+', '').replace('-', '').split(':').map(Number);

    const totalMinutes = (hours * 60) + (minutes || 0);
    return sign * totalMinutes;
}

// --- Main Example Flow ---
async function runExample(city: string) {
    console.log(`\n--- Looking up Panchang for: ${city} ---`);

    try {
        // 1. Search Location
        const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const data = await fetchJson(searchUrl);

        if (!data.results || data.results.length === 0) {
            console.log("City not found!");
            return;
        }

        const location = data.results[0];
        console.log(`Found: ${location.name}, ${location.country} (Lat: ${location.latitude}, Lon: ${location.longitude})`);
        console.log(`Timezone ID: ${location.timezone}`);

        // 2. Calculate Offset
        const date = new Date();
        const offset = getTimezoneOffsetMinutes(location.timezone || 'UTC', date);
        console.log(`Calculated Offset: ${offset} minutes (${offset / 60} hours)`);

        // 3. Get Panchang
        const observer = new Observer(location.latitude, location.longitude, 0);
        const panchangam = getPanchangam(date, observer, { timezoneOffset: offset });

        console.log(`\n[Panchang Results]`);
        console.log(`Tithi: ${panchangam.tithi} (Calculated with precise Local Midnight)`);
        console.log(`Sunrise: ${panchangam.sunrise?.toLocaleString('en-US', { timeZone: location.timezone })}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

// Diverse list of cities covering various timezones and edge cases
const CITIES = [
    "Baker Island",    // UTC -12:00
    "Honolulu",        // UTC -10:00
    "Anchorage",       // UTC -09:00
    "Los Angeles",     // UTC -08:00
    "New York",        // UTC -05:00
    "St. John's",      // UTC -03:30 (Newfoundland)
    "London",          // UTC +00:00
    "Paris",           // UTC +01:00
    "Tehran",          // UTC +03:30
    "Dubai",           // UTC +04:00
    "Kabul",           // UTC +04:30
    "Mumbai",          // UTC +05:30
    "Kathmandu",       // UTC +05:45 (Nepal)
    "Lhasa",           // UTC +08:00 (China - Solar lag)
    "Tokyo",           // UTC +09:00
    "Eucla",           // UTC +08:45 (Australia)
    "Adelaide",        // UTC +09:30 or +10:30
    "Sydney",          // UTC +10:00 or +11:00
    "Chatham Islands", // UTC +12:45
    "Kiritimati",      // UTC +14:00 (Line Islands)
];

(async () => {
    console.log(`Running Panchang calculations for ${CITIES.length} global locations...\n`);
    for (const city of CITIES) {
        await runExample(city);
        // Small delay to be nice to the free API
        await new Promise(r => setTimeout(r, 200));
    }
})();
