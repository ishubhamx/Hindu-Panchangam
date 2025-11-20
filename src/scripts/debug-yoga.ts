import { getPanchangam, yogaNames } from "../index";
import { Observer } from "astronomy-engine";
import { DateTime } from "luxon";

const tz = "Asia/Kolkata";
const date = new Date("2025-09-14");
const observer = new Observer(17.385, 78.4867, 550); // Hyderabad

const p = getPanchangam(date, observer);

console.log("=== Yoga Analysis for Hyderabad, 14-Sep-2025 ===");
console.log(`Current Yoga at sunrise: ${yogaNames[p.yoga]}`);
console.log(`Yoga End Time: ${p.yogaEndTime ? DateTime.fromJSDate(p.yogaEndTime).setZone(tz).toFormat("dd-MMM-yyyy hh:mm a") : "N/A"}`);
console.log("\nYoga Transitions:");
p.yogaTransitions.forEach((yt) => {
    console.log(`  ${yt.name} until ${DateTime.fromJSDate(yt.endTime).setZone(tz).toFormat("dd-MMM-yyyy hh:mm a")}`);
});

console.log("\n=== Expected from Drik Panchang ===");
console.log("Vajra till 15-Sep 07:35 AM, then Siddhi, then Vyatipata");
