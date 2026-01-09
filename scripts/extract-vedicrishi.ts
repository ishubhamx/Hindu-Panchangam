
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const CACHE_FILE = path.resolve(__dirname, 'vedicrishi-cache.json');

interface VedicRishiData {
    date: string; // YYYY-MM-DD
    sunrise: string;
    sunset: string;
    tithi: { name: string; endTime: string }[];
    nakshatra: { name: string; endTime: string }[];
    yoga: { name: string; endTime: string }[];
    karana: { name: string; endTime: string }[];
}

interface Cache {
    [key: string]: VedicRishiData;
}

export async function extractVedicRishiData(): Promise<VedicRishiData | null> {
    const url = 'https://vedicrishi.in/panchang';

    try {
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);

        const scriptContent = $('#__NEXT_DATA__').html();
        if (!scriptContent) {
            console.error('Next data not found');
            return null;
        }

        const json = JSON.parse(scriptContent);
        // console.log(JSON.stringify(json.props.pageProps, null, 2));

        const resultObj = json.props.pageProps?.resultobj || json.props.pageProps?.initialState?.resultobj;

        if (!resultObj) {
            console.error("ResultObj not found");
            console.log("PageProps Keys:", Object.keys(json.props.pageProps));
            return null;
        }

        console.log("ResultObj Keys:", Object.keys(resultObj));

        const p = resultObj.panchang;

        // Date from JSON
        const y = resultObj.cy;
        const m = resultObj.cm;
        const d = resultObj.cd;

        console.log(`Found Date raw: y=${y}, m=${m}, d=${d}`);

        if (!y || !m || !d) {
            console.error(`Date fields missing or zero`);
            // return null; // Continue to inspect p
        }

        // Check if we can construct a date
        const dateKey = (y && m && d)
            ? `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
            : '2026-01-09'; // Fallback for debugging, or throw

        const result: VedicRishiData = {
            date: dateKey,
            sunrise: p?.sunrise || null,
            sunset: p?.sunset || null,
            tithi: [],
            nakshatra: [],
            yoga: [],
            karana: []
        };

        // Helpers
        const formatEndTime = (et: any) => {
            if (!et) return "End";
            return `${et.hour}:${et.minute}:${et.second}`;
        };

        if (p) {
            // Tithi
            if (p.tithi) {
                result.tithi.push({
                    name: p.tithi.details?.tithi_name || p.tithi.details,
                    endTime: formatEndTime(p.tithi.end_time)
                });
            }

            // Nakshatra
            if (p.nakshatra) {
                result.nakshatra.push({
                    name: p.nakshatra.details?.nak_name || p.nakshatra.details,
                    endTime: formatEndTime(p.nakshatra.end_time)
                });
            }

            // Yoga
            if (p.yog) {
                result.yoga.push({
                    name: p.yog.details?.yog_name || p.yog.details,
                    endTime: formatEndTime(p.yog.end_time)
                });
            }

            // Karana
            if (p.karan) {
                result.karana.push({
                    name: p.karan.details?.karan_name || p.karan.details,
                    endTime: formatEndTime(p.karan.end_time)
                });
            }
        }

        // Save to cache
        let cache: Cache = {};
        if (fs.existsSync(CACHE_FILE)) {
            try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch { }
        }
        cache[dateKey] = result;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`Saved to ${CACHE_FILE}`);

        return result;

    } catch (e) {
        console.error(e);
        return null;
    }
}

if (require.main === module) {
    extractVedicRishiData().then(obj => console.log(JSON.stringify(obj, null, 2)));
}
