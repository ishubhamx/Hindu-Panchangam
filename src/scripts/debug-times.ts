import { getPanchangam } from '../index';
import { Observer } from 'astronomy-engine';

// Debug script to check times
function debugTimes() {
    console.log('=== DEBUG TIMES TEST ===\n');
    
    // Test with Bangalore coordinates for a specific date
    const observer = new Observer(12.9716, 77.5946, 920);
    const date = new Date('2025-06-22T06:00:00Z'); // 6 AM UTC on June 22, 2025
    
    console.log(`Testing date: ${date.toISOString()}`);
    console.log(`Local time should be around 11:30 AM IST (UTC+5:30)`);
    console.log(`Location: Bangalore, India (${observer.latitude}, ${observer.longitude})\n`);
    
    try {
        const panchangam = getPanchangam(date, observer);
        
        console.log('Basic Times:');
        console.log(`  Input Date: ${date.toISOString()}`);
        console.log(`  Sunrise: ${panchangam.sunrise?.toISOString()}`);
        console.log(`  Sunset: ${panchangam.sunset?.toISOString()}`);
        
        console.log('\nMuhurta Times:');
        if (panchangam.abhijitMuhurta) {
            console.log(`  Abhijit Muhurta: ${panchangam.abhijitMuhurta.start.toISOString()} to ${panchangam.abhijitMuhurta.end.toISOString()}`);
        }
        if (panchangam.brahmaMuhurta) {
            console.log(`  Brahma Muhurta: ${panchangam.brahmaMuhurta.start.toISOString()} to ${panchangam.brahmaMuhurta.end.toISOString()}`);
        }
        
        console.log('\nHora Calculation:');
        console.log(`  Day of Week: ${date.getDay()} (0=Sunday)`);
        console.log(`  Current Hora: ${panchangam.currentHora}`);
        
        console.log('\nPlanetary Info:');
        console.log(`  Sun in ${panchangam.planetaryPositions.sun.rashiName}: ${panchangam.planetaryPositions.sun.degree.toFixed(2)}°`);
        console.log(`  Moon in ${panchangam.planetaryPositions.moon.rashiName}: ${panchangam.planetaryPositions.moon.degree.toFixed(2)}°`);
        console.log(`  Chandra Balam: ${panchangam.chandrabalam}%`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugTimes();