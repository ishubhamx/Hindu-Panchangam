import { getPanchangam, tithiNames, nakshatraNames, yogaNames } from "../index";
import { Observer } from "astronomy-engine";
import { DateTime } from "luxon";

const tz = "Asia/Kolkata";
const date = new Date("2025-09-14");
const observer = new Observer(17.385, 78.4867, 550); // Hyderabad

const p = getPanchangam(date, observer);

function formatDateTime(date: Date | null, tz: string): string {
    if (!date) return "N/A";
    return DateTime.fromJSDate(date).setZone(tz).toFormat("dd-MMM-yyyy hh:mm a");
}

console.log("=== Panchangam-JS Output (Hyderabad, 14-Sep-2025) ===");
console.log({
    tithi: tithiNames[p.tithi],
    tithiEnd: formatDateTime(p.tithiEndTime, tz),
    nakshatra: nakshatraNames[p.nakshatra],
    nakshatraEnd: formatDateTime(p.nakshatraEndTime, tz),
    yoga: yogaNames[p.yoga],
    yogaEnd: formatDateTime(p.yogaEndTime, tz),
    karana: p.karana,
    sunrise: formatDateTime(p.sunrise, tz),
    sunset: formatDateTime(p.sunset, tz),
    moonrise: formatDateTime(p.moonrise, tz),
    moonset: formatDateTime(p.moonset, tz),
    rahuStart: formatDateTime(p.rahuKalamStart, tz),
    rahuEnd: formatDateTime(p.rahuKalamEnd, tz),
});

console.log("\n=== Expected (Drik Panchang) ===");
console.log({
    tithi: "Ashtami till 15-Sep 03:06 AM, then Navami",
    nakshatra: "Rohini till 14-Sep 08:41 AM, then Mrigashira",
    yoga: "Vajra till 15-Sep 07:35 AM, then Siddhi, then Vyatipata",
    karana: "Balava till 14-Sep 04:02 PM, then Kaulava till 15-Sep 03:06 AM, then Taitila",
    sunrise: "06:04 AM",
    sunset: "06:19 PM",
    moonrise: "11:44 PM",
    moonset: "12:35 PM",
    rahuKalam: "04:30 PM – 06:00 PM (Sunday convention)"
});

console.log("\n=== Karana Transitions ===");
p.karanaTransitions.forEach((kt) => {
    console.log(`  ${kt.name} until ${formatDateTime(kt.endTime, tz)}`);
});

console.log("\n=== Nakshatra Transitions ===");
p.nakshatraTransitions.forEach((nt) => {
    console.log(`  ${nt.name} until ${formatDateTime(nt.endTime, tz)}`);
});

console.log("\n=== Yoga Transitions ===");
p.yogaTransitions.forEach((yt) => {
    console.log(`  ${yt.name} until ${formatDateTime(yt.endTime, tz)}`);
});
