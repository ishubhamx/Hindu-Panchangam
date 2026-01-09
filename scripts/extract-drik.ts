
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

// Usage: ts-node src/scripts/extract-drik.ts [date] [geonameId]
// date format: DD/MM/YYYY (default: 22/06/2025)
// geonameId: default 1277333 (Bangalore)

const CACHE_FILE = path.resolve(__dirname, 'drik-cache.json');

interface DrikData {
    date: string;
    locationId: string;
    sunrise: string | null;
    sunset: string | null;
    tithi: { name: string | null; endTime: string | null; };
    nakshatra: { name: string | null; endTime: string | null; };
    yoga: { name: string | null; endTime: string | null; };
    karana: { name: string | null; endTime: string | null; };
    vara: string | null;
    rahuKalam: string | null;
    yamaganda: string | null;
    gulika: string | null;
    abhijit: string | null;
    moonrise: string | null;
    moonset: string | null;
    brahmaMuhurta: string | null;
    // New Fields
    sunRashi: string | null;
    moonRashi: string | null;
    amritKalam: string[];
    varjyam: string[];
    festivals: string[]; // List of festivals
    source?: 'cache' | 'web';
}

interface Cache {
    [key: string]: DrikData;
}

let MEM_CACHE: Cache | null = null;

function loadCache(): Cache {
    if (MEM_CACHE) return MEM_CACHE;

    if (fs.existsSync(CACHE_FILE)) {
        try {
            MEM_CACHE = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
            return MEM_CACHE!;
        } catch (e) {
            console.error('Error reading cache:', e);
        }
    }
    MEM_CACHE = {};
    return MEM_CACHE;
}

function saveCache(cache: Cache) {
    MEM_CACHE = cache; // Update memory
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
        console.error('Error saving cache:', e);
    }
}

export async function extractDrikData(dateStr: string = '22/06/2025', geonameId: string = '1277333'): Promise<DrikData | null> {
    // Validate date format DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        // Try to handle YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-');
            dateStr = `${d}/${m}/${y}`;
        } else {
            console.error('Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD');
            return null;
        }
    }

    // Check Cache
    const cache = loadCache();
    const cacheKey = `${geonameId}_${dateStr}`;
    if (cache[cacheKey]) {
        return { ...cache[cacheKey], source: 'cache' };
    }

    // Add delay before fetching to respect rate limits
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));

    const url = `https://www.drikpanchang.com/panchang/day-panchang.html?date=${dateStr}&geoname-id=${geonameId}`;

    try {
        // console.log(`Fetching data from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;

        const $ = cheerio.load(html);

        // Extract Keys/Values from rows
        const tableData: { [key: string]: string } = {};
        const festivals: string[] = []; // Collect festivals
        const amritKalams: string[] = [];
        const varjyams: string[] = [];

        $('.dpTableRow').each((i, row) => {
            const keys = $(row).find('.dpTableKey');
            const values = $(row).find('.dpTableValue');

            keys.each((j, keyEl) => {
                const k = $(keyEl).text().trim();
                const v = $(values[j]).text().trim(); // 1:1 mapping assumption
                tableData[k] = v;

                // Also handle partial matches if exact key fails later
                if (k.includes('Rahu Kalam')) tableData['Rahu Kalam'] = v;
                if (k.includes('Yamaganda')) tableData['Yamaganda'] = v;
                if (k.includes('Gulikai')) tableData['Gulikai'] = v;
                if (k.includes('Abhijit')) tableData['Abhijit'] = v;
                if (k.includes('Moonrise')) tableData['Moonrise'] = v;
                if (k.includes('Moonset')) tableData['Moonset'] = v;
                if (k.includes('Brahma Muhurta')) tableData['Brahma Muhurta'] = v;

                if (k.includes('Amrit Kalam')) amritKalams.push(v);
                if (k.includes('Varjyam')) varjyams.push(v);

                if (k.includes('Sun Rashi') || k.includes('Sunsign') || k.includes('Sun Sign')) tableData['Sun Rashi'] = v;
                if (k.includes('Moon Rashi') || k.includes('Moonsign') || k.includes('Moon Sign')) tableData['Moon Rashi'] = v;
            });
        });

        // Extract Festivals (usually list items or specific classes)
        // Drik often puts festivals in .dpFestivalList or similar
        $('.dpFestivalContent').each((i, el) => {
            const text = $(el).text().trim();
            if (text) festivals.push(text);
        });
        // Fallback: Check standard festival container if above fails
        if (festivals.length === 0) {
            $('.dpPanchangFestival').each((i, el) => {
                festivals.push($(el).text().trim());
            });
        }

        // Use the extracted JS data for core fields (it's reliable)
        const extract = (key: string, type: 'string' | 'int' = 'string') => {
            const regexStr = type === 'string'
                ? `drikp_g_PanchangamChart\\.drikp_g_${key}_=['"](.*?)['"]`
                : `drikp_g_PanchangamChart\\.drikp_g_${key}_=(\\d+)`;

            const regex = new RegExp(regexStr);
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        const data: DrikData = {
            date: dateStr,
            locationId: geonameId,
            sunrise: extract('sunrise_hhmm'),
            sunset: extract('sunset_hhmm'),
            tithi: {
                name: extract('tithi_name'),
                endTime: extract('tithi_hhmm')
            },
            nakshatra: {
                name: extract('nakshatra_name'),
                endTime: extract('nakshatra_hhmm')
            },
            yoga: {
                name: extract('yoga_name'),
                endTime: extract('yoga_hhmm')
            },
            karana: {
                name: extract('karana_name'),
                endTime: extract('karana_hhmm')
            },
            vara: extract('weekday_name') || tableData['Vara'] || (() => {
                // Fallback: Compute from Date
                const [d, m, y] = dateStr.split('/').map(Number);
                const date = new Date(y, m - 1, d);
                const days = ['Raviwara', 'Somawara', 'Mangalawara', 'Budhawara', 'Guruwara', 'Shukrawara', 'Shaniwara'];
                return days[date.getDay()];
            })(),
            rahuKalam: tableData['Rahu Kalam'] || null,
            yamaganda: tableData['Yamaganda'] || null,
            gulika: tableData['Gulikai'] || null,
            abhijit: tableData['Abhijit'] || null,
            moonrise: tableData['Moonrise'] || null,
            moonset: tableData['Moonset'] || null,
            brahmaMuhurta: tableData['Brahma Muhurta'] || null,
            sunRashi: tableData['Sun Rashi'] || null,
            moonRashi: tableData['Moon Rashi'] || null,
            amritKalam: amritKalams,
            varjyam: varjyams,
            festivals: festivals
        };

        // Validate data validity (simple check)
        if (data.tithi.name) {
            // Save to Cache
            cache[cacheKey] = data;
            saveCache(cache);
        }

        return { ...data, source: 'web' };

    } catch (error) {
        console.error('Error fetching data:', (error as any).message);
        return null;
    }
}

// Only run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const dateStr = args[0] || '22/06/2025';
    const geonameId = args[1] || '1277333';

    // Simple console logger for CLI usage
    extractDrikData(dateStr, geonameId).then(data => {
        if (data) console.log(JSON.stringify(data, null, 2));
    });
}
