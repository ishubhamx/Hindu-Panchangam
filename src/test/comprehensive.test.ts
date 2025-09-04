import { getPanchangam, Observer } from '../index';
import { 
    karanaNames, 
    yogaNames, 
    tithiNames, 
    nakshatraNames 
} from '../panchangam';

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

function runAllTests(): void {
    console.log('🧪 PANCHANGAM LIBRARY COMPREHENSIVE VALIDATION TESTS\n');
    
    const results = {
        basic: runBasicValidationTests(),
        edgeCases: runEdgeCaseTests(),
        performance: runPerformanceTests()
    };
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Basic validation: ${results.basic ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Edge cases: ${results.edgeCases ? '✅ PASSED' : '❌ FAILED'}`);  
    console.log(`Performance: ${results.performance ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);
    
    const allPassed = results.basic && results.edgeCases && results.performance;
    console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('✨ Library is ready for production use!');
    } else {
        console.log('🔧 Library needs attention before production use.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

export { runAllTests, runBasicValidationTests, runEdgeCaseTests, runPerformanceTests };