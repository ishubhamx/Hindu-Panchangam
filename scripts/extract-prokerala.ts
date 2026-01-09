
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const CACHE_FILE = path.resolve(__dirname, 'prokerala-cache.json');

interface ProkeralaData {
    date: string;
    sunrise: string | null;
    sunset: string | null;
    moonrise: string | null;
    moonset: string | null;
    tithi: { name: string; endTime: string }[];
    nakshatra: { name: string; endTime: string }[];
    yoga: { name: string; endTime: string }[];
    karana: { name: string; endTime: string }[];
    rahuKalam: string | null;
    yamaganda: string | null;
    gulika: string | null;
    abhijit: string | null;
    amritKalam: string | null;
}

interface Cache {
    [key: string]: ProkeralaData;
}

let MEM_CACHE: Cache | null = null;

function loadCache(): Cache {
    if (MEM_CACHE) return MEM_CACHE;
    if (fs.existsSync(CACHE_FILE)) {
        try {
            MEM_CACHE = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
            return MEM_CACHE!;
        } catch (e) { console.error(e); }
    }
    MEM_CACHE = {};
    return MEM_CACHE;
}

function saveCache(cache: Cache) {
    MEM_CACHE = cache;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export async function extractProkeralaData(date: Date): Promise<ProkeralaData | null> {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const yyyy = date.getFullYear();
    const mm = months[date.getMonth()];
    const dd = date.getDate().toString().padStart(2, '0');

    // URL Format: https://www.prokerala.com/astrology/panchang/2025-january-06.html
    const url = `https://www.prokerala.com/astrology/panchang/${yyyy}-${mm}-${dd}.html`;
    const dateKey = `${yyyy}-${mm}-${dd}`;

    const cache = loadCache();
    if (cache[dateKey]) return cache[dateKey];

    console.log(`Fetching ${url}...`);

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);

        // Result Object
        const result: ProkeralaData = {
            date: dateKey,
            sunrise: null,
            sunset: null,
            moonrise: null,
            moonset: null,
            tithi: [],
            nakshatra: [],
            yoga: [],
            karana: [],
            rahuKalam: null,
            yamaganda: null,
            gulika: null,
            abhijit: null,
            amritKalam: null
        };

        const extractListItems = (selector: string): { name: string; value: string }[] => {
            const items: { name: string; value: string }[] = [];
            $(selector).find('ol > li').each((_, el) => {
                const name = $(el).find('span.b').text().trim();
                // The time/value is typically in the last span, or the text content after the name
                // Looking at the dump: <span class="b">...</span> - <span>Time</span>
                // So finding the last span in the li works
                const value = $(el).find('span').last().text().trim();
                items.push({ name, value });
            });
            return items;
        };

        // Extract Standard Lists
        const tithiItems = extractListItems('.panchang-data-tithi');
        result.tithi = tithiItems.map(i => ({ name: i.name, endTime: i.value }));

        const nakItems = extractListItems('.panchang-data-nakshatra');
        result.nakshatra = nakItems.map(i => ({ name: i.name, endTime: i.value }));

        const yogaItems = extractListItems('.panchang-data-yoga');
        result.yoga = yogaItems.map(i => ({ name: i.name, endTime: i.value }));

        const karanaItems = extractListItems('.panchang-data-karana');
        result.karana = karanaItems.map(i => ({ name: i.name, endTime: i.value }));

        // Extract Sun/Moon Timings
        const sunMoonItems = extractListItems('.panchang-data-sun_moon_timing');
        sunMoonItems.forEach(item => {
            const lower = item.name.toLowerCase();
            if (lower.includes('sunrise')) result.sunrise = item.value;
            if (lower.includes('sunset')) result.sunset = item.value;
            if (lower.includes('moonrise')) result.moonrise = item.value;
            if (lower.includes('moonset')) result.moonset = item.value;
        });

        // Extract Inauspicious Periods
        const inauspiciousItems = extractListItems('.panchang-data-inauspicious-period');
        inauspiciousItems.forEach(item => {
            const lower = item.name.toLowerCase();
            if (lower.includes('rahu')) result.rahuKalam = item.value;
            if (lower.includes('yamaganda')) result.yamaganda = item.value;
            if (lower.includes('gulika')) result.gulika = item.value;
        });

        // Extract Auspicious Periods
        const auspiciousItems = extractListItems('.panchang-data-auspicious-period');
        auspiciousItems.forEach(item => {
            const lower = item.name.toLowerCase();
            if (lower.includes('abhijit')) result.abhijit = item.value;
            if (lower.includes('amrit')) result.amritKalam = item.value;
        });

        // Save to cache
        cache[dateKey] = result;
        saveCache(cache);

        return result;

    } catch (error) {
        console.error(`Failed to fetch ${url}`, error);
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    const date = new Date('2025-01-06');
    extractProkeralaData(date).then(console.log);
}
