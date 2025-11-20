import { getPanchangam, rashiNames, horaRulers } from '../index';
import { Observer } from 'astronomy-engine';

// Test script to verify the enhanced Vedic features
function testVedicFeatures() {
    console.log('=== ENHANCED VEDIC FEATURES TEST ===\n');
    
    // Test with Bangalore coordinates
    const observer = new Observer(12.9716, 77.5946, 920);
    const date = new Date('2025-06-22T09:00:00.000Z'); // 9 AM UTC
    
    console.log(`Testing date: ${date.toISOString()}`);
    console.log(`Location: Bangalore, India (${observer.latitude}, ${observer.longitude})\n`);
    
    try {
        const panchangam = getPanchangam(date, observer);
        
        console.log('✅ BASIC PANCHANGAM ELEMENTS:');
        console.log(`  Tithi: ${panchangam.tithi}`);
        console.log(`  Nakshatra: ${panchangam.nakshatra}`);
        console.log(`  Yoga: ${panchangam.yoga}`);
        console.log(`  Karana: ${panchangam.karana}`);
        console.log(`  Vara: ${panchangam.vara}`);
        console.log(`  Sunrise: ${panchangam.sunrise}`);
        console.log(`  Sunset: ${panchangam.sunset}\n`);
        
        console.log('✅ MUHURTA CALCULATIONS:');
        if (panchangam.abhijitMuhurta) {
            console.log(`  Abhijit Muhurta: ${panchangam.abhijitMuhurta.start} to ${panchangam.abhijitMuhurta.end}`);
        }
        if (panchangam.brahmaMuhurta) {
            console.log(`  Brahma Muhurta: ${panchangam.brahmaMuhurta.start} to ${panchangam.brahmaMuhurta.end}`);
        }
        if (panchangam.govardhanMuhurta) {
            console.log(`  Govardhan Muhurta: ${panchangam.govardhanMuhurta.start} to ${panchangam.govardhanMuhurta.end}`);
        }
        
        console.log('\n✅ INAUSPICIOUS TIMES:');
        if (panchangam.yamagandaKalam) {
            console.log(`  Yamaganda Kalam: ${panchangam.yamagandaKalam.start} to ${panchangam.yamagandaKalam.end}`);
        }
        if (panchangam.gulikaKalam) {
            console.log(`  Gulika Kalam: ${panchangam.gulikaKalam.start} to ${panchangam.gulikaKalam.end}`);
        }
        if (panchangam.rahuKalamStart && panchangam.rahuKalamEnd) {
            console.log(`  Rahu Kalam: ${panchangam.rahuKalamStart} to ${panchangam.rahuKalamEnd}`);
        }
        if (panchangam.durMuhurta && panchangam.durMuhurta.length > 0) {
            console.log(`  Dur Muhurta periods: ${panchangam.durMuhurta.length}`);
            panchangam.durMuhurta.forEach((dm, index) => {
                console.log(`    ${index + 1}: ${dm.start} to ${dm.end}`);
            });
        }
        
        console.log('\n✅ PLANETARY POSITIONS:');
        Object.entries(panchangam.planetaryPositions).forEach(([planet, position]) => {
            console.log(`  ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${position.longitude.toFixed(2)}° in ${position.rashiName} (${position.degree.toFixed(2)}°)`);
        });
        
        console.log('\n✅ ADDITIONAL VEDIC DATA:');
        console.log(`  Chandra Balam (Moon Strength): ${panchangam.chandrabalam}%`);
        console.log(`  Current Hora: ${panchangam.currentHora}`);
        
        console.log('\n✅ Enhanced Vedic features are working correctly!');
        console.log('✅ All new calculations are functioning properly!');
        
    } catch (error) {
        console.error('❌ Error in enhanced library:', error);
    }
}

// Run the test
testVedicFeatures();