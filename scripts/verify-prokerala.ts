
import * as fs from 'fs';
import * as path from 'path';
import { getPanchangam } from '../src/core/panchangam';
import { Observer } from 'astronomy-engine';
import { Panchangam } from '../src/core/types';

// Ujjain Coordinates (Standard)
const UJJAIN_LAT = 23.1765;
const UJJAIN_LON = 75.7885;

const CACHE_FILE = path.resolve(__dirname, 'prokerala-cache.json');

interface ProkeralaData {
    date: string;
    sunrise: string | null;
    tithi: { name: string; endTime: string }[];
    nakshatra: { name: string; endTime: string }[];
    yoga: { name: string; endTime: string }[];
    karana: { name: string; endTime: string }[];
}

interface ValidationResult {
    date: string;
    status: 'PASS' | 'FAIL';
    details: string[];
}

function parseProkeralaTime(dateStr: string, currentYear: number): Date | null {
    // Regex for "MMM DD hh:mm A"
    const re = /([A-Za-z]{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s+([AP]M)/;
    const match = dateStr.match(re);
    if (!match) return null;

    const [_, mon, day, hh, mm, ap] = match;
    const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    let hour = parseInt(hh, 10);
    if (ap === 'PM' && hour !== 12) hour += 12;
    if (ap === 'AM' && hour === 12) hour = 0;

    return new Date(currentYear, months[mon], parseInt(day, 10), hour, parseInt(mm, 10), 0);
}

function timeDiffMinutes(d1: Date, d2: Date): number {
    return Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60);
}

async function verify() {
    if (!fs.existsSync(CACHE_FILE)) {
        console.log("No cache found. Run extract-prokerala.ts first.");
        return;
    }

    const cache: { [key: string]: ProkeralaData } = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const results: ValidationResult[] = [];

    // Using 0 alt for generic check
    const observer = new Observer(UJJAIN_LAT, UJJAIN_LON, 0);

    console.log(`Verifying against Prokerala Data (Location: Ujjain)`);

    for (const [dateKey, pData] of Object.entries(cache)) {
        // dateKey: 2025-january-06
        const parts = dateKey.split('-');
        const year = parseInt(parts[0]);
        const monthIdx = new Date(Date.parse(parts[1] + " 1, " + year)).getMonth();
        const day = parseInt(parts[2]);

        const date = new Date(year, monthIdx, day, 12, 0, 0);

        // Get Panchangam
        const panchangam = await getPanchangam(date, observer);

        const issues: string[] = [];

        // 1. Verify Sunrise 
        if (pData.sunrise) {
            const [hStr, mStr, ap] = pData.sunrise.split(/[:\s]+/);
            let h = parseInt(hStr);
            const m = parseInt(mStr);
            if (ap === 'PM' && h !== 12) h += 12;

            const pSunrise = new Date(date);
            pSunrise.setHours(h, m, 0, 0); // Set to parsed time

            const lSunrise = panchangam.sunrise;
            if (lSunrise) {
                const diff = timeDiffMinutes(pSunrise, lSunrise);
                if (diff > 4) {
                    // Check if it's the next day's sunrise listed or something?
                    // Usually standard sunrise.
                    issues.push(`Sunrise mismatch: Lib ${lSunrise.getHours()}:${lSunrise.getMinutes()} vs PK ${pData.sunrise} (Diff: ${diff.toFixed(1)}m)`);
                }
            } else {
                issues.push("Library sunrise is null");
            }
        }

        // 2. Verify Tithi End Time
        if (panchangam.tithiEndTime) {
            const libEnd = panchangam.tithiEndTime;
            let minDiff = Infinity;
            let bestMatch = null;

            for (const item of pData.tithi) {
                const times = item.endTime.split(/[–-]/);
                if (times.length > 1) {
                    const endStr = times[1].trim();
                    const pEnd = parseProkeralaTime(endStr, year);
                    if (pEnd) {
                        const diff = timeDiffMinutes(libEnd, pEnd);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestMatch = item;
                        }
                    }
                }
            }

            if (minDiff > 15) {
                issues.push(`Tithi End mismatch: Lib ${libEnd.toISOString()} (Diff: ${minDiff.toFixed(1)}m). Closest PK: ${bestMatch?.name}`);
            }
        }

        // 3. Verify Nakshatra End Time
        if (panchangam.nakshatraEndTime) {
            const libEnd = panchangam.nakshatraEndTime;
            let minDiff = Infinity;
            let bestMatch = null;

            for (const item of pData.nakshatra) {
                const times = item.endTime.split(/[–-]/);
                if (times.length > 1) {
                    const endStr = times[1].trim();
                    const pEnd = parseProkeralaTime(endStr, year);
                    if (pEnd) {
                        const diff = timeDiffMinutes(libEnd, pEnd);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestMatch = item;
                        }
                    }
                }
            }

            if (minDiff > 15) {
                issues.push(`Nakshatra End mismatch: Lib ${libEnd.toISOString()} (Diff: ${minDiff.toFixed(1)}m). Closest PK: ${bestMatch?.name}`);
            }
        }

        const status = issues.length === 0 ? 'PASS' : 'FAIL';
        results.push({ date: dateKey, status, details: issues });

        console.log(`[${status}] ${dateKey}`);
        if (issues.length > 0) {
            issues.forEach(i => console.log(`  - ${i}`));
        }
    }
}

verify();
