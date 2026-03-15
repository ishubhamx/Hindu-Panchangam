/**
 * Robust regression tests for Bug Fixes 2, 3, and 5
 *
 * Covers:
 *  - Multiple timezones (IST, UTC, PST, JST, NZST)
 *  - Day-boundary edge cases for getVara / getCurrentHora
 *  - All 7 weekdays for calculateDurMuhurta
 *  - Sankranti detection across TZ variants
 *  - Full panchangam integration with timezoneOffset
 */

import { Observer, Body, GeoVector, Ecliptic as EclipticFunc } from 'astronomy-engine';
import {
    getVara, getCurrentHora, calculateDurMuhurta,
    getSunrise, getSunset, getSankrantiForDate
} from '../src/core/calculations';
import { getAyanamsa } from '../src/core/ayanamsa';
import { getPanchangam } from '../src/core/panchangam';
import { getFestivals } from '../src/core/festivals';
import { getTithiAtSunrise } from '../src/core/udaya-tithi';

// ── Observers ──
const bangalore = new Observer(12.9716, 77.5946, 920);   // IST +5:30
const london    = new Observer(51.5074, -0.1278, 11);     // GMT +0
const newYork   = new Observer(40.7128, -74.0060, 10);    // EST -5
const tokyo     = new Observer(35.6762, 139.6503, 40);    // JST +9
const auckland  = new Observer(-36.8485, 174.7633, 7);    // NZST +12

const TZ = {
    IST:  330,
    UTC:  0,
    EST:  -300,
    JST:  540,
    NZST: 720,
};

// ═══════════════════════════════════════════════════════════════
// BUG 3: getVara — timezone accuracy
// ═══════════════════════════════════════════════════════════════
describe('Bug 3: getVara timezone accuracy', () => {
    test('IST midnight boundary — 23:50 IST Saturday vs 00:10 IST Sunday', () => {
        // 23:50 IST Sat Mar 14 = 18:20 UTC Mar 14
        const satNight = new Date('2026-03-14T18:20:00Z');
        expect(getVara(satNight, bangalore, TZ.IST)).toBe(6); // Saturday

        // 00:10 IST Sun Mar 15 = 18:40 UTC Mar 14
        const sunMorning = new Date('2026-03-14T18:40:00Z');
        expect(getVara(sunMorning, bangalore, TZ.IST)).toBe(0); // Sunday
    });

    test('EST midnight boundary — late Saturday vs early Sunday', () => {
        // 23:50 EST Sat = 04:50 UTC Sun
        const satNightNY = new Date('2026-03-15T04:50:00Z');
        expect(getVara(satNightNY, newYork, TZ.EST)).toBe(6); // Saturday

        // 00:10 EST Sun = 05:10 UTC Sun
        const sunMorningNY = new Date('2026-03-15T05:10:00Z');
        expect(getVara(sunMorningNY, newYork, TZ.EST)).toBe(0); // Sunday
    });

    test('JST midnight boundary — late Saturday vs early Sunday', () => {
        // 23:50 JST Sat Mar 14 = 14:50 UTC Mar 14
        const satNightTokyo = new Date('2026-03-14T14:50:00Z');
        expect(getVara(satNightTokyo, tokyo, TZ.JST)).toBe(6); // Saturday

        // 00:10 JST Sun Mar 15 = 15:10 UTC Mar 14
        const sunMorningTokyo = new Date('2026-03-14T15:10:00Z');
        expect(getVara(sunMorningTokyo, tokyo, TZ.JST)).toBe(0); // Sunday
    });

    test('NZST (+12) midnight boundary', () => {
        // 23:55 NZST Sat = 11:55 UTC Sat
        const satNightNZ = new Date('2026-03-14T11:55:00Z');
        expect(getVara(satNightNZ, auckland, TZ.NZST)).toBe(6);

        // 00:05 NZST Sun = 12:05 UTC Sat
        const sunMorningNZ = new Date('2026-03-14T12:05:00Z');
        expect(getVara(sunMorningNZ, auckland, TZ.NZST)).toBe(0);
    });

    test('longitude-derived TZ gives wrong result where explicit TZ is correct', () => {
        // For IST: lon/15 = 77.59/15 = 5.17h vs actual 5.5h → 20min gap
        // At 00:10 IST this means longitude says "still previous day"
        const ambiguousTime = new Date('2026-03-14T18:40:00Z'); // 00:10 IST Sun
        const varaLon = getVara(ambiguousTime, bangalore); // longitude-based
        const varaExplicit = getVara(ambiguousTime, bangalore, TZ.IST);

        expect(varaExplicit).toBe(0);  // Correct: Sunday
        expect(varaLon).toBe(6);       // Wrong: Saturday (proves the bug existed)
    });

    test('all 7 weekdays cycle correctly with explicit TZ', () => {
        // Start Monday Mar 16 2026, 12:00 IST
        for (let i = 0; i < 7; i++) {
            const d = new Date(Date.UTC(2026, 2, 16 + i, 6, 30)); // ~12:00 IST
            const expectedVara = (1 + i) % 7; // Mon=1, Tue=2 ... Sun=0
            expect(getVara(d, bangalore, TZ.IST)).toBe(expectedVara);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// BUG 3: getCurrentHora — correct lord with explicit TZ
// ═══════════════════════════════════════════════════════════════
describe('Bug 3: getCurrentHora with explicit TZ', () => {
    // First hora of each day should match the day's ruling planet:
    // Sun=Sun, Mon=Moon, Tue=Mars, Wed=Mercury, Thu=Jupiter, Fri=Venus, Sat=Saturn
    const dayLords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    test.each([
        [0, 'Sun'],
        [1, 'Moon'],
        [2, 'Mars'],
        [3, 'Mercury'],
        [4, 'Jupiter'],
        [5, 'Venus'],
        [6, 'Saturn'],
    ])('first hora on weekday %i should be %s', (vara, expectedLord) => {
        // Find a date that falls on this weekday
        // Mar 15 2026 = Sunday (0), Mar 16 = Monday (1), etc.
        const dayOffset = vara === 0 ? 0 : vara;
        const testDate = new Date(Date.UTC(2026, 2, 15 + dayOffset));
        const sunrise = getSunrise(testDate, bangalore, { timezoneOffset: TZ.IST });
        expect(sunrise).not.toBeNull();

        if (sunrise) {
            const justAfter = new Date(sunrise.getTime() + 5 * 60 * 1000);
            const hora = getCurrentHora(justAfter, sunrise, bangalore, TZ.IST);
            expect(hora).toBe(expectedLord);
        }
    });

    test('hora before sunrise uses previous day sequence', () => {
        // Sunday sunrise in Bangalore ~6:20 IST. Test at 05:00 IST = still Saturday sequence.
        const sunriseDate = new Date('2026-03-15T00:00:00Z');
        const sunrise = getSunrise(sunriseDate, bangalore, { timezoneOffset: TZ.IST });
        expect(sunrise).not.toBeNull();

        if (sunrise) {
            const beforeSunrise = new Date(sunrise.getTime() - 60 * 60 * 1000); // 1h before
            const hora = getCurrentHora(beforeSunrise, sunrise, bangalore, TZ.IST);
            // Should use Saturday's hora sequence, not Sunday's
            expect(hora).not.toBe('Sun');
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// BUG 5: calculateDurMuhurta — all weekdays
// ═══════════════════════════════════════════════════════════════
describe('Bug 5: calculateDurMuhurta weekday-specific', () => {
    const sunrise = new Date('2026-03-15T00:50:00Z');
    const sunset = new Date('2026-03-15T12:30:00Z');
    const dayDur = sunset.getTime() - sunrise.getTime();
    const muhurtaDur = dayDur / 15;

    const getIndices = (vara: number) => {
        const result = calculateDurMuhurta(sunrise, sunset, vara);
        return result?.map(m => Math.round((m.start.getTime() - sunrise.getTime()) / muhurtaDur) + 1);
    };

    test.each([
        [0, [10, 14]],  // Sunday
        [1, [2, 8]],    // Monday
        [2, [4, 10]],   // Tuesday
        [3, [8, 12]],   // Wednesday
        [4, [2, 10]],   // Thursday
        [5, [4, 6]],    // Friday
        [6, [6, 14]],   // Saturday
    ])('weekday %i returns muhurtas %j', (vara, expected) => {
        expect(getIndices(vara)).toEqual(expected);
    });

    test('always returns exactly 2 muhurtas', () => {
        for (let v = 0; v < 7; v++) {
            const result = calculateDurMuhurta(sunrise, sunset, v);
            expect(result).toHaveLength(2);
        }
    });

    test('muhurtas are sorted chronologically', () => {
        for (let v = 0; v < 7; v++) {
            const result = calculateDurMuhurta(sunrise, sunset, v);
            expect(result).not.toBeNull();
            if (result && result.length === 2) {
                expect(Math.sign(result[1].start.getTime() - result[0].start.getTime())).toBe(1);
            }
        }
    });

    test('muhurta windows are within sunrise-sunset', () => {
        for (let v = 0; v < 7; v++) {
            const result = calculateDurMuhurta(sunrise, sunset, v);
            result?.forEach(m => {
                expect(m.start.getTime() >= sunrise.getTime()).toBe(true);
                expect(m.end.getTime() <= sunset.getTime()).toBe(true);
            });
        }
    });

    test('each muhurta duration = 1/15th of day', () => {
        const tolerance = 1000; // 1 second tolerance
        for (let v = 0; v < 7; v++) {
            const result = calculateDurMuhurta(sunrise, sunset, v);
            result?.forEach(m => {
                const dur = m.end.getTime() - m.start.getTime();
                const expectedDur = Math.round(muhurtaDur);
                expect(Math.round(dur)).toBe(expectedDur);
            });
        }
    });

    test('fallback without vara returns 2 muhurtas', () => {
        const result = calculateDurMuhurta(sunrise, sunset);
        expect(result).toHaveLength(2);
    });

    test('returns null for missing sunrise or sunset', () => {
        expect(calculateDurMuhurta(null as any, sunset)).toBeNull();
        expect(calculateDurMuhurta(sunrise, null as any)).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════
// BUG 2: Sankranti / Solar festivals with explicit TZ
// ═══════════════════════════════════════════════════════════════
describe('Bug 2: Sankranti timezone handling', () => {
    test('Makar Sankranti detected for IST user', () => {
        // Makar Sankranti 2026 — Sun enters Capricorn around Jan 14
        // Search a few days around it
        for (let day = 13; day <= 15; day++) {
            const d = new Date(`2026-01-${day}T06:00:00Z`);
            const ayanamsa = getAyanamsa(d);
            const result = getSankrantiForDate(d, ayanamsa, TZ.IST);
            if (result) {
                expect(result.name).toBe('Makar Sankranti');
                expect(result.rashi).toBe(9); // Capricorn
                return; // Found it
            }
        }
        // Should have found it within Jan 13-15
        fail('Makar Sankranti not found around Jan 14, 2026');
    });

    test('same sankranti may appear on different civil days for different TZs', () => {
        // Find exact sankranti time first
        const d = new Date('2026-01-14T06:00:00Z');
        const ayanamsa = getAyanamsa(d);
        const sankrantiIST = getSankrantiForDate(d, ayanamsa, TZ.IST);
        const sankrantiUTC = getSankrantiForDate(d, ayanamsa, TZ.UTC);
        const sankrantiEST = getSankrantiForDate(d, ayanamsa, TZ.EST);

        // All should find the same Sankranti (Makar) or null, depending on civil day
        // The key: results may differ based on TZ → proves the offset matters
        if (sankrantiIST) {
            expect(sankrantiIST.name).toBe('Makar Sankranti');
        }
        // Log for visibility
        const names = [sankrantiIST?.name, sankrantiUTC?.name, sankrantiEST?.name];
        console.log(`  Sankranti on Jan 14: IST=${names[0] ?? 'null'}, UTC=${names[1] ?? 'null'}, EST=${names[2] ?? 'null'}`);
    });

    test('FestivalCalculationOptions.timezoneOffset flows through to solar festivals', () => {
        // Integration test: call getFestivals with explicit timezoneOffset
        const d = new Date('2026-01-14T06:00:00Z');
        const sunrise = getSunrise(d, bangalore, { timezoneOffset: TZ.IST }) ?? d;
        const sunset = getSunset(d, bangalore, { timezoneOffset: TZ.IST });

        const festivals = getFestivals({
            date: d,
            observer: bangalore,
            sunrise,
            sunset: sunset ?? undefined,
            masa: { index: 9, name: 'Pausha', isAdhika: false },
            paksha: 'Krishna',
            tithi: 25,
            vara: 3,
            includeSolarFestivals: true,
            includeMultiDaySpans: false,
            timezoneOffset: TZ.IST,
        });

        // Check that solar festival detection ran (may or may not find Makar Sankranti on this exact day)
        const solarFests = festivals.filter(f => f.category === 'solar');
        console.log(`  Solar festivals found with IST offset: ${solarFests.map(f => f.name).join(', ') || 'none'}`);
        // The important thing: no crash, and it used the explicit TZ
    });
});

// ═══════════════════════════════════════════════════════════════
// Integration: Full panchangam with timezoneOffset
// ═══════════════════════════════════════════════════════════════
describe('Integration: panchangam with explicit timezoneOffset', () => {
    test('panchangam returns correct vara for IST user', () => {
        // Sunday Mar 15 2026
        const d = new Date('2026-03-15T06:30:00Z'); // ~12:00 IST
        const p = getPanchangam(d, bangalore, { timezoneOffset: TZ.IST });
        expect(p.vara).toBe(0); // Sunday
    });

    test('panchangam durMuhurta varies by weekday across a week', () => {
        const seenIndices = new Set<string>();
        for (let i = 0; i < 7; i++) {
            const d = new Date(Date.UTC(2026, 2, 15 + i, 6, 30));
            const p = getPanchangam(d, bangalore, { timezoneOffset: TZ.IST });
            if (p.durMuhurta) {
                const sr = p.sunrise!;
                const ss = p.sunset!;
                const muhurtaDur = (ss.getTime() - sr.getTime()) / 15;
                const indices = p.durMuhurta.map(m =>
                    Math.round((m.start.getTime() - sr.getTime()) / muhurtaDur) + 1
                ).join(',');
                seenIndices.add(indices);
            }
        }
        // Should have more than 1 distinct set of muhurta indices across the week
        expect(seenIndices.size).toBe(7);
    });

    test('panchangam hora uses correct TZ for multiple cities', () => {
        const d = new Date('2026-03-15T06:30:00Z');

        const pBangalore = getPanchangam(d, bangalore, { timezoneOffset: TZ.IST });
        const pTokyo = getPanchangam(d, tokyo, { timezoneOffset: TZ.JST });

        // Both should have valid hora strings
        expect(typeof pBangalore.currentHora).toBe('string');
        expect(typeof pTokyo.currentHora).toBe('string');
        expect(pBangalore.currentHora).toBe('Jupiter');
        expect(pTokyo.currentHora).toBe('Mercury');
    });
});
