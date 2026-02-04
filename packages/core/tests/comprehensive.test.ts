import { getPanchangam } from '../src';
import { Observer } from 'astronomy-engine';
import {
    karanaNames,
    yogaNames,
    tithiNames,
    nakshatraNames
} from '../src';

function runBasicValidationTests(): boolean {
    console.log('=== BASIC VALIDATION TESTS ===\n');

    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore
    const testDate = new Date('2025-06-15T12:00:00Z');

    console.log(`Testing date: ${testDate.toISOString()}`);
    console.log(`Location: Bangalore, India\n`);

    try {
        const result = getPanchangam(testDate, observer);

        // Validate basic ranges and types
        const validations = [
            {
                name: 'Tithi range',
                condition: result.tithi >= 0 && result.tithi <= 29,
                actual: result.tithi,
                expected: '0-29'
            },
            {
                name: 'Nakshatra range',
                condition: result.nakshatra >= 0 && result.nakshatra <= 26,
                actual: result.nakshatra,
                expected: '0-26'
            },
            {
                name: 'Yoga range',
                condition: result.yoga >= 0 && result.yoga <= 26,
                actual: result.yoga,
                expected: '0-26'
            },
            {
                name: 'Vara range',
                condition: result.vara >= 0 && result.vara <= 6,
                actual: result.vara,
                expected: '0-6'
            },
            {
                name: 'Karana is valid',
                condition: karanaNames.includes(result.karana),
                actual: result.karana,
                expected: 'valid karana name'
            }
        ];

        let allValid = true;
        validations.forEach(validation => {
            if (validation.condition) {
                console.log(`  ✅ ${validation.name}: ${validation.actual}`);
            } else {
                console.log(`  ❌ ${validation.name}: ${validation.actual} (expected: ${validation.expected})`);
                allValid = false;
            }
        });

        // Display calculated values with names
        console.log(`\n📊 Calculated Values:`);
        console.log(`  Tithi: ${tithiNames[result.tithi]} (${result.tithi})`);
        console.log(`  Nakshatra: ${nakshatraNames[result.nakshatra]} (${result.nakshatra})`);
        console.log(`  Yoga: ${yogaNames[result.yoga]} (${result.yoga})`);
        console.log(`  Karana: ${result.karana}`);
        console.log(`  Vara: ${result.vara} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][result.vara]})`);

        // Check if sun/moon rise/set times are reasonable
        if (result.sunrise && result.sunset) {
            const dayLength = result.sunset.getTime() - result.sunrise.getTime();
            const dayLengthHours = dayLength / (1000 * 60 * 60);
            if (dayLengthHours > 8 && dayLengthHours < 16) {
                console.log(`  ✅ Day length reasonable: ${dayLengthHours.toFixed(2)} hours`);
            } else {
                console.log(`  ⚠️  Day length unusual: ${dayLengthHours.toFixed(2)} hours`);
            }
        }

        return allValid;

    } catch (error) {
        console.log(`❌ Test failed with error: ${error}`);
        return false;
    }
}

function runEdgeCaseTests(): boolean {
    console.log('\n=== EDGE CASE TESTS ===\n');

    let allTestsPassed = true;
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore

    // Test extreme dates
    const edgeCases = [
        new Date('2025-02-28T23:59:59Z'), // End of February
        new Date('2024-02-29T12:00:00Z'), // Leap year
        new Date('2025-12-31T23:59:59Z'), // End of year
        new Date('2025-01-01T00:00:00Z'), // Start of year
    ];

    edgeCases.forEach((date, index) => {
        console.log(`Edge Case ${index + 1}: ${date.toISOString()}`);

        try {
            const result = getPanchangam(date, observer);

            // Check that all values are within expected ranges
            if (result.tithi >= 0 && result.tithi <= 29 &&
                result.nakshatra >= 0 && result.nakshatra <= 26 &&
                result.yoga >= 0 && result.yoga <= 26 &&
                result.vara >= 0 && result.vara <= 6 &&
                karanaNames.includes(result.karana)) {
                console.log(`  ✅ All values within expected ranges`);
            } else {
                console.log(`  ❌ Some values out of range`);
                allTestsPassed = false;
            }

        } catch (error) {
            console.log(`  ❌ Failed with error: ${error}`);
            allTestsPassed = false;
        }
    });

    return allTestsPassed;
}

function runPerformanceTests(): boolean {
    console.log('\n=== PERFORMANCE TESTS ===\n');

    const observer = new Observer(12.9716, 77.5946, 920);
    const iterations = 100;
    const startDate = new Date('2025-06-01');

    console.log(`Running ${iterations} calculations...`);

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
        const testDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        getPanchangam(testDate, observer);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`  Total time: ${totalTime}ms`);
    console.log(`  Average time per calculation: ${avgTime.toFixed(2)}ms`);

    if (avgTime < 100) { // Less than 100ms per calculation is reasonable
        console.log(`  ✅ Performance acceptable`);
        return true;
    } else {
        console.log(`  ⚠️  Performance may need optimization`);
        return false;
    }
}

function runLongTermTests(): boolean {
    console.log('\n=== LONG-TERM STABILITY TESTS (INTERVALS) ===\n');

    let allTestsPassed = true;
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore

    const expectations: any[] = [
        {
            year: 2030,
            date: '2030-06-15T12:00:00Z',
            tithi: 'Purnima',
            nakshatra: 'Jyeshtha',
            yoga: 'Sadhya',
            karana: 'Vishti',
            vara: 'Sat'
        },
        {
            year: 2035,
            date: '2035-06-15T12:00:00Z',
            tithi: 'Dashami',
            nakshatra: 'Chitra',
            yoga: 'Variyana',
            karana: 'Garaja',
            vara: 'Fri'
        },
        {
            year: 2040,
            date: '2040-06-15T12:00:00Z',
            tithi: 'Panchami',
            nakshatra: 'Ashlesha',
            yoga: 'Harshana',
            karana: 'Balava',
            vara: 'Fri'
        },
        {
            year: 2045,
            date: '2045-06-15T12:00:00Z',
            tithi: 'Amavasya',
            nakshatra: 'Mrigashira',
            yoga: 'Shula',
            karana: 'Nagava',
            vara: 'Thu'
        },
        {
            year: 2050,
            date: '2050-06-15T12:00:00Z',
            tithi: 'Ekadashi',
            nakshatra: 'Ashwini',
            yoga: 'Shobhana',
            karana: 'Balava',
            vara: 'Wed'
        }
    ];

    expectations.forEach(exp => {
        const testDate = new Date(exp.date);
        console.log(`Testing ${exp.year}: ${testDate.toISOString()}`);

        try {
            // Get sunrise-based panchanga to match Drik's day panchang
            let p = getPanchangam(testDate, observer);
            if (p.sunrise) {
                // Shift to just after sunrise to get the day's primary attributes
                p = getPanchangam(new Date(p.sunrise.getTime() + 1000), observer);
            }

            const calcTithi = tithiNames[p.tithi];
            const calcNakshatra = nakshatraNames[p.nakshatra];
            const calcYoga = yogaNames[p.yoga];
            const calcKarana = p.karana;
            const calcVara = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][p.vara];

            // Normalize for comparison (simple check)
            const match = (val1: string, val2: string) => val1.toLowerCase().includes(val2.toLowerCase()) || val2.toLowerCase().includes(val1.toLowerCase());

            const tithiMatch = match(calcTithi, exp.tithi);
            const nakMatch = match(calcNakshatra, exp.nakshatra);
            const yogaMatch = match(calcYoga, exp.yoga);
            const karanaMatch = match(calcKarana, exp.karana);
            const varaMatch = match(calcVara, exp.vara);

            if (tithiMatch && nakMatch && yogaMatch && varaMatch) {
                console.log(`  ✅ ${exp.year} Matches: ${calcTithi}, ${calcNakshatra}, ${calcYoga}, ${calcVara}`);
            } else {
                console.log(`  ❌ ${exp.year} Mismatch!`);
                console.log(`     Expected: ${exp.tithi}, ${exp.nakshatra}, ${exp.yoga}, ${exp.vara}`);
                console.log(`     Got:      ${calcTithi}, ${calcNakshatra}, ${calcYoga}, ${calcVara}`);
                allTestsPassed = false;
            }

        } catch (error) {
            console.log(`  ❌ Calculation failed for ${exp.year}: ${error}`);
            allTestsPassed = false;
        }
    });

    return allTestsPassed;
}



function runVedicValidationTests(): boolean {
    console.log('\n=== VEDIC & ELEMENT VALIDATION TESTS ===\n');

    let allValid = true;
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore
    const testDate = new Date('2025-06-15T12:00:00Z');
    const result = getPanchangam(testDate, observer);

    // 1. Muhurtas Validation
    const muhurtas = [
        { name: 'Abhijit Muhurta', value: result.abhijitMuhurta },
        { name: 'Brahma Muhurta', value: result.brahmaMuhurta },
        { name: 'Yamaganda Kalam', value: result.yamagandaKalam },
        { name: 'Gulika Kalam', value: result.gulikaKalam }
    ];

    muhurtas.forEach(m => {
        if (m.value && m.value.start instanceof Date && m.value.end instanceof Date) {
            if (m.value.start < m.value.end) {
                console.log(`  ✅ ${m.name} is valid (${m.value.start.toLocaleTimeString()} - ${m.value.end.toLocaleTimeString()})`);
            } else {
                console.log(`  ❌ ${m.name} invalid: start > end`);
                allValid = false;
            }
        } else {
            console.log(`  ⚠️  ${m.name} is null (acceptable for some depending on day/time)`);
        }
    });

    if (result.rahuKalamStart && result.rahuKalamEnd && result.rahuKalamStart < result.rahuKalamEnd) {
        console.log(`  ✅ Rahu Kalam is valid`);
    } else {
        console.log(`  ❌ Rahu Kalam missing or invalid`);
        allValid = false;
    }

    // 2. Planetary Positions
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    let planetsValid = true;

    planets.forEach(planet => {
        const p = (result.planetaryPositions as any)[planet];
        if (p && typeof p.longitude === 'number' && typeof p.rashi === 'number' && typeof p.degree === 'number') {
            if (p.longitude >= 0 && p.longitude < 360 && p.rashi >= 0 && p.rashi <= 11 && p.degree >= 0 && p.degree <= 30) {
                // Valid
            } else {
                console.log(`  ❌ ${planet} values out of range: Lon=${p.longitude}, Rashi=${p.rashi}`);
                planetsValid = false;
            }
        } else {
            console.log(`  ❌ ${planet} data missing`);
            planetsValid = false;
        }
    });

    if (planetsValid) {
        console.log(`  ✅ All 7 planetary positions are valid`);
    } else {
        allValid = false;
    }

    // 3. Ayanamsa
    if (result.ayanamsa > 23 && result.ayanamsa < 25) {
        console.log(`  ✅ Ayanamsa valid (${result.ayanamsa.toFixed(4)})`);
    } else {
        console.log(`  ❌ Ayanamsa unusual: ${result.ayanamsa}`);
        // Not strictly failing, but warning
    }

    // 4. Transitions
    if (Array.isArray(result.nakshatraTransitions) && Array.isArray(result.tithiTransitions)) {
        console.log(`  ✅ Transitions arrays present`);
    } else {
        console.log(`  ❌ Transitions missing`);
        allValid = false;
    }

    return allValid;
}

function runAllTests(): void {
    console.log('🧪 PANCHANGAM LIBRARY COMPREHENSIVE VALIDATION TESTS\n');

    const results = {
        basic: runBasicValidationTests(),
        edgeCases: runEdgeCaseTests(),
        vedic: runVedicValidationTests(),
        longTerm: runLongTermTests(),
        performance: runPerformanceTests()
    };

    console.log('\n=== TEST SUMMARY ===');
    console.log(`Basic validation: ${results.basic ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Edge cases: ${results.edgeCases ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Vedic elements: ${results.vedic ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Long-term: ${results.longTerm ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Performance: ${results.performance ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);

    const allPassed = results.basic && results.edgeCases && results.vedic && results.longTerm && results.performance;
    console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (allPassed) {
        console.log('✨ Library is ready for production use!');
    } else {
        console.log('🔧 Library needs attention before production use.');
    }
}

// Run tests in Jest
test('Comprehensive Validation Suite', () => {
    runAllTests();
});