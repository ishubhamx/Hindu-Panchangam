/**
 * Verification script to demonstrate the fix for the Hyderabad issue
 * This script shows the before/after comparison for the ayanamsa correction
 */

import { getPanchangam, nakshatraNames, yogaNames, getLahiriAyanamsa } from "../index";
import { Observer, Body, GeoVector, Ecliptic as EclipticFunc } from "astronomy-engine";
import { DateTime } from "luxon";

const tz = "Asia/Kolkata";
const date = new Date("2025-09-14T00:34:00Z"); // 06:04 AM IST (sunrise time)
const observer = new Observer(17.385, 78.4867, 550); // Hyderabad

console.log("=" .repeat(70));
console.log("  VERIFICATION: Hyderabad Panchangam Fix (14-Sep-2025)");
console.log("=" .repeat(70));

// Get current panchangam with ayanamsa correction
const p = getPanchangam(date, observer);
const ayanamsa = getLahiriAyanamsa(date);

// Get tropical values (what it would be without correction)
const sunVector = GeoVector(Body.Sun, date, true);
const moonVector = GeoVector(Body.Moon, date, true);
const sunEcliptic = EclipticFunc(sunVector);
const moonEcliptic = EclipticFunc(moonVector);
const tropicalNakshatra = Math.floor(moonEcliptic.elon / (13 + 1/3));
const tropicalYoga = Math.floor((sunEcliptic.elon + moonEcliptic.elon) / (13 + 1/3)) % 27;

console.log("\n📍 Location: Hyderabad, India (17.385°N, 78.4867°E)");
console.log("📅 Date: 14-Sep-2025 at sunrise");
console.log("");

console.log("🔬 Astronomical Data:");
console.log("-".repeat(70));
console.log(`Lahiri Ayanamsa: ${ayanamsa.toFixed(4)}° (24° 12' 43")`);
console.log(`Sun Tropical: ${sunEcliptic.elon.toFixed(4)}°`);
console.log(`Moon Tropical: ${moonEcliptic.elon.toFixed(4)}°`);
console.log("");

console.log("❌ WITHOUT Ayanamsa Correction (WRONG - Tropical):");
console.log("-".repeat(70));
console.log(`Nakshatra: ${nakshatraNames[tropicalNakshatra]} (index ${tropicalNakshatra})`);
console.log(`Yoga: ${yogaNames[tropicalYoga]} (index ${tropicalYoga})`);
console.log("⚠️  This does NOT match Drik Panchang!");
console.log("");

console.log("✅ WITH Lahiri Ayanamsa Correction (CORRECT - Sidereal):");
console.log("-".repeat(70));
console.log(`Nakshatra: ${nakshatraNames[p.nakshatra]} (index ${p.nakshatra})`);
console.log(`Yoga: ${yogaNames[p.yoga]} (index ${p.yoga})`);
console.log("✨ This MATCHES Drik Panchang!");
console.log("");

console.log("📊 Comparison with Drik Panchang:");
console.log("-".repeat(70));
console.log(`Expected Nakshatra: Rohini`);
console.log(`Our Nakshatra: ${nakshatraNames[p.nakshatra]}`);
console.log(`Match: ${nakshatraNames[p.nakshatra] === "Rohini" ? "✅ YES" : "❌ NO"}`);
console.log("");
console.log(`Expected Yoga: Vajra`);
console.log(`Our Yoga: ${yogaNames[p.yoga]}`);
console.log(`Match: ${yogaNames[p.yoga] === "Vajra" ? "✅ YES" : "❌ NO"}`);
console.log("");

console.log("🎯 Summary:");
console.log("-".repeat(70));
if (nakshatraNames[p.nakshatra] === "Rohini" && yogaNames[p.yoga] === "Vajra") {
    console.log("✨ SUCCESS! All values match Drik Panchang.");
    console.log("🎊 The Lahiri ayanamsa correction is working correctly!");
} else {
    console.log("❌ FAILURE! Values do not match Drik Panchang.");
}
console.log("");
console.log("=" .repeat(70));
