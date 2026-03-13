/**
 * Post-fix Bug Verification — confirms all 3 bugs are resolved
 */

import { Observer, Body, GeoVector, Ecliptic as EclipticFunc } from 'astronomy-engine';
import {
    getPaksha, getCurrentHora, calculateDurMuhurta, getVara, getSunrise
} from '../src/core/calculations';

const IST_OFFSET = 330; // minutes
const bangalore = new Observer(12.9716, 77.5946, 920);

describe('Bug Fixes', () => {
    // ── Bug 2: festivals.ts timezone ──
    // This is a structural fix (code inspection), tested via the type system:
    // FestivalCalculationOptions now has timezoneOffset, and getSolarFestivals uses it.
    test('BUG 2: FestivalCalculationOptions accepts timezoneOffset', () => {
        // Type-level check: import the type and ensure it compiles
        const opts: import('../src/types/festivals').FestivalCalculationOptions = {
            date: new Date(),
            observer: bangalore,
            sunrise: new Date(),
            masa: { index: 0, name: 'Chaitra', isAdhika: false },
            paksha: 'Shukla',
            tithi: 1,
            timezoneOffset: IST_OFFSET, // ← this field now exists
        };
        expect(opts.timezoneOffset).toBe(330);
    });

    // ── Bug 3: getVara / getCurrentHora timezone ──
    test('BUG 3: getVara with explicit TZ gives correct weekday near midnight', () => {
        // 00:10 IST on Mar 15, 2026 (Sunday) = 2026-03-14T18:40:00Z
        const nearMidnightIST = new Date('2026-03-14T18:40:00Z');

        // Without explicit TZ (longitude-derived): was returning Saturday (6)
        const varaLongitude = getVara(nearMidnightIST, bangalore);

        // With explicit IST: should return Sunday (0)
        const varaExplicit = getVara(nearMidnightIST, bangalore, IST_OFFSET);
        
        // Correct answer: at 00:10 IST Mar 15 → Sunday = 0
        expect(varaExplicit).toBe(0);
        // The longitude-based one returns 6 (Saturday) — confirms the 20min error
        expect(varaLongitude).toBe(6);
    });

    test('BUG 3: getCurrentHora uses explicit TZ for correct hora lord', () => {
        const sunrise = getSunrise(new Date('2026-03-15T00:00:00Z'), bangalore, { timezoneOffset: IST_OFFSET });
        expect(sunrise).not.toBeNull();

        if (sunrise) {
            // Just after sunrise on Sunday — first hora should be Sun
            const justAfterSunrise = new Date(sunrise.getTime() + 5 * 60 * 1000); // 5min after
            const hora = getCurrentHora(justAfterSunrise, sunrise, bangalore, IST_OFFSET);
            expect(hora).toBe('Sun'); // Sunday's first hora lord = Sun
        }
    });

    // ── Bug 5: calculateDurMuhurta weekday-specific ──
    test('BUG 5: calculateDurMuhurta returns different muhurtas per weekday', () => {
        const sunrise = new Date('2026-03-15T00:50:00Z');
        const sunset = new Date('2026-03-15T12:30:00Z');
        const dayDur = sunset.getTime() - sunrise.getTime();
        const muhurtaDur = dayDur / 15;

        const getIndices = (vara: number) => {
            const result = calculateDurMuhurta(sunrise, sunset, vara);
            return result?.map(m => Math.round((m.start.getTime() - sunrise.getTime()) / muhurtaDur) + 1);
        };

        // Sunday: [10, 14]
        expect(getIndices(0)).toEqual([10, 14]);
        // Monday: [2, 8]
        expect(getIndices(1)).toEqual([2, 8]);
        // Tuesday: [4, 10]
        expect(getIndices(2)).toEqual([4, 10]);
        // Wednesday: [8, 12]
        expect(getIndices(3)).toEqual([8, 12]);
        // Thursday: [2, 10]
        expect(getIndices(4)).toEqual([2, 10]);
        // Friday: [4, 6]
        expect(getIndices(5)).toEqual([4, 6]);
        // Saturday: [6, 14]
        expect(getIndices(6)).toEqual([6, 14]);

        // Without vara — fallback
        const noVara = calculateDurMuhurta(sunrise, sunset);
        expect(noVara?.length).toBe(2);
    });
});
