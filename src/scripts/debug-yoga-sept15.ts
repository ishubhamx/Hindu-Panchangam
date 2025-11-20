import { Body, GeoVector, Ecliptic as EclipticFunc } from "astronomy-engine";
import { tropicalToSidereal } from "../ayanamsa";
import { yogaNames } from "../panchangam";
import { DateTime } from "luxon";

const tz = "Asia/Kolkata";

function getYoga(sunLon: number, moonLon: number): number {
    const totalLongitude = sunLon + moonLon;
    return Math.floor(totalLongitude / (13 + 1/3)) % 27;
}

function checkYogaAtTime(date: Date): void {
    const sunVector = GeoVector(Body.Sun, date, true);
    const moonVector = GeoVector(Body.Moon, date, true);
    
    const sunEcliptic = EclipticFunc(sunVector);
    const moonEcliptic = EclipticFunc(moonVector);
    
    const sunSidereal = tropicalToSidereal(sunEcliptic.elon, date);
    const moonSidereal = tropicalToSidereal(moonEcliptic.elon, date);
    
    const totalLongitude = sunSidereal + moonSidereal;
    const yoga = getYoga(sunSidereal, moonSidereal);
    
    const yogaWidth = 13 + 1/3;
    const yogaBoundary = (yoga + 1) * yogaWidth;
    const progressDegrees = totalLongitude % 360 - (yoga * yogaWidth);
    
    console.log(`${DateTime.fromJSDate(date).setZone(tz).toFormat("dd-MMM-yyyy HH:mm")}`);
    console.log(`  Total: ${totalLongitude.toFixed(4)}° (mod 360: ${(totalLongitude % 360).toFixed(4)}°)`);
    console.log(`  Yoga: ${yogaNames[yoga]} (${yoga}), Next boundary: ${yogaBoundary.toFixed(4)}°`);
    console.log(`  Progress: ${progressDegrees.toFixed(4)}° / ${yogaWidth.toFixed(4)}°`);
    console.log();
}

console.log("=== Checking around Sept 15 7-8 AM ===\n");

// Check Sept 15 around 7-8 AM
for (let minute = 0; minute <= 60; minute += 10) {
    const date = new Date("2025-09-15T01:30:00Z"); // 7:00 AM IST
    date.setMinutes(date.getMinutes() + minute);
    checkYogaAtTime(date);
}
