
import { getPanchangam } from '../src/core/panchangam';
import { Observer } from 'astronomy-engine';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_FILE = path.resolve(__dirname, 'vedicrishi-cache.json');

// Helper to parse "HH:MM:SS" (potentially > 24h) to Date
function parseVedicTime(dateStr: string, timeStr: string): Date {
    const parts = timeStr.split(':').map(Number);
    let hours = parts[0];
    const minutes = parts[1];
    const seconds = parts[2] || 0;

    const baseDate = new Date(dateStr + 'T00:00:00+05:30'); // Assume IST

    // Add hours
    baseDate.setHours(baseDate.getHours() + hours);
    baseDate.setMinutes(baseDate.getMinutes() + minutes);
    baseDate.setSeconds(baseDate.getSeconds() + seconds);

    return baseDate;
}

function timeDiffMinutes(d1: Date, d2: Date): number {
    return Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60);
}

async function verify() {
    if (!fs.existsSync(CACHE_FILE)) {
        console.error("Cache file not found. Run extraction first.");
        return;
    }

    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    // Iterate over dates (likely just one)
    for (const [dateKey, vData] of Object.entries(cache)) {
        const data: any = vData;
        console.log(`Verifying for ${dateKey} (New Delhi)...`);

        // New Delhi Coordinates
        const observer = new Observer(28.6139, 77.2090, 0);
        const date = new Date(dateKey + 'T12:00:00+05:30'); // Midday for calculation context

        const panchangam = await getPanchangam(date, observer);
        const issues: string[] = [];

        // 1. Verify Sunrise
        if (data.sunrise) {
            // Vedic Rishi sunrise is likely "7:13:50"
            // We need to parse it relative to dateKey
            const vrSunrise = parseVedicTime(dateKey, data.sunrise);
            const libSunrise = panchangam.sunrise;

            if (libSunrise) {
                const diff = timeDiffMinutes(vrSunrise, libSunrise);
                if (diff > 4) {
                    issues.push(`Sunrise mismatch: Lib ${libSunrise.getHours()}:${libSunrise.getMinutes()} vs VR ${data.sunrise} (Diff: ${diff.toFixed(1)}m)`);
                } else {
                    console.log(`Sunrise MATCH: Diff ${diff.toFixed(1)}m`);
                }
            } else {
                issues.push("Library sunrise is null");
            }
        }

        // 2. Verify Tithi End Time
        if (data.tithi && data.tithi.length > 0) {
            const vrTithi = data.tithi[0];
            const vrEnd = parseVedicTime(dateKey, vrTithi.endTime);
            const libEnd = panchangam.tithiEndTime;

            if (libEnd) {
                const diff = timeDiffMinutes(vrEnd, libEnd);
                // Tithi timing can vary slightly due to ayanamsa, but standard ayanamsa should be close.
                if (diff > 20) {
                    issues.push(`Tithi End mismatch: Lib ${libEnd.toISOString()} vs VR ${vrTithi.endTime} (Diff: ${diff.toFixed(1)}m)`);
                } else {
                    console.log(`Tithi End MATCH: Diff ${diff.toFixed(1)}m`);
                }
            }
        }

        // 3. Verify Nakshatra End Time
        if (data.nakshatra && data.nakshatra.length > 0) {
            const vrNak = data.nakshatra[0];
            const vrEnd = parseVedicTime(dateKey, vrNak.endTime);
            const libEnd = panchangam.nakshatraEndTime;

            if (libEnd) {
                const diff = timeDiffMinutes(vrEnd, libEnd);
                if (diff > 20) {
                    issues.push(`Nakshatra End mismatch: Lib ${libEnd.toISOString()} vs VR ${vrNak.endTime} (Diff: ${diff.toFixed(1)}m)`);
                } else {
                    console.log(`Nakshatra End MATCH: Diff ${diff.toFixed(1)}m`);
                }
            }
        }

        if (issues.length === 0) {
            console.log(`✅ ${dateKey}: All checks PASSED`);
        } else {
            console.error(`❌ ${dateKey}: ${issues.length} Issues Found`);
            issues.forEach(i => console.error(`  - ${i}`));
        }
    }
}

verify().catch(console.error);
