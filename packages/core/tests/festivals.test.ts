
import { getFestivalsByTithi, getEkadashiName } from '../src/core/festivals';

describe('Festival Detection (v3.0.0 — Tithi-based)', () => {

    test('Major Festivals Detection', () => {
        // Ugadi: Chaitra (0) Shukla Prathama (1)
        expect(getFestivalsByTithi(0, false, 1, 'Shukla')).toContain('Ugadi / Gudi Padwa');

        // Rama Navami: Chaitra (0) Shukla Navami (9)
        expect(getFestivalsByTithi(0, false, 9, 'Shukla')).toContain('Rama Navami');

        // Diwali: Ashwina (6) Amavasya (30)
        expect(getFestivalsByTithi(6, false, 30, 'Krishna')).toContain('Diwali (Lakshmi Puja)');

        // Maha Shivaratri: handled as a night-festival special case in getFestivals()
        // (not in getFestivalsByTithi), so Masik Shivaratri fires instead.
        // The Maha Shivaratri sunset-based rule is tested in shivaratri-check.test.ts.
        expect(getFestivalsByTithi(10, false, 29, 'Krishna')).toContain('Masik Shivaratri');
    });

    test('Ekadashi Naming', () => {
        // Mokshada Ekadashi: Margashirsha (8) Shukla (11)
        const mokshada = getFestivalsByTithi(8, false, 11, 'Shukla');
        expect(mokshada).toContain('Mokshada Ekadashi');

        // Nirjala Ekadashi: Jyeshtha (2) Shukla (11)
        expect(getFestivalsByTithi(2, false, 11, 'Shukla')).toContain('Nirjala Ekadashi');

        // Yogini Ekadashi: Jyeshtha (2) Krishna (26)
        expect(getFestivalsByTithi(2, false, 26, 'Krishna')).toContain('Yogini Ekadashi');

        // getEkadashiName direct test
        expect(getEkadashiName(0, 'Shukla')).toBe('Kamada Ekadashi');
    });

    test('Pradosham Detection', () => {
        // Shukla Trayodashi (13)
        expect(getFestivalsByTithi(0, false, 13, 'Shukla')).toContain('Pradosham (Shukla)');

        // Krishna Trayodashi (28)
        expect(getFestivalsByTithi(4, false, 28, 'Krishna')).toContain('Pradosham (Krishna)');
    });

    test('No Festivals in Adhika Masa', () => {
        const festivals = getFestivalsByTithi(0, true, 1, 'Shukla');
        expect(festivals).toEqual([]);
    });

    test('Multiple Festivals on Same Day', () => {
        // Chaitra Shukla Prathama has Ugadi + Navratri Ghatasthapana
        const res = getFestivalsByTithi(0, false, 1, 'Shukla');
        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toBeGreaterThan(1);
        expect(res).toContain('Ugadi / Gudi Padwa');
        expect(res).toContain('Chaitra Navratri Ghatasthapana');
    });

    test('Extended Festival Coverage', () => {
        // Hanuman Jayanti: Chaitra (0) Purnima (15)
        expect(getFestivalsByTithi(0, false, 15, 'Shukla')).toContain('Hanuman Jayanti');

        // Buddha Purnima: Vaishakha (1) Purnima (15)
        expect(getFestivalsByTithi(1, false, 15, 'Shukla')).toContain('Buddha Purnima');

        // Nag Panchami: Shravana (4) Shukla Panchami (5)
        expect(getFestivalsByTithi(4, false, 5, 'Shukla')).toContain('Nag Panchami');

        // Karwa Chauth: Ashwina (6) Krishna Chaturthi (19)
        expect(getFestivalsByTithi(6, false, 19, 'Krishna')).toContain('Karwa Chauth');

        // Dhanteras: Ashwina (6) Krishna Trayodashi (28)
        expect(getFestivalsByTithi(6, false, 28, 'Krishna')).toContain('Dhanteras');

        // Vasant Panchami: Magha (10) Shukla Panchami (5)
        expect(getFestivalsByTithi(10, false, 5, 'Shukla')).toContain('Vasant Panchami');
    });

    test('Holi Detection', () => {
        // Holika Dahan is on Phalguna Purnima (tithi 15)
        expect(getFestivalsByTithi(11, false, 15, 'Shukla')).toContain('Holika Dahan');
        // Holi (color festival) is on Krishna Pratipada (tithi 16) in Phalguna
        expect(getFestivalsByTithi(11, false, 16, 'Krishna')).toContain('Holi');
    });

    test('Ganesh Chaturthi Detection', () => {
        expect(getFestivalsByTithi(5, false, 4, 'Shukla')).toContain('Ganesh Chaturthi');
    });

    test('Krishna Janmashtami Detection', () => {
        expect(getFestivalsByTithi(4, false, 23, 'Krishna')).toContain('Krishna Janmashtami');
    });

    test('Raksha Bandhan Detection', () => {
        expect(getFestivalsByTithi(4, false, 15, 'Shukla')).toContain('Raksha Bandhan');
    });

    test('Navaratri & Dussehra Detection', () => {
        expect(getFestivalsByTithi(6, false, 1, 'Shukla')).toContain('Navaratri Ghatasthapana');
        expect(getFestivalsByTithi(6, false, 8, 'Shukla')).toContain('Durga Ashtami (Maha Ashtami)');
        expect(getFestivalsByTithi(6, false, 10, 'Shukla')).toContain('Vijaya Dashami (Dussehra)');
    });

    test('Diwali Week Detection', () => {
        expect(getFestivalsByTithi(6, false, 28, 'Krishna')).toContain('Dhanteras');
        expect(getFestivalsByTithi(6, false, 29, 'Krishna')).toContain('Naraka Chaturdashi (Choti Diwali)');
        expect(getFestivalsByTithi(6, false, 30, 'Krishna')).toContain('Diwali (Lakshmi Puja)');
        expect(getFestivalsByTithi(7, false, 1, 'Shukla')).toContain('Govardhan Puja');
        expect(getFestivalsByTithi(7, false, 2, 'Shukla')).toContain('Bhai Dooj');
    });

    test('No Duplicate Festival Names', () => {
        // Verify no festival appears twice for any given tithi
        // (These were previously duplicated in the MINOR FESTIVALS section)
        const testCases = [
            { masa: 1, tithi: 7, paksha: 'Shukla' },   // Ganga Saptami
            { masa: 2, tithi: 30, paksha: 'Krishna' },  // Vat Savitri
            { masa: 2, tithi: 15, paksha: 'Shukla' },   // Vat Purnima
            { masa: 2, tithi: 10, paksha: 'Shukla' },   // Ganga Dussehra
            { masa: 4, tithi: 3, paksha: 'Shukla' },    // Hariyali Teej
            { masa: 4, tithi: 5, paksha: 'Shukla' },    // Nag Panchami
        ];

        for (const { masa, tithi, paksha } of testCases) {
            const festivals = getFestivalsByTithi(masa, false, tithi, paksha);
            const uniqueNames = new Set(festivals);
            expect(festivals.length).toBe(uniqueNames.size);
        }
    });

});
