
import { Observer } from 'astronomy-engine';
import { getKundli } from '../../core/src/kundli/index';
import { matchKundli } from '../../core/src/matching/index'

describe('Real World Kundli Matching Scenarios', () => {

    // Helper to generate Kundli
    // IMPORTANT: All birth times must be passed as UTC (with 'Z' suffix) to be
    // timezone-independent across environments (local IST vs CI Ubuntu UTC).
    // IST = UTC+5:30, so subtract 5h30m from IST time to get UTC.
    // e.g. 12:00 IST = 06:30 UTC, 07:20 IST = 01:50 UTC, 10:28 IST = 04:58 UTC
    const createRealKundli = (utcDateTimeStr: string, lat: number, lon: number) => {
        const date = new Date(utcDateTimeStr); // Must be a UTC ISO string (ends with 'Z')
        const observer = new Observer(lat, lon, 0);
        return getKundli(date, observer);
    };

    test('Case 1: Abhishek Bachchan & Aishwarya Rai', () => {
        // Abhishek: 05 Feb 1976, 12:00 IST, Mumbai (19.0760, 72.8777)
        //   -> 12:00 IST = 06:30 UTC
        const abhishek = createRealKundli('1976-02-05T06:30:00Z', 19.0760, 72.8777);

        // Aishwarya: 01 Nov 1973, 07:20 IST, Mangalore (12.9141, 74.8560)
        //   -> 07:20 IST = 01:50 UTC
        const aishwarya = createRealKundli('1973-11-01T01:50:00Z', 12.9141, 74.8560);

        const result = matchKundli(abhishek, aishwarya);
        // console.log('Abhishek-Aishwarya Dosha:', JSON.stringify(result.dosha, null, 2));

        // Expected: Score ~31
        expect(result.ashtakoot.totalScore).toBeCloseTo(31, 0);

        // Note: In strict calculation, Abhishek is Manglik (Mars in H2).
        expect(result.dosha.boy.hasDosha).toBe(true);
        expect(result.dosha.girl.hasDosha).toBe(false);
    });

    test('Case 2: Virat Kohli & Anushka Sharma', () => {
        // Virat: 05 Nov 1988, 10:28 IST, Delhi (28.6139, 77.2090)
        //   -> 10:28 IST = 04:58 UTC
        const virat = createRealKundli('1988-11-05T04:58:00Z', 28.6139, 77.2090);

        // Anushka: 01 May 1988, 12:00 IST, Ayodhya (26.7993, 82.1963)
        //   -> 12:00 IST = 06:30 UTC
        const anushka = createRealKundli('1988-05-01T06:30:00Z', 26.7993, 82.1963);

        const result = matchKundli(virat, anushka);
        // console.log('Virat-Anushka Score Breakdown:', JSON.stringify(result.ashtakoot, null, 2));

        // Expected: Score 24.5 (Browser rounded to 25)
        expect(result.ashtakoot.totalScore).toBeCloseTo(24.5, 1);
        expect(result.dosha.boy.hasDosha).toBe(true);
        expect(result.dosha.girl.hasDosha).toBe(false);
        expect(result.verdict).toMatch(/Mismatch/i);
    });

});
