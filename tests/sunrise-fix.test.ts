import { Body, Observer, SearchRiseSet } from "astronomy-engine";

function fixedGetSunrise(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Sun, observer, 1, startOfDay, 1);
    if (!time) return null;

    const sunrise = time.date;

    // Check if sunrise is within the same calendar day
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (sunrise >= startOfDay && sunrise <= endOfDay) {
        return sunrise;
    }

    return null;
}

function fixedGetSunset(date: Date, observer: Observer): Date | null {
    // Start searching from the beginning of the day  
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const time = SearchRiseSet(Body.Sun, observer, -1, startOfDay, 1);
    if (!time) return null;

    const sunset = time.date;

    // Check if sunset is within the same calendar day
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (sunset >= startOfDay && sunset <= endOfDay) {
        return sunset;
    }

    return null;
}

function testSunriseSunsetFix() {
    console.log('🌅 TESTING SUNRISE/SUNSET FIX\n');

    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore
    const testDate = new Date('2025-06-15T06:00:00.000Z');

    console.log(`Test Date: ${testDate.toISOString()}`);
    console.log(`Location: Bangalore (${observer.latitude}, ${observer.longitude})\n`);

    // Test original functions
    console.log('ORIGINAL FUNCTIONS:');
    const originalSunrise = SearchRiseSet(Body.Sun, observer, 1, testDate, 1);
    const originalSunset = SearchRiseSet(Body.Sun, observer, -1, testDate, 1);

    console.log(`  Original Sunrise: ${originalSunrise?.date.toISOString() || 'null'}`);
    console.log(`  Original Sunset:  ${originalSunset?.date.toISOString() || 'null'}`);

    if (originalSunrise && originalSunset) {
        const dayLength = originalSunset.date.getTime() - originalSunrise.date.getTime();
        const dayLengthHours = dayLength / (1000 * 60 * 60);
        console.log(`  Day Length: ${dayLengthHours.toFixed(2)} hours`);
    }

    // Test fixed functions  
    console.log('\nFIXED FUNCTIONS:');
    const fixedSunrise = fixedGetSunrise(testDate, observer);
    const fixedSunset = fixedGetSunset(testDate, observer);

    console.log(`  Fixed Sunrise: ${fixedSunrise?.toISOString() || 'null'}`);
    console.log(`  Fixed Sunset:  ${fixedSunset?.toISOString() || 'null'}`);

    if (fixedSunrise && fixedSunset) {
        const dayLength = fixedSunset.getTime() - fixedSunrise.getTime();
        const dayLengthHours = dayLength / (1000 * 60 * 60);
        console.log(`  Day Length: ${dayLengthHours.toFixed(2)} hours`);

        if (dayLengthHours > 0 && dayLengthHours < 24) {
            console.log(`  ✅ Day length is reasonable`);
        } else {
            console.log(`  ❌ Day length is still problematic`);
        }
    }

    // Test multiple dates
    console.log('\nTESTING MULTIPLE DATES:');
    const testDates = [
        new Date('2025-06-14T12:00:00.000Z'),
        new Date('2025-06-15T12:00:00.000Z'),
        new Date('2025-06-16T12:00:00.000Z')
    ];

    testDates.forEach((date, index) => {
        const sunrise = fixedGetSunrise(date, observer);
        const sunset = fixedGetSunset(date, observer);

        console.log(`  Day ${index + 1} (${date.toISOString().split('T')[0]}):`);
        console.log(`    Sunrise: ${sunrise?.toISOString() || 'null'}`);
        console.log(`    Sunset:  ${sunset?.toISOString() || 'null'}`);

        if (sunrise && sunset) {
            const dayLength = sunset.getTime() - sunrise.getTime();
            const dayLengthHours = dayLength / (1000 * 60 * 60);
            console.log(`    Day Length: ${dayLengthHours.toFixed(2)} hours`);
        }
    });
}

// Run the test
test('Sunrise Fix Verification', () => {
    testSunriseSunsetFix();
});