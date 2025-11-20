/**
 * Tests for Lahiri Ayanamsa calculations
 * Verifies that ayanamsa values are reasonable and consistent
 */

import { getLahiriAyanamsa, tropicalToSidereal, getAyanamsaInfo } from "../ayanamsa";

function testAyanamsaCalculations(): void {
    console.log("🧪 TESTING LAHIRI AYANAMSA CALCULATIONS");
    console.log("=" .repeat(60));
    
    const testCases = [
        { date: new Date("2000-01-01"), expectedAyanamsa: 23.85, tolerance: 0.1 },
        { date: new Date("2025-01-01"), expectedAyanamsa: 24.19, tolerance: 0.1 },
        { date: new Date("2025-09-14"), expectedAyanamsa: 24.20, tolerance: 0.1 },
        { date: new Date("2050-01-01"), expectedAyanamsa: 24.54, tolerance: 0.1 },
    ];
    
    console.log("\n📊 Ayanamsa Values:");
    console.log("-".repeat(60));
    
    let allPassed = true;
    
    for (const testCase of testCases) {
        const ayanamsa = getLahiriAyanamsa(testCase.date);
        const info = getAyanamsaInfo(testCase.date);
        const passed = Math.abs(ayanamsa - testCase.expectedAyanamsa) < testCase.tolerance;
        
        const icon = passed ? "✅" : "❌";
        console.log(`${icon} ${testCase.date.toISOString().split('T')[0]}: ${ayanamsa.toFixed(4)}° (${info.ayanamsaDMS})`);
        console.log(`   Expected: ~${testCase.expectedAyanamsa}° ± ${testCase.tolerance}°`);
        
        if (!passed) allPassed = false;
    }
    
    // Test tropical to sidereal conversion
    console.log("\n📐 Tropical to Sidereal Conversion:");
    console.log("-".repeat(60));
    
    const date = new Date("2025-09-14");
    const tropicalLongitudes = [0, 30, 60, 90, 180, 270, 359];
    
    for (const tropLon of tropicalLongitudes) {
        const siderealLon = tropicalToSidereal(tropLon, date);
        const ayanamsa = getLahiriAyanamsa(date);
        const expectedSidereal = (tropLon - ayanamsa + 360) % 360;
        const difference = Math.abs(siderealLon - expectedSidereal);
        const passed = difference < 0.001;
        
        const icon = passed ? "✅" : "❌";
        console.log(`${icon} Tropical ${tropLon}° → Sidereal ${siderealLon.toFixed(4)}°`);
        
        if (!passed) allPassed = false;
    }
    
    // Test consistency over time
    console.log("\n⏰ Ayanamsa Change Over Time:");
    console.log("-".repeat(60));
    
    const date1 = new Date("2020-01-01");
    const date2 = new Date("2021-01-01");
    const ayanamsa1 = getLahiriAyanamsa(date1);
    const ayanamsa2 = getLahiriAyanamsa(date2);
    const change = ayanamsa2 - ayanamsa1;
    
    // Should be approximately 50.29 arc-seconds per year = 0.01397 degrees per year
    const expectedChange = 0.01397;
    const changeValid = Math.abs(change - expectedChange) < 0.001;
    
    const icon = changeValid ? "✅" : "❌";
    console.log(`${icon} Change from 2020 to 2021: ${change.toFixed(6)}° (expected: ~${expectedChange}°)`);
    console.log(`   This is ${(change * 3600).toFixed(2)} arc-seconds (expected: ~50.29"`);
    
    if (!changeValid) allPassed = false;
    
    console.log("\n" + "=".repeat(60));
    if (allPassed) {
        console.log("🎯 ALL AYANAMSA TESTS PASSED");
        console.log("✨ Lahiri ayanamsa calculations are accurate!");
    } else {
        console.log("❌ SOME AYANAMSA TESTS FAILED");
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testAyanamsaCalculations();
}

export { testAyanamsaCalculations };
