
import { calculateGowriPanchangam } from '../src/core/muhurta/gowri';

describe('Gowri Panchangam Real Data Validation', () => {
    // January 10, 2026, Saturday
    // Sunrise 06:45, Sunset 18:10
    const sunrise = new Date('2026-01-10T06:45:00');
    const sunset = new Date('2026-01-10T18:10:00');

    // For night validation, we need next sunrise.
    // User data implies night parts are ~102 mins? 
    // Night: 18:10 to 06:45 next day. Duration = 12h 35m = 755 mins.
    // 755 / 8 = 94.375 mins = 1h 34m 22s.
    // User intervals: 
    // 18:10 - 19:44 (94 mins)
    // 19:44 - 21:18 (94 mins)
    const nextSunrise = new Date('2026-01-11T06:45:00');

    test('January 10 2026 Saturday Day Sequence', () => {
        const result = calculateGowriPanchangam(sunrise, sunset, nextSunrise, 6); // 6 = Saturday
        const names = result.day.map(x => x.name);

        // User provided: Soram, Uthi, Visham, Amirdha, Rogam, Laabam, Dhanam, Sugam
        // Mapped to keys: Shunya, Udyoga, Visha, Amrita, Roga, Laabha, Dhana, Shubha
        const expected = ['Shunya', 'Udyoga', 'Visha', 'Amrita', 'Roga', 'Laabha', 'Dhana', 'Shubha'];

        expect(names).toEqual(expected);
    });

    test('January 10 2026 Saturday Night Sequence', () => {
        const result = calculateGowriPanchangam(sunrise, sunset, nextSunrise, 6); // 6 = Saturday
        const names = result.night.map(x => x.name);

        // User provided: Laabam, Dhanam, Sugam, Soram, Uthi, Visham, Amirdha, Soram(Rogam?)
        // Mapped to keys: Laabha, Dhana, Shubha, Shunya, Udyoga, Visha, Amrita, Roga
        const expected = ['Laabha', 'Dhana', 'Shubha', 'Shunya', 'Udyoga', 'Visha', 'Amrita', 'Roga'];

        expect(names).toEqual(expected);
    });
});
