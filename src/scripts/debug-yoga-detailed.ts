import { Body, GeoVector, Ecliptic as EclipticFunc } from "astronomy-engine";
import { tropicalToSidereal } from "../ayanamsa";
import { yogaNames } from "../panchangam";
import { DateTime } from "luxon";

const tz = "Asia/Kolkata";

function getYoga(sunLon: number, moonLon: number): number {
    const totalLongitude = sunLon + moonLon;
    return Math.floor(totalLongitude / (13 + 1/3)) % 27;
}

function checkYogaAtTime(dateStr: string, hour: number): void {
    const date = new Date(dateStr);
    date.setHours(hour, 0, 0, 0);
    
    const sunVector = GeoVector(Body.Sun, date, true);
    const moonVector = GeoVector(Body.Moon, date, true);
    
    const sunEcliptic = EclipticFunc(sunVector);
    const moonEcliptic = EclipticFunc(moonVector);
    
    const sunSidereal = tropicalToSidereal(sunEcliptic.elon, date);
    const moonSidereal = tropicalToSidereal(moonEcliptic.elon, date);
    
    const totalLongitude = sunSidereal + moonSidereal;
    const yoga = getYoga(sunSidereal, moonSidereal);
    
    console.log(`\n${DateTime.fromJSDate(date).setZone(tz).toFormat("dd-MMM-yyyy HH:mm")}`);
    console.log(`  Sun Sidereal: ${sunSidereal.toFixed(4)}°`);
    console.log(`  Moon Sidereal: ${moonSidereal.toFixed(4)}°`);
    console.log(`  Total: ${totalLongitude.toFixed(4)}°`);
    console.log(`  Yoga: ${yogaNames[yoga]} (${yoga})`);
}

console.log("=== Yoga Detailed Analysis ===");
console.log("Checking yoga at different times on Sept 14 & 15, 2025");

// Check Sept 14 at various times
checkYogaAtTime("2025-09-14", 0);
checkYogaAtTime("2025-09-14", 6);
checkYogaAtTime("2025-09-14", 7);
checkYogaAtTime("2025-09-14", 8);
checkYogaAtTime("2025-09-14", 12);

// Check Sept 15 at various times  
checkYogaAtTime("2025-09-15", 0);
checkYogaAtTime("2025-09-15", 6);
checkYogaAtTime("2025-09-15", 7);
checkYogaAtTime("2025-09-15", 8);
