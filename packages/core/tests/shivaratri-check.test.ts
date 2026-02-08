import { Observer } from 'astronomy-engine';
import { getPanchangam, getSunrise } from '../src/index.js';
import { tithiNames } from '../src/core/constants.js';
import { getTithiAtTime } from '../src/core/udaya-tithi.js';

const IST_OFFSET = 330; // IST = UTC+5:30 = 330 minutes

describe('Maha Shivaratri 2026 New Delhi', () => {
  const observer = new Observer(28.6139, 77.2090, 0);

  it('should check which date has Maha Shivaratri', () => {
    for (let day = 13; day <= 17; day++) {
      // Construct date at noon UTC for the target civil day
      const date = new Date(`2026-02-${String(day).padStart(2, '0')}T12:00:00Z`);
      
      // Get sunrise first, then anchor panchangam on sunrise (like the web app does)
      const sunrise = getSunrise(date, observer, { timezoneOffset: IST_OFFSET });
      const panchang = sunrise
        ? getPanchangam(sunrise, observer, { timezoneOffset: IST_OFFSET })
        : getPanchangam(date, observer, { timezoneOffset: IST_OFFSET });
      
      const tithiIdx0 = panchang.tithi; // 0-indexed
      const tithiName0 = tithiNames[tithiIdx0] || `Unknown(${tithiIdx0})`;
      
      // Also check what getTithiAtTime says for sunrise
      let udayaTithi1: number | null = null;
      if (panchang.sunrise) {
        udayaTithi1 = getTithiAtTime(panchang.sunrise);
      }
      
      console.log(`\n=== Feb ${day}, 2026 ===`);
      console.log(`Sunrise: ${panchang.sunrise?.toISOString()}`);
      console.log(`Sunset: ${panchang.sunset?.toISOString()}`);
      console.log(`panchang.tithi (0-idx): ${tithiIdx0} = ${tithiName0}, paksha: ${panchang.paksha}`);
      console.log(`getTithiAtTime(sunrise) (1-idx): ${udayaTithi1} = ${udayaTithi1 ? tithiNames[udayaTithi1 - 1] : 'N/A'}`);
      console.log(`Masa: ${panchang.masa.name} (index: ${panchang.masa.index})`);
      console.log(`Festivals: ${panchang.festivals.length > 0 ? panchang.festivals.map(f => f.name).join(', ') : 'None'}`);
      
      if (panchang.tithiTransitions?.length) {
        console.log('Tithi transitions:');
        panchang.tithiTransitions.forEach(t => {
          console.log(`  ${t.name} (idx=${t.index}): ${t.startTime.toISOString()} -> ${t.endTime.toISOString()}`);
        });
      }
      
      const hasShivaratri = panchang.festivals.some(f => f.name.toLowerCase().includes('shivaratri'));
      if (hasShivaratri) {
        console.log('>>> SHIVARATRI FOUND HERE <<<');
      }
    }
  });

  it('Maha Shivaratri should be on Feb 15 ONLY (matching Drik Panchang)', () => {
    // Helper to get panchang for a given IST date
    const getP = (day: number) => {
      const date = new Date(`2026-02-${String(day).padStart(2, '0')}T12:00:00Z`);
      const sr = getSunrise(date, observer, { timezoneOffset: IST_OFFSET });
      return sr ? getPanchangam(sr, observer, { timezoneOffset: IST_OFFSET })
                : getPanchangam(date, observer, { timezoneOffset: IST_OFFSET });
    };
    
    const feb14 = getP(14);
    const feb15 = getP(15);
    const feb16 = getP(16);

    console.log('\nFeb 14 festivals:', feb14.festivals.map(f => f.name));
    console.log('Feb 15 festivals:', feb15.festivals.map(f => f.name));
    console.log('Feb 16 festivals:', feb16.festivals.map(f => f.name));

    // Maha Shivaratri is a NIGHT festival — observed on the day whose night
    // (Pradosh/Nishita Kala) has Krishna Chaturdashi prevailing.
    // Feb 15: Trayodashi at sunrise, Chaturdashi starts 5:06 PM IST (before sunset 6:11 PM)
    //   → Chaturdashi prevails at sunset → Shivaratri night → Maha Shivaratri ✓
    expect(feb15.festivals.some(f => f.name === 'Maha Shivaratri')).toBe(true);

    // Feb 16: Chaturdashi at sunrise, but Amavasya starts ~5:35 PM IST (before sunset ~6:12 PM)
    //   → Amavasya prevails at sunset → NOT Shivaratri night → No Maha Shivaratri ✓
    expect(feb16.festivals.some(f => f.name === 'Maha Shivaratri')).toBe(false);

    // Feb 14 should not have Maha Shivaratri either
    expect(feb14.festivals.some(f => f.name === 'Maha Shivaratri')).toBe(false);

    // Masik Shivaratri should be on Feb 16 (sunrise Chaturdashi day)
    expect(feb16.festivals.some(f => f.name === 'Masik Shivaratri')).toBe(true);
  });
});
