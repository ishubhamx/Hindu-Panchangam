
import { Observer } from 'astronomy-engine';
import { getKundli } from '../../kundli/index';
import { matchKundli } from '../index';

describe('Real World Kundli Matching Scenarios', () => {

    // Helper to generate Kundli
    const createRealKundli = (dateStr: string, timeStr: string, lat: number, lon: number) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        const observer = new Observer(lat, lon, 0);
        return getKundli(date, observer);
    };

    test('Case 1: Abhishek Bachchan & Aishwarya Rai', () => {
        // Abhishek: 05 Feb 1976, 12:00, Mumbai (19.0760, 72.8777)
        const abhishek = createRealKundli('1976-02-05', '12:00', 19.0760, 72.8777);

        // Aishwarya: 01 Nov 1973, 07:20, Mangalore (12.9141, 74.8560)
        const aishwarya = createRealKundli('1973-11-01', '07:20', 12.9141, 74.8560);

        const result = matchKundli(abhishek, aishwarya);
        console.log('Abhishek-Aishwarya Dosha:', JSON.stringify(result.dosha, null, 2));

        // Expected: Score ~31
        expect(result.ashtakoot.totalScore).toBeCloseTo(31, 0);

        // Note: In strict calculation (Test), Abhishek is Manglik (Mars in H2).
        // Browser might have used settings that ignore H2 or different Ayanamsa/Lagna.
        expect(result.dosha.boy.hasDosha).toBe(true);
        expect(result.dosha.girl.hasDosha).toBe(false);
    });

    test('Case 2: Virat Kohli & Anushka Sharma', () => {
        // Virat: 05 Nov 1988, 10:28, Delhi (28.6139, 77.2090)
        const virat = createRealKundli('1988-11-05', '10:28', 28.6139, 77.2090);

        // Anushka: 01 May 1988, 12:00, Ayodhya (26.7993, 82.1963)
        const anushka = createRealKundli('1988-05-01', '12:00', 26.7993, 82.1963);

        const result = matchKundli(virat, anushka);
        // console.log('Virat-Anushka Score Breakdown:', JSON.stringify(result.ashtakoot, null, 2));

        // Expected: Score 24.5 (Browser rounded to 25)
        expect(result.ashtakoot.totalScore).toBeCloseTo(24.5, 1);
        expect(result.dosha.boy.hasDosha).toBe(true);
        expect(result.dosha.girl.hasDosha).toBe(false);
        expect(result.verdict).toMatch(/Mismatch/i);
    });

});
