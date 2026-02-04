
import { calculateChoghadiya } from '../src/core/muhurta/choghadiya';

describe('Choghadiya Real Data Validation', () => {
    // June 16, 2026, Tuesday
    const sunrise = new Date('2026-06-16T05:42:00');
    const sunset = new Date('2026-06-16T18:52:00');
    // Night ends at next sunrise (approximation for verification)
    const nextSunrise = new Date('2026-06-17T05:42:00');

    test('Tuesday Day Sequence (June 16 2026)', () => {
        const result = calculateChoghadiya(sunrise, sunset, nextSunrise, 2); // 2 = Tuesday
        const names = result.day.map(x => x.name);

        // User Provided:
        // Roga, Udvega, Chara(Chal), Labha, Amrita, Kala, Shubha, Roga
        // Mapped to internal keys: Rog, Udveg, Chal, Labh, Amrit, Kaal, Shubh, Rog
        const expected = ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];

        expect(names).toEqual(expected);
    });

    test('Tuesday Night Sequence (June 16 2026)', () => {
        const result = calculateChoghadiya(sunrise, sunset, nextSunrise, 2); // 2 = Tuesday
        const names = result.night.map(x => x.name);

        // User Provided:
        // Kala, Labha, Udvega, Shubha, Amrita, Chara, Roga, Kala
        // Mapped keys: Kaal, Labh, Udveg, Shubh, Amrit, Chal, Rog, Kaal
        const expected = ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal'];

        expect(names).toEqual(expected);
    });
});
