import { checkMangalDosha } from '../../core/src/index';
import { Kundli } from '../../core/src/kundli/types'

// Helper to create a mock Kundli with specific positions
const createMockKundli = (marsLon: number, lagnaLon: number, moonLon: number, venusLon: number): Kundli => {
    return {
        birthDetails: {} as any,
        ascendant: { longitude: lagnaLon } as any,
        planets: {
            "Mars": { longitude: marsLon } as any,
            "Moon": { longitude: moonLon } as any,
            "Venus": { longitude: venusLon } as any,
            // Fillers to avoid errors if logic accesses others (it shouldn't)
            "Sun": { longitude: 0 } as any
        } as any,
        houses: [],
        dasha: [] as any,
        vargas: {} as any
    };
};

describe('Mangal Dosha Checks', () => {

    // --- 1. Standard Dosha (Lagna) ---
    test('Mars in 1st House from Lagna -> Dosha (High)', () => {
        // Lagna: 0 (Aries). Mars: 10 (Aries).
        // Wait, Aries is Own Sign! Exception will trigger.
        // Let's use Taurus (30) Lagna. Mars in Taurus (35).
        // Mars in Taurus is not Own/Exalted.
        const k = createMockKundli(35, 30, 180, 180);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(true);
        expect(res.isHigh).toBe(true);
        expect(res.description).toContain('Lagna');
    });

    test('Mars in 7th House from Lagna -> Dosha (High)', () => {
        // Lagna: 0 (Aries). Mars: 190 (Libra). 
        // 7th House. Mars in Libra is Neutral.
        const k = createMockKundli(190, 0, 90, 90);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(true);
        expect(res.isHigh).toBe(true);
    });

    // --- 2. Moon/Venus Dosha ---
    test('Mars in 7th House from Moon -> Dosha (Low/Moderate)', () => {
        // Lagna: 0. Mars: 60 (Gemini, 3rd House - No Lagna Dosha).
        // Moon: 250 (Sagittarius). 7th from Sag is Gemini.
        // So Mars is 7th from Moon.
        const k = createMockKundli(60, 0, 245, 100);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(true);
        expect(res.isHigh).toBe(false); // Only Moon Dosha
        expect(res.description).toContain('Moon');
    });

    // --- 3. Exceptions ---
    test('EXCEPTION: Mars in Own Sign (Aries) -> Cancelled', () => {
        // Lagna: 0 (Aries). Mars: 10 (Aries).
        // 1st House (Dosha). But Mars is in Aries (Own Sign).
        const k = createMockKundli(10, 0, 100, 100);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(false);
        expect(res.description).toContain('Cancelled');
        expect(res.description).toContain('Own/Exalted');
    });

    test('EXCEPTION: Mars in Own Sign (Scorpio) -> Cancelled', () => {
        // Lagna: 210 (Scorpio). Mars: 220 (Scorpio).
        // 1st House. Mars in Scorpio.
        const k = createMockKundli(220, 210, 0, 0);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(false);
        expect(res.description).toContain('Cancelled');
    });

    test('EXCEPTION: Mars Exalted (Capricorn) -> Cancelled', () => {
        // Lagna: 270 (Capricorn). Mars: 280 (Capricorn).
        // 1st House. Mars Exalted.
        const k = createMockKundli(280, 270, 0, 0);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(false);
        expect(res.description).toContain('Cancelled');
    });

    // --- 4. No Dosha ---
    test('Mars in 3rd House -> No Dosha', () => {
        // Lagna: 0. Mars: 70 (Gemini).
        const k = createMockKundli(70, 0, 10, 10);
        const res = checkMangalDosha(k);
        expect(res.hasDosha).toBe(false);
        expect(res.description).toBe("No Mangal Dosha");
    });
});
