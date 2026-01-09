
import { getPanchangam, nakshatraNames } from '../src/index';
import { Observer } from 'astronomy-engine';
import * as fs from 'fs';
import * as path from 'path';

// Bangalore Coordinates
const OBSERVER = new Observer(12.9716, 77.5946, 920);
const CACHE_FILE = path.resolve(__dirname, 'drik-cache.json');

// Interface for Cache (Matching the structure in extract-drik.ts)
interface DrikData {
    date: string;
    tithi: { name: string; endTime: string };
    nakshatra: { name: string; endTime: string };
    amritKalam: string[] | string;
    varjyam: string[] | string;
}

interface Cache {
    [key: string]: DrikData;
}

function parseDrikTime(timeStr: string | null): number {
    if (!timeStr) return NaN;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const mer = match[3] ? match[3].toUpperCase() : null;

        if (mer === 'PM' && h < 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;

        return h * 60 + m;
    }
    return NaN;
}

/**
 * Calculates what Ghati would produce the observed Drik time.
 * Observed Time = Start + (Ghati / 60) * Duration
 * Ghati = (Observed - Start) / Duration * 60
 */
function calculateGhatis(nakStart: Date, nakEnd: Date, observedDrikStr: string): number {
    const nakDurationMs = nakEnd.getTime() - nakStart.getTime();

    // Parse observed time relative to Nakshatra Day
    const parts = observedDrikStr.split(' to ');
    if (parts.length < 1) return NaN;

    const startStr = parts[0]; // "02:14 PM"

    // We need to convert startStr to a specific Date timestamp close to nakStart
    // The Drik string doesn't have a date (usually).
    // Or it might be "hh:mm AM, MMM DD".

    // Helper to get timestamp from HH:MM string given a reference date (nakStart)
    const getTimestamp = (timeStr: string, refDate: Date): number => {
        const minOfDay = parseDrikTime(timeStr);
        if (isNaN(minOfDay)) return NaN;

        const d = new Date(refDate);
        d.setHours(0, 0, 0, 0);
        d.setMinutes(minOfDay);

        // Adjust date if necessary. 
        // If minOfDay < refDate's minOfDay - 12h, maybe next day?
        // Safer: Find date that puts observed time STRICTLY between NakStart and NakEnd
        // But Muhurta start must be between NakStart and NakEnd (mostly).

        // Let's try current day, next day, prev day
        const candidates = [-1, 0, 1, 2].map(offset => {
            const t = new Date(d);
            t.setDate(t.getDate() + offset);
            return t.getTime();
        });

        // Find candidate closest to nakStart + something?
        // Ideally: nakStart <= T <= nakEnd.
        // But start can be anywhere.

        // Pick candidate that is >= nakStart and < nakEnd
        // BUT wait, Amrit Kalam can be *after* nakshatra end? No, it's a portion OF the nakshatra.
        // So it MUST be within [start, end].

        const valid = candidates.find(t => t >= nakStart.getTime() && t <= nakEnd.getTime());
        return valid || NaN;
    };

    const obsTime = getTimestamp(startStr, nakStart);
    if (isNaN(obsTime)) {
        // Try parsing date if available in string
        // "05:04 AM, Jan 27"
        if (startStr.includes(',')) {
            // Let's trust verify_snippet logic or simple parsing if we can...
            // For now return NaN if complex
            return NaN;
        }
        return NaN;
    }

    const deltaMs = obsTime - nakStart.getTime();
    if (deltaMs < 0) return NaN; // Should be impossible if logic above correct

    // Ghati = (DeltaMs / DurationMs) * 60
    return (deltaMs / nakDurationMs) * 60;
}

function runOptimization() {
    if (!fs.existsSync(CACHE_FILE)) {
        console.log("No cache found.");
        return;
    }
    const cache: Cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));

    // Storage for observations: map[NakshatraIndex] -> Ghati[]
    const amritObservations: { [key: number]: number[] } = {};
    const varjyamObservations: { [key: number]: number[] } = {};

    for (const key of Object.keys(cache)) {
        const item = cache[key];
        // Parse date
        const [d, m, y] = item.date.split('/');
        const date = new Date(`${y}-${m}-${d}T12:00:00+05:30`);

        const p = getPanchangam(date, OBSERVER);

        // We only care about the Nakshatra currently active at Noon?
        // Drik returns Amrit/Varjyam likely for that Nakshatra OR the next one overlapping the day.
        // Drik might return multiple.

        // Strategy: For the calculated Nakshatra (p.nakshatra), check if any Drik Amrit/Varjyam aligns with it.

        if (!p.nakshatraStartTime || !p.nakshatraEndTime) continue;

        const process = (drikVal: any, storage: { [key: number]: number[] }) => {
            if (!drikVal) return;
            let ranges: string[] = [];

            if (Array.isArray(drikVal)) {
                ranges = drikVal;
            } else if (typeof drikVal === 'string') {
                ranges = [drikVal];
            }

            for (const range of ranges) {
                const ghati = calculateGhatis(p.nakshatraStartTime!, p.nakshatraEndTime!, range);
                if (!isNaN(ghati)) {
                    if (!storage[p.nakshatra]) storage[p.nakshatra] = [];
                    storage[p.nakshatra].push(ghati);
                    // console.log(`Found Ghati for ${nakshatraNames[p.nakshatra]}: ${ghati.toFixed(2)}`);
                }
            }
        };

        process(item.amritKalam, amritObservations);
        process(item.varjyam, varjyamObservations);
    }

    // Calculate Mode/Median for each Nakshatra
    const getConsensus = (arr: number[]) => {
        if (!arr || arr.length === 0) return null;
        // Round to nearest integer or 0.5? Usually integers in texts.
        // Let's round to 1 decimal place.
        const rounded = arr.map(n => Math.round(n * 10) / 10);

        // Mode
        const counts: { [k: number]: number } = {};
        rounded.forEach(n => counts[n] = (counts[n] || 0) + 1);

        let mode = rounded[0];
        let maxCount = 0;
        for (const k in counts) {
            if (counts[k] > maxCount) {
                maxCount = counts[k];
                mode = parseFloat(k);
            }
        }
        return mode;
    };

    console.log("--- Varjyam Constants (Observed) ---");
    const newVarjyam: number[] = new Array(27).fill(0);
    for (let i = 0; i < 27; i++) {
        const obs = varjyamObservations[i];
        if (obs) {
            const val = getConsensus(obs);
            newVarjyam[i] = val || 0;
            console.log(`${nakshatraNames[i]} (${i}): ${val} (Count: ${obs.length})`);
        } else {
            console.log(`${nakshatraNames[i]} (${i}): No data`);
        }
    }

    console.log("\n--- Amrit Kalam Constants (Observed) ---");
    const newAmrit: number[] = new Array(27).fill(0);
    for (let i = 0; i < 27; i++) {
        const obs = amritObservations[i];
        if (obs) {
            const val = getConsensus(obs);
            newAmrit[i] = val || 0;
            console.log(`${nakshatraNames[i]} (${i}): ${val} (Count: ${obs.length})`);
        } else {
            console.log(`${nakshatraNames[i]} (${i}): No data`);
        }
    }

    console.log("\nCopy these arrays to constants.ts if they look complete.");
}

runOptimization();
