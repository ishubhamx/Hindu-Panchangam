/**
 * Ritu (Season) verification test
 * Validates Ritu and Ayana against Drik Panchang reference data
 * 
 * Drik Panchang 2026 Season dates (tropical):
 *   Shishir (Winter):     Dec 22, 2025 → Feb 18, 2026  (270°-330°)
 *   Vasant (Spring):      Feb 18, 2026 → Apr 20, 2026  (330°-30°)
 *   Grishma (Summer):     Apr 20, 2026 → Jun 21, 2026  (30°-90°)
 *   Varsha (Monsoon):     Jun 21, 2026 → Aug 23, 2026  (90°-150°)
 *   Sharad (Autumn):      Aug 23, 2026 → Oct 23, 2026  (150°-210°)
 *   Hemant (Pre-Winter):  Oct 23, 2026 → Dec 22, 2026  (210°-270°)
 */

import { getPanchangam, getRitu, getAyana } from '../src/index';
import { Observer } from 'astronomy-engine';

// New Delhi coordinates
const lat = 28.6139;
const lng = 77.2090;
const observer = new Observer(lat, lng, 0);
const timezoneOffset = 330; // IST = UTC+5:30

function getPanch(year: number, month: number, day: number) {
    const date = new Date(Date.UTC(year, month - 1, day, 0, 30, 0)); // ~6 AM IST
    return getPanchangam(date, observer, { timezoneOffset });
}

describe('Ritu (Season) Verification', () => {

    test('Feb 15 2026 — Shishir (Winter) per Drik Panchang', () => {
        const p = getPanch(2026, 2, 15);
        console.log(`Feb 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Shishir');
        expect(p.ayana).toBe('Uttarayana');
    });

    test('Feb 17 2026 — still Shishir (Vasant starts Feb 18 9:20 PM)', () => {
        const p = getPanch(2026, 2, 17);
        console.log(`Feb 17 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Shishir');
    });

    test('Feb 19 2026 — Vasant (Spring)', () => {
        const p = getPanch(2026, 2, 19);
        console.log(`Feb 19 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Vasant');
    });

    test('Mar 15 2026 — Vasant (Spring), Uttarayana', () => {
        const p = getPanch(2026, 3, 15);
        console.log(`Mar 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Vasant');
        expect(p.ayana).toBe('Uttarayana');
    });

    test('May 15 2026 — Grishma (Summer)', () => {
        const p = getPanch(2026, 5, 15);
        console.log(`May 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Grishma');
    });

    test('Jul 15 2026 — Varsha (Monsoon), Dakshinayana', () => {
        const p = getPanch(2026, 7, 15);
        console.log(`Jul 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Varsha');
        expect(p.ayana).toBe('Dakshinayana');
    });

    test('Sep 15 2026 — Sharad (Autumn), Dakshinayana', () => {
        const p = getPanch(2026, 9, 15);
        console.log(`Sep 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Sharad');
        expect(p.ayana).toBe('Dakshinayana');
    });

    test('Nov 15 2026 — Hemant (Pre-Winter), Dakshinayana', () => {
        const p = getPanch(2026, 11, 15);
        console.log(`Nov 15 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Hemant');
        expect(p.ayana).toBe('Dakshinayana');
    });

    test('Dec 25 2026 — Shishir (Winter), Uttarayana', () => {
        const p = getPanch(2026, 12, 25);
        console.log(`Dec 25 2026: Ritu = ${p.ritu}, Ayana = ${p.ayana}`);
        expect(p.ritu).toBe('Shishir');
        expect(p.ayana).toBe('Uttarayana');
    });
});

describe('getRitu() unit tests', () => {
    test('boundary: 270° = Shishir', () => {
        expect(getRitu(270)).toBe('Shishir');
    });
    test('boundary: 329.9° = Shishir', () => {
        expect(getRitu(329.9)).toBe('Shishir');
    });
    test('boundary: 330° = Vasant', () => {
        expect(getRitu(330)).toBe('Vasant');
    });
    test('boundary: 0° = Vasant', () => {
        expect(getRitu(0)).toBe('Vasant');
    });
    test('boundary: 30° = Grishma', () => {
        expect(getRitu(30)).toBe('Grishma');
    });
    test('boundary: 90° = Varsha', () => {
        expect(getRitu(90)).toBe('Varsha');
    });
    test('boundary: 150° = Sharad', () => {
        expect(getRitu(150)).toBe('Sharad');
    });
    test('boundary: 210° = Hemant', () => {
        expect(getRitu(210)).toBe('Hemant');
    });
});

describe('getAyana() unit tests', () => {
    test('Sun at 0° = Uttarayana', () => {
        expect(getAyana(0)).toBe('Uttarayana');
    });
    test('Sun at 89° = Uttarayana', () => {
        expect(getAyana(89)).toBe('Uttarayana');
    });
    test('Sun at 90° = Dakshinayana', () => {
        expect(getAyana(90)).toBe('Dakshinayana');
    });
    test('Sun at 180° = Dakshinayana', () => {
        expect(getAyana(180)).toBe('Dakshinayana');
    });
    test('Sun at 269° = Dakshinayana', () => {
        expect(getAyana(269)).toBe('Dakshinayana');
    });
    test('Sun at 270° = Uttarayana', () => {
        expect(getAyana(270)).toBe('Uttarayana');
    });
    test('Sun at 359° = Uttarayana', () => {
        expect(getAyana(359)).toBe('Uttarayana');
    });
});
