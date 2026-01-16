import { calculateChoghadiya } from '../src/core/muhurta/choghadiya';
import { calculateGowriPanchangam } from '../src/core/muhurta/gowri';

describe('Advanced Muhurta Tests', () => {
    // Mock Data
    const sunrise = new Date('2024-01-01T06:00:00');
    const sunset = new Date('2024-01-01T18:00:00'); // 12 hours exactly
    const nextSunrise = new Date('2024-01-02T06:00:00'); // 12 hours night

    // Monday (Jan 1 2024 was Monday)
    const vara = 1;

    test('Choghadiya Calculation Basic Constraints', () => {
        const result = calculateChoghadiya(sunrise, sunset, nextSunrise, vara);

        // Check Day
        expect(result.day).toHaveLength(8);
        const dayDuration = sunset.getTime() - sunrise.getTime();
        const singlePart = dayDuration / 8;

        result.day.forEach((interval, index) => {
            const duration = interval.endTime.getTime() - interval.startTime.getTime();
            expect(duration).toBeCloseTo(singlePart, -1);
            if (index > 0) {
                expect(interval.startTime).toEqual(result.day[index - 1].endTime);
            }
        });

        // Check Night
        expect(result.night).toHaveLength(8);
        const nightDuration = nextSunrise.getTime() - sunset.getTime();
        const singleNightPart = nightDuration / 8;

        result.night.forEach((interval, index) => {
            const duration = interval.endTime.getTime() - interval.startTime.getTime();
            expect(duration).toBeCloseTo(singleNightPart, -1);
        });
    });

    test('Choghadiya Sequence for Monday', () => {
        // Monday Day: Starts with Amrit
        // Sequence: Amrit, Kaal, Rog, Shubh, Udveg, Chal, Labh, Amrit
        const result = calculateChoghadiya(sunrise, sunset, nextSunrise, 1);

        const dayNames = result.day.map(x => x.name);
        expect(dayNames).toEqual(['Amrit', 'Kaal', 'Rog', 'Shubh', 'Udveg', 'Chal', 'Labh', 'Amrit']);

        // Monday Night: Starts with Chal (based on my mapping)
        // Wait, let's verify my mapping in code: Monday(1) -> 'Chal'
        // Sequence: Chal, Labh, Amrit, Kaal, Rog, Shubh, Udveg, Chal
        const nightNames = result.night.map(x => x.name);
        expect(nightNames).toEqual(['Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal']);
    });

    test('Gowri Panchangam Sequence for Monday', () => {
        // Monday Day: Amrita, Shunya, Udyoga, Shubha, Roga, Laabha, Dhana, Visha
        const result = calculateGowriPanchangam(sunrise, sunset, nextSunrise, 1);
        const dayNames = result.day.map(x => x.name);
        expect(dayNames).toEqual(['Amrita', 'Shunya', 'Udyoga', 'Shubha', 'Roga', 'Laabha', 'Dhana', 'Visha']);

        // Monday Night: Udyoga, Laabha, Shubha, Amrita, Shunya, Roga, Visha, Dhana
        const nightNames = result.night.map(x => x.name);
        expect(nightNames).toEqual(['Udyoga', 'Laabha', 'Shubha', 'Amrita', 'Shunya', 'Roga', 'Visha', 'Dhana']);
    });

});
