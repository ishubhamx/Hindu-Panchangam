/**
 * Phase 1 Features Test Suite
 * Tests for Disha Shoola, Chandrashtama, and Tarabalam
 */

import { getDishaShoola, isDirectionSafe } from '../src/core/shoola';
import { getChandrashtama, getChandrashtamaRashi } from '../src/core/chandrashtama';
import { getTarabalam, getAuspiciousNakshatras } from '../src/core/tarabalam';

describe('Disha Shoola', () => {
    test('Sunday should avoid West direction', () => {
        const shoola = getDishaShoola(0);
        expect(shoola.varaName).toBe('Sunday');
        expect(shoola.inauspiciousDirection).toBe('West');
        expect(shoola.safeDirections).toEqual(['East', 'North', 'South']);
    });

    test('Monday should avoid East direction', () => {
        const shoola = getDishaShoola(1);
        expect(shoola.varaName).toBe('Monday');
        expect(shoola.inauspiciousDirection).toBe('East');
        expect(shoola.safeDirections).toEqual(['West', 'North', 'South']);
    });

    test('Tuesday should avoid North direction', () => {
        const shoola = getDishaShoola(2);
        expect(shoola.inauspiciousDirection).toBe('North');
    });

    test('Wednesday should avoid North direction', () => {
        const shoola = getDishaShoola(3);
        expect(shoola.inauspiciousDirection).toBe('North');
    });

    test('Thursday should avoid South direction', () => {
        const shoola = getDishaShoola(4);
        expect(shoola.inauspiciousDirection).toBe('South');
    });

    test('Friday should avoid West direction', () => {
        const shoola = getDishaShoola(5);
        expect(shoola.inauspiciousDirection).toBe('West');
    });

    test('Saturday should avoid East direction', () => {
        const shoola = getDishaShoola(6);
        expect(shoola.inauspiciousDirection).toBe('East');
    });

    test('isDirectionSafe should return correct results', () => {
        expect(isDirectionSafe(0, 'West')).toBe(false);  // Sunday, West is bad
        expect(isDirectionSafe(0, 'East')).toBe(true);   // Sunday, East is safe
        expect(isDirectionSafe(1, 'East')).toBe(false);  // Monday, East is bad
    });
});

describe('Chandrashtama', () => {
    test('8th house from Aries is Scorpio', () => {
        expect(getChandrashtamaRashi(0)).toBe(7);  // Aries (0) → Scorpio (7)
    });

    test('8th house from Taurus is Sagittarius', () => {
        expect(getChandrashtamaRashi(1)).toBe(8);  // Taurus (1) → Sagittarius (8)
    });

    test('8th house from Leo is Pisces', () => {
        expect(getChandrashtamaRashi(4)).toBe(11); // Leo (4) → Pisces (11)
    });

    test('8th house from Virgo wraps to Aries', () => {
        expect(getChandrashtamaRashi(5)).toBe(0);  // Virgo (5) → Aries (0)
    });

    test('Chandrashtama is active when Moon in 8th', () => {
        const info = getChandrashtama(0, 7);  // Birth: Aries, Current: Scorpio
        expect(info.isActive).toBe(true);
        expect(info.birthRashiName).toBe('Aries');
        expect(info.chandrashtamaRashiName).toBe('Scorpio');
    });

    test('Chandrashtama is inactive when Moon not in 8th', () => {
        const info = getChandrashtama(0, 5);  // Birth: Aries, Current: Virgo
        expect(info.isActive).toBe(false);
    });
});

describe('Tarabalam', () => {
    test('Same Nakshatra is Janma Tara (1) - inauspicious', () => {
        const tara = getTarabalam(0, 0);  // Ashwini to Ashwini
        expect(tara.taraNumber).toBe(1);
        expect(tara.taraName).toBe('Janma');
        expect(tara.isAuspicious).toBe(false);
    });

    test('Next Nakshatra is Sampat Tara (2) - auspicious', () => {
        const tara = getTarabalam(0, 1);  // Ashwini to Bharani
        expect(tara.taraNumber).toBe(2);
        expect(tara.taraName).toBe('Sampat');
        expect(tara.isAuspicious).toBe(true);
    });

    test('3rd Nakshatra is Vipat Tara (3) - inauspicious', () => {
        const tara = getTarabalam(0, 2);  // Ashwini to Krittika
        expect(tara.taraNumber).toBe(3);
        expect(tara.taraName).toBe('Vipat');
        expect(tara.isAuspicious).toBe(false);
    });

    test('9th Nakshatra is Parama Mitra (9) - auspicious', () => {
        const tara = getTarabalam(0, 8);  // Ashwini (0) to Ashlesha (8) = 9th star
        expect(tara.taraNumber).toBe(9);
        expect(tara.taraName).toBe('Parama Mitra');
        expect(tara.isAuspicious).toBe(true);
    });

    test('10th Nakshatra wraps to Janma (1)', () => {
        const tara = getTarabalam(0, 9);  // Ashwini to Magha = 10th star → 10 % 9 = 1
        expect(tara.taraNumber).toBe(1);
        expect(tara.taraName).toBe('Janma');
    });

    test('Wrap around from Revati to Ashwini', () => {
        const tara = getTarabalam(26, 0);  // Revati (26) to Ashwini (0) = 2nd star
        expect(tara.taraNumber).toBe(2);
        expect(tara.taraName).toBe('Sampat');
    });

    test('getAuspiciousNakshatras returns correct count', () => {
        const auspicious = getAuspiciousNakshatras(0);
        // Taras 2,4,6,8,9 are auspicious (5 out of 9), 3 cycles in 27 = 15 auspicious
        expect(auspicious.length).toBe(15);
    });
});
