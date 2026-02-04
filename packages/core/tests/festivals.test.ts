
import { getFestivals, getEkadashiName } from '../src/core/festivals';

describe('Festival Algorithms', () => {

    test('Major Festivals Detection', () => {
        // Ugadi: Chaitra (0) Shukla Prathama (1)
        expect(getFestivals(0, false, 'Shukla', 1)).toContain('Ugadi / Gudi Padwa (New Year)');

        // Rama Navami: Chaitra (0) Shukla Navami (9)
        expect(getFestivals(0, false, 'Shukla', 9)).toContain('Rama Navami');

        // Diwali: Ashwina (6) Amavasya (30)
        expect(getFestivals(6, false, 'Krishna', 30)).toContain('Diwali (Lakshmi Puja)');

        // Maha Shivaratri: Magha (10) Krishna Chaturdashi (29)
        expect(getFestivals(10, false, 'Krishna', 29)).toContain('Maha Shivaratri');
    });

    test('Ekadashi Naming', () => {
        // Vaikuntha / Mokshada Ekadashi: Margashirsha (8) Shukla (11)
        const mokshada = getFestivals(8, false, 'Shukla', 11);
        expect(mokshada).toContain('Mokshada Ekadashi');

        // Nirjala Ekadashi: Jyeshtha (2) Shukla (11)
        expect(getFestivals(2, false, 'Shukla', 11)).toContain('Nirjala Ekadashi');

        // Yogini Ekadashi: Jyeshtha (2) Krishna (26)
        expect(getFestivals(2, false, 'Krishna', 26)).toContain('Yogini Ekadashi');

        // Generic fallback check (if map is missing)
        // Testing hypothetical future month or just structure
        expect(getEkadashiName(0, 'Shukla')).toBe('Kamada Ekadashi');
    });

    test('Pradosham Detection', () => {
        // Shukla Trayodashi (13)
        expect(getFestivals(0, false, 'Shukla', 13)).toContain('Pradosham (Shukla)');

        // Krishna Trayodashi (28)
        expect(getFestivals(4, false, 'Krishna', 28)).toContain('Pradosham (Krishna)');
    });

    test('No Festivals in Adhika Masa', () => {
        // Adhika Chaitra Shukla Prathama
        // Usually no festivals
        const festivals = getFestivals(0, true, 'Shukla', 1);
        expect(festivals).toEqual([]);
    });

    test('Multiple Festivals on Same Day', () => {
        // Example: If a day is both an Ekadashi and has another event?
        // Currently rare in our list, but let's check basic array return
        const res = getFestivals(0, false, 'Shukla', 1);
        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toBeGreaterThan(0);
    });

    test('Extended Festival Coverage', () => {
        // Hanuman Jayanti: Chaitra (0) Purnima (15)
        expect(getFestivals(0, false, 'Shukla', 15)).toContain('Hanuman Jayanti');

        // Buddha Purnima: Vaishakha (1) Purnima (15)
        expect(getFestivals(1, false, 'Shukla', 15)).toContain('Buddha Purnima');

        // Nag Panchami: Shravana (4) Shukla Panchami (5)
        expect(getFestivals(4, false, 'Shukla', 5)).toContain('Nag Panchami');

        // Karwa Chauth: Ashwina (6) Krishna Chaturthi (19)
        expect(getFestivals(6, false, 'Krishna', 19)).toContain('Karwa Chauth');

        // Dhanteras: Ashwina (6) Krishna Trayodashi (28)
        expect(getFestivals(6, false, 'Krishna', 28)).toContain('Dhanteras');

        // Vasant Panchami: Magha (10) Shukla Panchami (5)
        expect(getFestivals(10, false, 'Shukla', 5)).toContain('Vasant Panchami');
    });

    test('Varalakshmi Vrat Detection', () => {
        // Shravana (4) Shukla Paksha.
        // Needs to be Friday (vara=5).
        // Tithi range check (8-15).

        // Case 1: Friday + Tithi 12 -> Should be detected
        expect(getFestivals(4, false, 'Shukla', 12, 5)).toContain('Varalakshmi Vrat (Likely)');

        // Case 2: Thursday (vara=4) + Tithi 12 -> Should NOT be detected
        expect(getFestivals(4, false, 'Shukla', 12, 4)).not.toContain('Varalakshmi Vrat (Likely)');

        // Case 3: Friday + Tithi 2 (Too early) -> Should NOT be detected
        expect(getFestivals(4, false, 'Shukla', 2, 5)).not.toContain('Varalakshmi Vrat (Likely)');
    });

});
