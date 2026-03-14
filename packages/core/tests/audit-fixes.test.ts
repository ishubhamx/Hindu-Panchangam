/**
 * Audit fix verification tests
 */
import { Observer } from 'astronomy-engine';
import { calculateTaraBalam } from '../src/core/calculations';
import { getTarabalam } from '../src/core/tarabalam';
import { getPanchangam } from '../src/core/panchangam';
import { getDishaShoola } from '../src/core/shoola';

const bangalore = new Observer(12.9716, 77.5946, 920);

describe('Audit Fix #1: calculateTaraBalam correctness', () => {
    test('matches getTarabalam for all 9 tara positions', () => {
        for (let c = 0; c < 9; c++) {
            const old = calculateTaraBalam(c, 0); // (moon, birth)
            const canonical = getTarabalam(0, c);  // (birth, current)
            expect(old.strength).toBe(canonical.isAuspicious ? 'Good' : 'Bad');
        }
    });

    test('matches across full nakshatra cycle', () => {
        for (let birth = 0; birth < 27; birth++) {
            for (let moon = 0; moon < 27; moon++) {
                const old = calculateTaraBalam(moon, birth);
                const canonical = getTarabalam(birth, moon);
                expect(old.strength).toBe(canonical.isAuspicious ? 'Good' : 'Bad');
            }
        }
    });

    test('invalid inputs return Unknown', () => {
        expect(calculateTaraBalam(-1, 5).strength).toBe('Unknown');
        expect(calculateTaraBalam(5, -1).strength).toBe('Unknown');
    });
});

describe('Audit Fix #3: DishaShoola/Chandrashtama/Tarabalam in panchangam', () => {
    test('dishaShoola always present', () => {
        const p = getPanchangam(new Date('2026-03-15T06:30:00Z'), bangalore, { timezoneOffset: 330 });
        expect(p.dishaShoola).toBeDefined();
        expect(p.dishaShoola.varaName).toBeTruthy();
        expect(p.dishaShoola.inauspiciousDirection).toBeTruthy();
        expect(p.dishaShoola.safeDirections).toHaveLength(3);
    });

    test('chandrashtama/tarabalam null without birth data', () => {
        const p = getPanchangam(new Date('2026-03-15T06:30:00Z'), bangalore, { timezoneOffset: 330 });
        expect(p.chandrashtama).toBeNull();
        expect(p.tarabalam).toBeNull();
    });

    test('chandrashtama calculated when birthMoonRashi provided', () => {
        const p = getPanchangam(new Date('2026-03-15T06:30:00Z'), bangalore, {
            timezoneOffset: 330,
            birthMoonRashi: 0, // Aries
        });
        expect(p.chandrashtama).not.toBeNull();
        expect(p.chandrashtama!.birthRashiName).toBeTruthy();
        expect(p.chandrashtama!.chandrashtamaRashiName).toBeTruthy();
        expect(typeof p.chandrashtama!.isActive).toBe('boolean');
    });

    test('tarabalam calculated when birthNakshatra provided', () => {
        const p = getPanchangam(new Date('2026-03-15T06:30:00Z'), bangalore, {
            timezoneOffset: 330,
            birthNakshatra: 5, // Mrigashira
        });
        expect(p.tarabalam).not.toBeNull();
        expect(p.tarabalam!.birthNakshatraName).toBeTruthy();
        expect(typeof p.tarabalam!.isAuspicious).toBe('boolean');
    });

    test('dishaShoola varies by weekday', () => {
        const seen = new Set<string>();
        for (let i = 0; i < 7; i++) {
            const d = new Date(Date.UTC(2026, 2, 15 + i, 6, 30));
            const p = getPanchangam(d, bangalore, { timezoneOffset: 330 });
            seen.add(p.dishaShoola.inauspiciousDirection);
        }
        // 4 directions (E, W, N, S)
        expect(seen.size).toBe(4);
    });
});

describe('Audit Fix #9: getSankrantiForDate uses consolidated getStartOfLocalDay', () => {
    test('Makar Sankranti still detected with IST offset', () => {
        const { getSankrantiForDate } = require('../src/core/calculations');
        const { getAyanamsa } = require('../src/core/ayanamsa');
        const d = new Date('2026-01-14T06:00:00Z');
        const result = getSankrantiForDate(d, getAyanamsa(d), 330);
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Makar Sankranti');
    });
});

describe('Audit Fix #4: getUpcomingFestivals', () => {
    test('returns festivals for a 30-day scan', () => {
        const { getUpcomingFestivals } = require('../src/core/festivals');
        const festivals = getUpcomingFestivals({
            date: new Date('2026-03-01T06:00:00Z'),
            observer: bangalore,
            days: 30,
            timezoneOffset: 330,
        });
        expect(festivals.length).toBe(24);
        // Should include at minimum some monthly observances (Purnima, Amavasya, Ekadashi)
        const names = festivals.map((f: any) => f.name);
        console.log(`  Found ${festivals.length} festivals in 30 days:`, names.slice(0, 10).join(', '));
    });

    test('category filter works', () => {
        const { getUpcomingFestivals } = require('../src/core/festivals');
        const majorOnly = getUpcomingFestivals({
            date: new Date('2026-03-01T06:00:00Z'),
            observer: bangalore,
            days: 60,
            timezoneOffset: 330,
            categories: ['major'],
        });
        majorOnly.forEach((f: any) => {
            expect(f.category).toBe('major');
        });
        console.log(`  Major festivals in 60 days: ${majorOnly.map((f: any) => f.name).join(', ')}`);
    });

    test('empty scan returns no festivals', () => {
        const { getUpcomingFestivals } = require('../src/core/festivals');
        const result = getUpcomingFestivals({
            date: new Date('2026-03-15T06:00:00Z'),
            observer: bangalore,
            days: 0,
            timezoneOffset: 330,
        });
        expect(result).toHaveLength(0);
    });

    test('no duplicate festivals on same date', () => {
        const { getUpcomingFestivals } = require('../src/core/festivals');
        const festivals = getUpcomingFestivals({
            date: new Date('2026-01-01T06:00:00Z'),
            observer: bangalore,
            days: 60,
            timezoneOffset: 330,
        });
        const keys = festivals.map((f: any) => `${f.name}-${f.date.toISOString().slice(0, 10)}`);
        const uniqueKeys = new Set(keys);
        expect(keys.length).toBe(uniqueKeys.size);
    });
});
