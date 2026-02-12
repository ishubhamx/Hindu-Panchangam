import {
    calculateVarna, calculateVashya, calculateTara, calculateYoni,
    calculateGrahaMaitri, calculateGana, calculateBhakoot, calculateNadi
} from '../kootas';

describe('Ashtakoota Matching', () => {

    // --- 1. Varna (Work/Ego) ---
    describe('Varna Koota', () => {
        // Rashi Indices: Cancer(3)=Brahmin, Leo(4)=Kshatriya
        test('Boy Higher Varna (Brahmin vs Kshatriya) -> 1', () => {
            const res = calculateVarna(3, 4); // Cancer(BH) vs Leo(KS)
            expect(res.score).toBe(1);
        });

        test('Girl Higher Varna (Kshatriya vs Brahmin) -> 0', () => {
            const res = calculateVarna(4, 3); // Leo(KS) vs Cancer(BH)
            expect(res.score).toBe(0);
        });
    });

    // --- 2. Vashya (Dominance) ---
    describe('Vashya Koota', () => {
        // Leo(4)=Vanchar, Virgo(5)=Manav
        test('Vanchar vs Manav -> 0', () => {
            const res = calculateVashya(4, 5);
            expect(res.score).toBe(0);
        });

        // Gemini(2)=Manav, Virgo(5)=Manav
        test('Manav vs Manav -> 2', () => {
            const res = calculateVashya(2, 5);
            expect(res.score).toBe(2);
        });
    });

    // --- 3. Tara (Destiny) ---
    describe('Tara Koota', () => {
        // Ashwini(0), Bharani(1)
        test('Ashwini vs Bharani -> 1.5 or 3 depending on logic', () => {
            const res = calculateTara(0, 1);
            // Count G->B (1->0) = 27. 27%9=0 (Good).
            // Count B->G (0->1) = 2. 2 is Good.
            // Both Good = 3.
            expect(res.score).toBe(3);
        });
    });

    // --- 4. Yoni (Sexual) ---
    describe('Yoni Koota', () => {
        test('Same Yoni -> 4', () => {
            // Ashwini(0) is Horse. Satabhisha(23) is Horse.
            const res = calculateYoni(0, 23);
            expect(res.score).toBe(4);
        });

        test('Enemy Yoni -> Less than 4', () => {
            // Ashwini(Horse) vs Mahish(Buffalo-Swati/Hasta)
            // Swati(14) is Buffalo.
            const res = calculateYoni(0, 14);
            expect(res.score).toBeLessThan(4);
        });
    });

    // --- 5. Graha Maitri (Mental) ---
    describe('Graha Maitri', () => {
        test('Friends (Sun-Moon) -> 5', () => {
            // Leo(4, Sun) vs Cancer(3, Moon)
            const res = calculateGrahaMaitri(4, 3);
            expect(res.score).toBe(5);
        });

        test('Enemies (Sun-Saturn) -> 0 or 0.5 or 1', () => {
            // Leo(4, Sun) vs Capricorn(9, Saturn)
            // Sun treats Saturn as Enemy. Saturn treats Sun as Enemy.
            // 0 points.
            const res = calculateGrahaMaitri(4, 9);
            expect(res.score).toBe(0);
        });
    });

    // --- 6. Gana (Temperament) ---
    describe('Gana Koota', () => {
        test('Same Gana (Deva-Deva) -> 6', () => {
            // Ashwini(0) Deva vs Pushya(7) Deva
            const res = calculateGana(0, 7);
            expect(res.score).toBe(6);
        });

        test('Rakshasa vs Deva -> 0 (Gana Dosha)', () => {
            // Ashwini(0) Deva vs Krittika(2) Rakshasa
            const res = calculateGana(2, 0); // Boy Rakshasa, Girl Deva
            expect(res.score).toBe(0);
        });
    });

    // --- 7. Bhakoot (Love) ---
    describe('Bhakoot Koota', () => {
        test('1-1 (Same Sign) -> 7', () => {
            const res = calculateBhakoot(0, 0);
            expect(res.score).toBe(7);
        });

        test('6-8 (Shadashtak) -> 0', () => {
            // Aries(0) vs Virgo(5). Distance 6.
            const res = calculateBhakoot(0, 5);
            expect(res.score).toBe(0);
        });

        test('EXCEPTION: Same Lord cancels Dosha (Aries-Scorpio)', () => {
            // Aries(0, Mars) vs Scorpio(7, Mars).
            // Position is 8 (1->8). This is 6-8 relationship?
            // Count Aries to Scorpio = 8.
            // Count Scorpio to Aries = 6. 
            // It IS a 6-8 relationship.
            // But both lords are Mars.
            const res = calculateBhakoot(0, 7);
            expect(res.score).toBe(7);
            expect(res.description).toContain('Exception');
        });
    });

    // --- 8. Nadi (Health) ---
    describe('Nadi Koota', () => {
        test('Different Nadi -> 8', () => {
            // Ashwini(0, Adi) vs Bharani(1, Madhya)
            const res = calculateNadi(0, 1);
            expect(res.score).toBe(8);
        });

        test('Same Nadi -> 0 (Dosha)', () => {
            // Ashwini(0, Adi) vs Ardra(5, Adi)
            const res = calculateNadi(0, 5);
            expect(res.score).toBe(0);
        });

        test('EXCEPTION: Same Rashi, Different Nakshatra', () => {
            // Both in Taurus (Rashi Index 1).
            // Krittika (2, Antya) vs Rohini (3, Antya).
            // Wait, Krittika is Antya? Let's check logic or constants.
            // Ideally if they have Same Nadi but share Rashi, it should be exception.

            // Let's assume Nadi 2 and Nadi 3 are same class for this test.
            // If logic relies on Nadi constants, we need to pick two Nakshatras 
            // that ARE same Nadi but CAN fall in same Rashi.

            // Gemini: Mrigashira (3,4) + Ardra (1-4) + Punarvasu (1-3)
            // Mrigashira (Madhya), Ardra (Adi), Punarvasu (Adi).
            // Ardra and Punarvasu are both Adi?
            // Let's force a "Same Nadi" case.

            // This test depends on NADI constants.
            // If we pass same Nadi Nakshatras, but include Rashi, it should cancel.

            // Passing fictional Same Nadi Nakshatras 0 and 100 (if 100 was same Nadi) logic
            // But we can just use the function signature with Rashi.

            // Force same nadi in mock if needed, but integration test uses real data. 
            // Let's try Krittika (2) vs Uttara Phalguni (11)? No, different Rashis.

            // Let's trust the logic: calculateNadi(nak1, nak2, rashi1, rashi2)
            // If nak1/nak2 have same Nadi, score 0.
            // But if rashi1 == rashi2, and nak1 != nak2, score 8.

            // We need two nakshatras that share a Nadi.
            // Let's pick 0 (Ashwini-Adi) and 5 (Ardra-Adi)?
            // If we say both are in Aries (hypothetically), exception should trigger.
            // (Even if physically impossible, we test the *logic*).

            const res = calculateNadi(0, 5, 0, 0); // Same Rashi (0), Diff Nakshatra
            expect(res.score).toBe(8);
            expect(res.description).toContain('Exception');
        });
    });

});
