import { matchKundli } from '../../core/src/matching/index';
import { Kundli } from '../../core/src/kundli/types';

// Helper to create a minimal Kundli for matching
const createKundli = (moonLon: number, marsLon: number, lagnaLon: number): Kundli => {
    return {
        birthDetails: {} as any,
        ascendant: { longitude: lagnaLon } as any,
        planets: {
            "Moon": { longitude: moonLon } as any,
            "Mars": { longitude: marsLon } as any,
            "Venus": { longitude: 0 } as any, // Irrelevant for now unless Dosha
            "Sun": { longitude: 0 } as any
        } as any,
        houses: [],
        dasha: [] as any,
        vargas: {} as any
    };
};

describe('Full Kundli Matching Integration', () => {

    test('Scenario 1: High Compatibility (Same Rashi/Nakshatra)', () => {
        // Both Aries, Ashwini.
        // Moon = 10 deg. Mars = 70 (Gemini - 3rd House, No Dosha). Lagna = 0.
        const boy = createKundli(10, 70, 0);
        const girl = createKundli(10, 70, 0);

        const result = matchKundli(boy, girl);

        // Nadi Dosha exceptions logic might trigger or not depending on implementation.
        // Nadi: Same Nakshatra (Ashwini) -> Dosha (0) typically.
        // But if Same Rashi + Same Nakshatra -> usually considered BAD in Nadi unless different Charan.
        // Our current mock logic in kootas.ts checks Same Rashi / Diff Nakshatra exception.
        // Same Rashi / Same Nakshatra is NOT an exception in our code -> Score 0.

        // Let's verify what happens.
        // Varna: 1
        // Vashya: 2
        // Tara: 3
        // Yoni: 4
        // Graha Maitri: 5
        // Gana: 6
        // Bhakoot: 7
        // Nadi: 0 (Dosha)
        // Total: 28.

        expect(result.ashtakoot.totalScore).toBe(28);
        expect(result.dosha.boy.hasDosha).toBe(false);
        expect(result.dosha.girl.hasDosha).toBe(false);
        expect(result.verdict).toContain('Good'); // > 18
    });

    test('Scenario 2: Manglik Mismatch', () => {
        // Boy: Manglik (Mars in 1st). Moon in Aries.
        const boy = createKundli(10, 10, 0); // Lagna 0, Mars 10 (Aries). Wait! Mars in Aries is Own Sign Exception!
        // Use Mars in 2nd House (Taurus) for South India / Standard check if we enabled 2nd.
        // Or Mars in 4th (Cancer). Cancer is Debilitated so acts weird? 
        // Let's use Mars in 12th House (Pisces). Lagna Aries(0). Pisces(330).
        const boyManglik = createKundli(10, 340, 0); // Mars 340 (Pisces, 12th). 

        // Girl: Non-Manglik. Moon in Aries.
        const girl = createKundli(10, 200, 0); // Mars in Libra (7th). Wait! 7th is Dosha.
        const girlNonManglik = createKundli(10, 60, 0); // Mars in Gemini (3rd) -> No Dosha.

        const result = matchKundli(boyManglik, girlNonManglik);

        expect(result.dosha.boy.hasDosha).toBe(true);
        expect(result.dosha.girl.hasDosha).toBe(false);
        expect(result.verdict).toContain('Mismatch');
    });

    test('Scenario 3: Perfect Match (Hypothetical)', () => {
        // We want a high score.
        // Different Nadi (8). Same Rashi (7 Bhakoot).
        // Same Rashi => Same Lord => 5 Maitri.
        // Same Rashi => Same Varna (1), Same Vashya (2).
        // So we need Same Rashi, Different Nakshatra.
        // Aries: Ashwini (0-13.20), Bharani (13.20-26.40).
        // Ashwini(Adi) vs Bharani(Madhya).
        // Score should be Max?
        // Tara? Ashwini(1) vs Bharani(2). 1->2 (2nd, Good). 2->1 (27th/9=0, Good). Tara=3.
        // Yoni? Ashwini(Horse) vs Bharani(Elephant).
        // Horse-Elephant: Enemies? Neutral? 
        // Yoni might lose points.

        const boy = createKundli(10, 60, 0); // Ashwini
        const girl = createKundli(20, 60, 0); // Bharani (Longitude 20)

        const result = matchKundli(boy, girl);

        // Varna: 1
        // Vashya: 2
        // Tara: 3
        // Yoni: ? (Horse vs Elephant)
        // Maitri: 5
        // Gana: Ashwini(Deva), Bharani(Manushya). Deva-Manushya = 6 or 5.
        // Bhakoot: 7 (Same Rashi)
        // Nadi: 8 (Different)

        // Total should be high.
        expect(result.ashtakoot.totalScore).toBeGreaterThan(30);
    });

});
