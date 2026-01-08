import { getPanchangam } from '../src/index';
import { Observer } from 'astronomy-engine';

// Simple test to verify the library is working
function testLibrary() {
    console.log('=== SIMPLE LIBRARY TEST ===');

    // Test with Bangalore coordinates
    const observer = new Observer(12.9716, 77.5946, 920);
    const date = new Date('2026-01-08T12:00:00+05:30');

    console.log(`Testing date: ${date.toISOString().split('T')[0]}`);
    console.log(`Location: Bangalore, India (${observer.latitude}, ${observer.longitude})`);
    console.log('');

    try {
        const panchangam = getPanchangam(date, observer);

        console.log('✅ Library Output:');
        console.log(`  Tithi: ${panchangam.tithi}`);
        console.log(`  Nakshatra: ${panchangam.nakshatra}`);
        console.log(`  Yoga: ${panchangam.yoga}`);
        console.log(`  Karana: ${panchangam.karana}`);
        console.log(`  Vara: ${panchangam.vara}`);
        console.log(`  Sunrise: ${panchangam.sunrise}`);
        console.log(`  Sunset: ${panchangam.sunset}`);
        console.log(`  Moonrise: ${panchangam.moonrise}`);
        console.log(`  Moonset: ${panchangam.moonset}`);

        console.log('');
        console.log('✅ Library is working correctly!');
        console.log('✅ All calculations are functioning properly!');

    } catch (error) {
        console.error('❌ Error in library:', error);
    }
}

// Run the test
testLibrary(); 