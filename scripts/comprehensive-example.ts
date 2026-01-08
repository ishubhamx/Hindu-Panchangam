import { getPanchangam, rashiNames, horaRulers, tithiNames, nakshatraNames, yogaNames } from '../src/index';
import { Observer } from 'astronomy-engine';

// Comprehensive example demonstrating all enhanced Vedic features
function comprehensiveExample() {
    console.log('🕉️  COMPREHENSIVE VEDIC PANCHANGAM EXAMPLE 🕉️\n');

    // Using Bangalore coordinates as example
    const observer = new Observer(12.9716, 77.5946, 920);
    const date = new Date('2025-06-22T06:00:00Z'); // June 22, 2025 at 6:00 AM UTC

    console.log(`📅 Date: ${date.toDateString()}`);
    console.log(`📍 Location: Bangalore, India (${observer.latitude}°N, ${observer.longitude}°E)\n`);

    const panchangam = getPanchangam(date, observer);

    // ========== CORE PANCHANGAM ELEMENTS ==========
    console.log('📊 CORE PANCHANGAM ELEMENTS');
    console.log('─'.repeat(40));
    console.log(`🌙 Tithi: ${tithiNames[panchangam.tithi]} (${panchangam.tithi})`);
    console.log(`⭐ Nakshatra: ${nakshatraNames[panchangam.nakshatra]} (${panchangam.nakshatra})`);
    console.log(`🔗 Yoga: ${yogaNames[panchangam.yoga]} (${panchangam.yoga})`);
    console.log(`⏳ Karana: ${panchangam.karana}`);
    console.log(`📆 Vara (Day): ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][panchangam.vara]}`);

    // ========== ASTRONOMICAL TIMES ==========
    console.log('\n🌅 ASTRONOMICAL TIMES');
    console.log('─'.repeat(40));
    console.log(`🌅 Sunrise: ${panchangam.sunrise?.toLocaleString() || 'N/A'}`);
    console.log(`🌇 Sunset: ${panchangam.sunset?.toLocaleString() || 'N/A'}`);
    console.log(`🌙 Moonrise: ${panchangam.moonrise?.toLocaleString() || 'N/A'}`);
    console.log(`🌚 Moonset: ${panchangam.moonset?.toLocaleString() || 'N/A'}`);

    // ========== MUHURTA (AUSPICIOUS TIMES) ==========
    console.log('\n✨ MUHURTA - AUSPICIOUS TIMES');
    console.log('─'.repeat(40));
    if (panchangam.abhijitMuhurta) {
        console.log(`🏆 Abhijit Muhurta: ${panchangam.abhijitMuhurta.start.toLocaleTimeString()} - ${panchangam.abhijitMuhurta.end.toLocaleTimeString()}`);
        console.log('   (Most auspicious time of the day - 24 minutes around noon)');
    }
    if (panchangam.brahmaMuhurta) {
        console.log(`🧘 Brahma Muhurta: ${panchangam.brahmaMuhurta.start.toLocaleTimeString()} - ${panchangam.brahmaMuhurta.end.toLocaleTimeString()}`);
        console.log('   (Ideal time for meditation and spiritual practices)');
    }
    if (panchangam.govardhanMuhurta) {
        console.log(`🎯 Govardhan Muhurta: ${panchangam.govardhanMuhurta.start.toLocaleTimeString()} - ${panchangam.govardhanMuhurta.end.toLocaleTimeString()}`);
        console.log('   (Afternoon auspicious period)');
    }

    // ========== INAUSPICIOUS TIMES ==========
    console.log('\n⚠️  INAUSPICIOUS TIMES');
    console.log('─'.repeat(40));
    if (panchangam.rahuKalamStart && panchangam.rahuKalamEnd) {
        console.log(`🐍 Rahu Kalam: ${panchangam.rahuKalamStart.toLocaleTimeString()} - ${panchangam.rahuKalamEnd.toLocaleTimeString()}`);
        console.log('   (Avoid starting new ventures during this time)');
    }
    if (panchangam.yamagandaKalam) {
        console.log(`💀 Yamaganda Kalam: ${panchangam.yamagandaKalam.start.toLocaleTimeString()} - ${panchangam.yamagandaKalam.end.toLocaleTimeString()}`);
        console.log('   (Death-related inauspicious period)');
    }
    if (panchangam.gulikaKalam) {
        console.log(`🪐 Gulika Kalam: ${panchangam.gulikaKalam.start.toLocaleTimeString()} - ${panchangam.gulikaKalam.end.toLocaleTimeString()}`);
        console.log('   (Saturn-influenced unfavorable time)');
    }
    if (panchangam.durMuhurta && panchangam.durMuhurta.length > 0) {
        console.log(`🚫 Dur Muhurta periods (${panchangam.durMuhurta.length}):`);
        panchangam.durMuhurta.forEach((period, index) => {
            console.log(`   ${index + 1}. ${period.start.toLocaleTimeString()} - ${period.end.toLocaleTimeString()}`);
        });
        console.log('   (Various inauspicious periods throughout the day)');
    }

    // ========== PLANETARY POSITIONS ==========
    console.log('\n🌌 PLANETARY POSITIONS IN RASHIS');
    console.log('─'.repeat(40));
    Object.entries(panchangam.planetaryPositions).forEach(([planet, position]) => {
        const planetSymbol = {
            sun: '☀️',
            moon: '🌙',
            mars: '♂️',
            mercury: '☿️',
            jupiter: '♃',
            venus: '♀️',
            saturn: '♄'
        }[planet] || '🪐';

        console.log(`${planetSymbol} ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${position.longitude.toFixed(2)}° in ${position.rashiName} (${position.degree.toFixed(2)}° within sign)`);
    });

    // ========== VEDIC CALCULATIONS ==========
    console.log('\n🔢 ADDITIONAL VEDIC CALCULATIONS');
    console.log('─'.repeat(40));
    console.log(`🌙 Chandra Balam (Moon Strength): ${panchangam.chandrabalam}%`);
    console.log(`   ${panchangam.chandrabalam >= 75 ? '🟢 Very Strong' :
        panchangam.chandrabalam >= 50 ? '🟡 Strong' :
            panchangam.chandrabalam >= 25 ? '🟠 Moderate' : '🔴 Weak'}`);

    console.log(`⏰ Current Hora (Planetary Hour): ${panchangam.currentHora}`);
    const horaEmoji = {
        'Sun': '☀️',
        'Moon': '🌙',
        'Mars': '♂️',
        'Mercury': '☿️',
        'Jupiter': '♃',
        'Venus': '♀️',
        'Saturn': '♄'
    }[panchangam.currentHora] || '🪐';
    console.log(`   ${horaEmoji} This hour is ruled by ${panchangam.currentHora}`);

    // ========== PRACTICAL GUIDANCE ==========
    console.log('\n💡 PRACTICAL GUIDANCE');
    console.log('─'.repeat(40));

    // Good time recommendations
    const goodTimes = [];
    if (panchangam.abhijitMuhurta) goodTimes.push('Abhijit Muhurta');
    if (panchangam.brahmaMuhurta) goodTimes.push('Brahma Muhurta');
    if (panchangam.govardhanMuhurta) goodTimes.push('Govardhan Muhurta');

    if (goodTimes.length > 0) {
        console.log(`✅ Best times today: ${goodTimes.join(', ')}`);
    }

    // Times to avoid
    const avoidTimes = [];
    if (panchangam.rahuKalamStart) avoidTimes.push('Rahu Kalam');
    if (panchangam.yamagandaKalam) avoidTimes.push('Yamaganda Kalam');
    if (panchangam.gulikaKalam) avoidTimes.push('Gulika Kalam');
    if (panchangam.durMuhurta) avoidTimes.push('Dur Muhurta periods');

    if (avoidTimes.length > 0) {
        console.log(`❌ Times to avoid: ${avoidTimes.join(', ')}`);
    }

    // Moon strength advice
    if (panchangam.chandrabalam >= 75) {
        console.log('🌕 Excellent day for important decisions and new beginnings');
    } else if (panchangam.chandrabalam >= 50) {
        console.log('🌔 Good day for most activities, favorable lunar energy');
    } else if (panchangam.chandrabalam <= 25) {
        console.log('🌑 Consider postponing important decisions, weak lunar influence');
    }

    console.log('\n🙏 May this Panchangam guide you to auspicious timing! 🙏');
}

// Run the comprehensive example
comprehensiveExample();