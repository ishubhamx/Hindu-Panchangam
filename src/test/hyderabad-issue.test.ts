/**
 * Test for Issue: Discrepancies between Panchangam-JS output and Drik Panchang
 * Location: Hyderabad, India (17.385°N, 78.4867°E, elev 550m)
 * Date: 14-Sep-2025
 * 
 * This test verifies that the library correctly uses Lahiri ayanamsa
 * for sidereal calculations, matching Drik Panchang output.
 */

import { getPanchangam, tithiNames, nakshatraNames, yogaNames } from "../index";
import { Observer } from "astronomy-engine";

interface TestResult {
    passed: boolean;
    message: string;
}

function testHyderabadCase(): void {
    console.log("🧪 TESTING HYDERABAD CASE (14-Sep-2025)");
    console.log("=" .repeat(60));
    
    const date = new Date("2025-09-14");
    const observer = new Observer(17.385, 78.4867, 550); // Hyderabad
    const p = getPanchangam(date, observer);
    
    const results: TestResult[] = [];
    
    // Test Tithi
    const expectedTithi = "Ashtami";
    const actualTithi = tithiNames[p.tithi];
    results.push({
        passed: actualTithi === expectedTithi,
        message: `Tithi: ${actualTithi} (expected: ${expectedTithi})`
    });
    
    // Test Nakshatra - should be Rohini, not Ardra (which was the bug)
    const expectedNakshatra = "Rohini";
    const actualNakshatra = nakshatraNames[p.nakshatra];
    results.push({
        passed: actualNakshatra === expectedNakshatra,
        message: `Nakshatra: ${actualNakshatra} (expected: ${expectedNakshatra})`
    });
    
    // Test Yoga - should be Vajra, not Parigha (which was the bug)
    const expectedYoga = "Vajra";
    const actualYoga = yogaNames[p.yoga];
    results.push({
        passed: actualYoga === expectedYoga,
        message: `Yoga: ${actualYoga} (expected: ${expectedYoga})`
    });
    
    // Test Karana
    const expectedKarana = "Balava";
    const actualKarana = p.karana;
    results.push({
        passed: actualKarana === expectedKarana,
        message: `Karana: ${actualKarana} (expected: ${expectedKarana})`
    });
    
    // Test Nakshatra end time (should be around 08:40-08:41 AM)
    if (p.nakshatraEndTime) {
        const nakshatraEndHour = p.nakshatraEndTime.getHours();
        const nakshatraEndMinute = p.nakshatraEndTime.getMinutes();
        const endTimeCorrect = nakshatraEndHour === 3 && nakshatraEndMinute >= 10 && nakshatraEndMinute <= 11;
        // Note: Time is in UTC, IST is UTC+5:30, so 08:40 IST = 03:10 UTC
        results.push({
            passed: endTimeCorrect,
            message: `Nakshatra end time: ${p.nakshatraEndTime.toISOString()} (expected around 08:40-08:41 IST)`
        });
    } else {
        results.push({
            passed: false,
            message: "Nakshatra end time: null (should have a value)"
        });
    }
    
    // Test Nakshatra transitions
    if (p.nakshatraTransitions && p.nakshatraTransitions.length >= 2) {
        const firstNakshatra = p.nakshatraTransitions[0].name;
        const secondNakshatra = p.nakshatraTransitions[1].name;
        const correctTransition = firstNakshatra === "Rohini" && secondNakshatra === "Mrigashira";
        results.push({
            passed: correctTransition,
            message: `Nakshatra transitions: ${firstNakshatra} → ${secondNakshatra} (expected: Rohini → Mrigashira)`
        });
    } else {
        results.push({
            passed: false,
            message: "Nakshatra transitions: insufficient data"
        });
    }
    
    // Test Yoga transitions
    if (p.yogaTransitions && p.yogaTransitions.length >= 2) {
        const firstYoga = p.yogaTransitions[0].name;
        const secondYoga = p.yogaTransitions[1].name;
        const correctTransition = firstYoga === "Vajra" && secondYoga === "Siddhi";
        results.push({
            passed: correctTransition,
            message: `Yoga transitions: ${firstYoga} → ${secondYoga} (expected: Vajra → Siddhi)`
        });
    } else {
        results.push({
            passed: false,
            message: "Yoga transitions: insufficient data"
        });
    }
    
    // Print results
    console.log("\n📊 Test Results:");
    console.log("-".repeat(60));
    let allPassed = true;
    for (const result of results) {
        const icon = result.passed ? "✅" : "❌";
        console.log(`${icon} ${result.message}`);
        if (!result.passed) allPassed = false;
    }
    
    console.log("\n" + "=".repeat(60));
    if (allPassed) {
        console.log("🎯 ALL TESTS PASSED");
        console.log("✨ Lahiri ayanamsa correction is working correctly!");
    } else {
        console.log("❌ SOME TESTS FAILED");
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testHyderabadCase();
}

export { testHyderabadCase };
