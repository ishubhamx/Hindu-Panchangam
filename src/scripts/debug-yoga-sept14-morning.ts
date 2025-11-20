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
    const progressDegrees = totalLongitude - (yoga * yogaWidth);
    
    console.log(`${DateTime.fromJSDate(date).setZone(tz).toFormat("dd-MMM-yyyy HH:mm:ss")}`);
    console.log(`  Total: ${totalLongitude.toFixed(6)}°`);
    console.log(`  Yoga: ${yogaNames[yoga]} (${yoga})`);
    console.log(`  Progress in current yoga: ${progressDegrees.toFixed(6)}° / ${yogaWidth.toFixed(4)}°`);
    console.log(`  Next yoga boundary at: ${((yoga + 1) * yogaWidth).toFixed(6)}°`);
    console.log();
}

console.log("=== Checking Sept 14 around 7-8 AM (Vajra -> Siddhi transition) ===\n");

// Check every 5 minutes from 7:00 to 8:00 AM
for (let minute = 0; minute <= 60; minute += 5) {
    const date = new Date("2025-09-14T01:30:00Z"); // 7:00 AM IST in UTC
    date.setMinutes(date.getMinutes() + minute);
    checkYogaAtTime(date);
}
