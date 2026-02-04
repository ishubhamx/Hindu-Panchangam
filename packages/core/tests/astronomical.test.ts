import { getPanchangam } from '../src';
import { Observer } from 'astronomy-engine';

test('Astronomical Calculations Validation', () => {
    console.log('🔍 ASTRONOMICAL CALCULATIONS VALIDATION\n');

    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore
    const testDate = new Date('2025-06-15T06:00:00.000Z'); // 6 AM UTC (11:30 AM IST)

    console.log(`Test Date: ${testDate.toISOString()}`);
    console.log(`Location: Bangalore (${observer.latitude}, ${observer.longitude})\n`);

    const result = getPanchangam(testDate, observer);

    console.log('🌅 SUNRISE/SUNSET ANALYSIS:');
    if (result.sunrise && result.sunset) {
        console.log(`  Sunrise: ${result.sunrise.toISOString()} (${result.sunrise.toUTCString()})`);
        console.log(`  Sunset:  ${result.sunset.toISOString()} (${result.sunset.toUTCString()})`);

        const dayLength = result.sunset.getTime() - result.sunrise.getTime();
        const dayLengthHours = dayLength / (1000 * 60 * 60);

        console.log(`  Day Length: ${dayLengthHours.toFixed(2)} hours`);

        if (dayLengthHours < 0) {
            console.log('  ❌ ISSUE: Negative day length detected!');
            console.log('  📝 This likely indicates sunrise/sunset are from different days');

            // Let's check sunrise/sunset for consecutive days
            const prevDay = new Date(testDate.getTime() - 24 * 60 * 60 * 1000);
            const nextDay = new Date(testDate.getTime() + 24 * 60 * 60 * 1000);

            const prevResult = getPanchangam(prevDay, observer);
            const nextResult = getPanchangam(nextDay, observer);

            console.log(`\n  Previous day sunrise: ${prevResult.sunrise?.toISOString()}`);
            console.log(`  Previous day sunset:  ${prevResult.sunset?.toISOString()}`);
            console.log(`  Next day sunrise:     ${nextResult.sunrise?.toISOString()}`);
            console.log(`  Next day sunset:      ${nextResult.sunset?.toISOString()}`);

        } else if (dayLengthHours > 10 && dayLengthHours < 14) {
            console.log('  ✅ Day length appears reasonable for the location and date');
        } else {
            console.log('  ⚠️  Day length unusual but not necessarily incorrect');
        }
    } else {
        console.log('  ❌ Sunrise or sunset is null');
    }

    console.log('\n🌙 MOON RISE/SET ANALYSIS:');
    if (result.moonrise && result.moonset) {
        console.log(`  Moonrise: ${result.moonrise.toISOString()} (${result.moonrise.toUTCString()})`);
        console.log(`  Moonset:  ${result.moonset.toISOString()} (${result.moonset.toUTCString()})`);

        const moonUpTime = result.moonset.getTime() - result.moonrise.getTime();
        const moonUpHours = moonUpTime / (1000 * 60 * 60);

        console.log(`  Moon visible time: ${moonUpHours.toFixed(2)} hours`);

        if (moonUpHours < 0) {
            console.log('  📝 Negative moon visible time (moonrise/moonset on different days)');
        }
    } else {
        console.log('  📝 Moonrise or moonset is null (moon may be circumpolar or never rise/set)');
    }

    console.log('\n⏰ TRANSITION TIME ANALYSIS:');
    console.log(`  Tithi End: ${result.tithiEndTime?.toISOString() || 'null'}`);
    console.log(`  Nakshatra End: ${result.nakshatraEndTime?.toISOString() || 'null'}`);
    console.log(`  Yoga End: ${result.yogaEndTime?.toISOString() || 'null'}`);

    if (result.tithiEndTime) {
        const timeDiff = result.tithiEndTime.getTime() - testDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > 0 && hoursDiff < 48) {
            console.log(`  ✅ Tithi end time reasonable: ${hoursDiff.toFixed(2)} hours from test time`);
        } else if (hoursDiff < 0) {
            console.log(`  📝 Tithi ended in the past: ${Math.abs(hoursDiff).toFixed(2)} hours ago`);
        } else {
            console.log(`  ⚠️  Tithi end time very far: ${hoursDiff.toFixed(2)} hours from test time`);
        }
    }

    console.log('\n📊 CALCULATION RANGES:');
    console.log(`  Tithi: ${result.tithi} (valid range: 0-29)`);
    console.log(`  Nakshatra: ${result.nakshatra} (valid range: 0-26)`);
    console.log(`  Yoga: ${result.yoga} (valid range: 0-26)`);
    console.log(`  Vara: ${result.vara} (valid range: 0-6, ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][result.vara]})`);
    console.log(`  Karana: ${result.karana}`);

    // Test multiple dates to see if there are any obvious issues
    console.log('\n🗓️  MULTIPLE DATE CONSISTENCY CHECK:');
    const testDates = [
        new Date('2025-06-14T12:00:00.000Z'),
        new Date('2025-06-15T12:00:00.000Z'),
        new Date('2025-06-16T12:00:00.000Z')
    ];

    testDates.forEach((date, index) => {
        const result = getPanchangam(date, observer);
        const dayOfWeek = date.getDay();

        if (result.vara === dayOfWeek) {
            console.log(`  ✅ Day ${index + 1}: Vara matches JavaScript day of week`);
        } else {
            console.log(`  ❌ Day ${index + 1}: Vara mismatch - calculated: ${result.vara}, expected: ${dayOfWeek}`);
        }
    });
});

test('Rahu Kalam Validation', () => {
    console.log('\n🔴 RAHU KALAM VALIDATION\n');

    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore
    const testDate = new Date('2025-06-15T06:00:00.000Z');

    const result = getPanchangam(testDate, observer);

    if (result.rahuKalamStart && result.rahuKalamEnd && result.sunrise && result.sunset) {
        console.log(`  Sunrise: ${result.sunrise.toISOString()}`);
        console.log(`  Sunset: ${result.sunset.toISOString()}`);
        console.log(`  Rahu Kalam Start: ${result.rahuKalamStart.toISOString()}`);
        console.log(`  Rahu Kalam End: ${result.rahuKalamEnd.toISOString()}`);

        const totalDaylight = result.sunset.getTime() - result.sunrise.getTime();
        const rahuKalamDuration = result.rahuKalamEnd.getTime() - result.rahuKalamStart.getTime();
        const expectedPortion = totalDaylight / 8;

        console.log(`  Total daylight: ${(totalDaylight / (1000 * 60 * 60)).toFixed(2)} hours`);
        console.log(`  Rahu Kalam duration: ${(rahuKalamDuration / (1000 * 60 * 60)).toFixed(2)} hours`);
        console.log(`  Expected duration: ${(expectedPortion / (1000 * 60 * 60)).toFixed(2)} hours`);

        if (Math.abs(rahuKalamDuration - expectedPortion) < 60000) { // Within 1 minute
            console.log(`  ✅ Rahu Kalam duration matches expected 1/8th of daylight`);
        } else {
            console.log(`  ❌ Rahu Kalam duration doesn't match expected 1/8th of daylight`);
        }
    } else {
        console.log('  ❌ Missing sunrise, sunset, or Rahu Kalam times');
    }
});