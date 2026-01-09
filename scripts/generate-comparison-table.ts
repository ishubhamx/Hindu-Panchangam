import { getPanchangam } from '../src';
import { tithiNames, nakshatraNames, yogaNames } from '../src/core/constants';
import { Observer } from 'astronomy-engine';
import * as fs from 'fs';
import * as path from 'path';

// Location config matching Drik Bangalore (1277333)
// 12.9716 N, 77.5946 E
const location = {
    latitude: 12.9716,
    longitude: 77.5946,
    name: "Bangalore, India",
    height: 0
};

const observer = new Observer(location.latitude, location.longitude, location.height);

const cachePath = path.join(__dirname, 'drik-cache.json');
const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

// Pick a date from cache.
const locationId = "1277333";
const dateStr = "06/01/2025"; // DD/MM/YYYY
const cacheKey = `${locationId}_${dateStr}`;
const drikData = cache[cacheKey];

if (!drikData) {
    console.error(`No data found in cache for ${cacheKey}`);
    process.exit(1);
}

// Parse date
const [day, month, year] = dateStr.split('/').map(Number);
const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
date.setHours(6, 0, 0, 0);

const p = getPanchangam(date, observer);

// Helpers
function formatTime(d: Date | string | null | undefined): string {
    if (!d) return "N/A";
    if (typeof d === 'string') return d;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function parseDrikTime(timeStr: string | undefined | null): string {
    if (!timeStr || timeStr === 'None') return 'N/A';
    return timeStr;
}

function diffMinutes(d1: Date | null | undefined, drikTimeStr: string | undefined | null): string {
    if (!d1 || !drikTimeStr || drikTimeStr === 'None') return '-';

    const parts = drikTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!parts) return '?';

    let hours = parseInt(parts[1]);
    const minutes = parseInt(parts[2]);
    const period = parts[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // We construct a local date for Drik time, assuming same day as d1 initially
    const drikDate = new Date(d1);
    drikDate.setHours(hours, minutes, 0, 0);

    let diffMs = d1.getTime() - drikDate.getTime();

    // If diff is huge (> 12 hours), try shifting drikDate by +- 24h
    if (diffMs > 12 * 60 * 60 * 1000) {
        drikDate.setDate(drikDate.getDate() + 1);
        diffMs = d1.getTime() - drikDate.getTime();
    } else if (diffMs < -12 * 60 * 60 * 1000) {
        drikDate.setDate(drikDate.getDate() - 1);
        diffMs = d1.getTime() - drikDate.getTime();
    }

    const diffMins = Math.round(diffMs / 60000);
    if (diffMins === 0) return "✅ 0m";
    return `${diffMins > 0 ? '+' : ''}${diffMins}m`;
}

// Table Rows
const rows = [
    ["Sunrise", formatTime(p.sunrise), parseDrikTime(drikData.sunrise), diffMinutes(p.sunrise, drikData.sunrise)],
    ["Sunset", formatTime(p.sunset), parseDrikTime(drikData.sunset), diffMinutes(p.sunset, drikData.sunset)],
    ["Moonrise", formatTime(p.moonrise), parseDrikTime(drikData.moonrise), diffMinutes(p.moonrise, drikData.moonrise)],
    ["Tithi", tithiNames[p.tithi], drikData.tithi.name, drikData.tithi.name && tithiNames[p.tithi].includes(drikData.tithi.name.split(' ')[0]) ? "✅" : tithiNames[p.tithi] + " vs " + drikData.tithi.name],
    ["Tithi End", formatTime(p.tithiEndTime), parseDrikTime(drikData.tithi.endTime), diffMinutes(p.tithiEndTime, drikData.tithi.endTime)],
    ["Nakshatra", nakshatraNames[p.nakshatra], drikData.nakshatra.name, nakshatraNames[p.nakshatra] === drikData.nakshatra.name ? "✅" : nakshatraNames[p.nakshatra] + " vs " + drikData.nakshatra.name],
    ["Nakshatra End", formatTime(p.nakshatraEndTime), parseDrikTime(drikData.nakshatra.endTime), diffMinutes(p.nakshatraEndTime, drikData.nakshatra.endTime)],
    ["Yoga", yogaNames[p.yoga], drikData.yoga.name, yogaNames[p.yoga] === drikData.yoga.name ? "✅" : yogaNames[p.yoga] + " vs " + drikData.yoga.name],
    ["Yoga End", formatTime(p.yogaEndTime), parseDrikTime(drikData.yoga.endTime), diffMinutes(p.yogaEndTime, drikData.yoga.endTime)],
    ["Karana", p.karana, drikData.karana.name, p.karana === drikData.karana.name || drikData.karana.name.includes(p.karana) ? "✅" : p.karana + " vs " + drikData.karana.name],
    ["Karana End", "-", parseDrikTime(drikData.karana.endTime), "-"],
    ["Rahu Kalam Start", formatTime(p.rahuKalamStart), parseDrikTime(drikData.rahuKalam?.split(' to ')[0]), diffMinutes(p.rahuKalamStart, drikData.rahuKalam?.split(' to ')[0])],
    //["Yamaganda Start", formatTime(p.yamagandaKalam?.start), parseDrikTime(drikData.yamaganda?.split(' to ')[0]), diffMinutes(p.yamagandaKalam?.start, drikData.yamaganda?.split(' to ')[0])],
    //["Gulika Start", formatTime(p.gulikaKalam?.start), parseDrikTime(drikData.gulika?.split(' to ')[0]), diffMinutes(p.gulikaKalam?.start, drikData.gulika?.split(' to ')[0])],
    ["Abhijit Start", formatTime(p.abhijitMuhurta?.start), parseDrikTime(drikData.abhijit?.split(' to ')[0]), diffMinutes(p.abhijitMuhurta?.start, drikData.abhijit?.split(' to ')[0])],
];

const drikAmrit = Array.isArray(drikData.amritKalam) ? drikData.amritKalam[0] : drikData.amritKalam;
const drikVarjyam = Array.isArray(drikData.varjyam) ? drikData.varjyam[0] : drikData.varjyam;

const drikAmritStart = drikAmrit?.split(' to ')[0];
const drikVarjyamStart = drikVarjyam?.split(' to ')[0];

rows.push(["Amrit Kalam Start", p.amritKalam.length > 0 ? formatTime(p.amritKalam[0].start) : 'N/A', parseDrikTime(drikAmritStart), diffMinutes(p.amritKalam.length > 0 ? p.amritKalam[0].start : null, drikAmritStart)]);
rows.push(["Varjyam Start", p.varjyam.length > 0 ? formatTime(p.varjyam[0].start) : 'N/A', parseDrikTime(drikVarjyamStart), diffMinutes(p.varjyam.length > 0 ? p.varjyam[0].start : null, drikVarjyamStart)]);

console.log(`### Head-to-Head: ${dateStr} (Bangalore)\n`);
console.log(`| Field | Library Value | Drik Value | Diff |`);
console.log(`|---|---|---|---|`);
rows.forEach(row => {
    console.log(`| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |`);
});
