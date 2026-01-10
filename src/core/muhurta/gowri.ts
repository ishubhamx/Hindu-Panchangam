import { GowriInterval, GowriResult, GoodBadRating } from './types';

// Gowri Panchangam has fixed sequences for each day
// Order: Money, Disease, Sorrows, Happiness, Enemy, Joy, Poison, Benefit
// Names: Dhana, Roga, Shoka, Harsha, Satru, Sukha, Visha, Labha

// Good: Dhana, Harsha, Sukha, Labha
// Bad/Neutral: Roga, Shoka, Satru, Visha

const RATINGS: Record<string, GoodBadRating> = {
    'Udyoga': 'neutral', // Sometimes called Shubha/Udyoga depending on tradition. Actually Gowri has specific keywords.
    // Let's use the standard list corresponding to Tamil/South Indian tradition usually.
    // However, common Gowri Panchang terms are:
    // Shubha, Roga, Udyoga, Laabha, Dhana, Visha, Amrita, Shunya
    // Wait, let's verify standard Gowri Panchangam keys.
    // Standard keys often used: Udyoga, Amirtha, Roga, Laabha, Dhana, Visha, Sorrows(Shunya/Shoka), Shubha
};

// Let's use the sequence mapping usually found in Drik Panchang / Apps.
// Day Sequences:
// Sun: Udyoga, Shubha, Roga, Laabha, Dhana, Visha, Amrita, Shunya
// Mon: Amrita, Shunya, Udyoga, Shubha, Roga, Laabha, Dhana, Visha
// ...
// Actually, it's easier to map the 'First' Muhurta and cycle?
// No, the cycle for Gowri is distinct for Day and Night and varies by day.
// It is 5 Good and 3 Bad.
// Good: Amrita, Shubha, Laabha, Dhana, Udyoga
// Bad: Roga, Visha, Shunya

const GOWRI_NAMES = ['Udyoga', 'Shubha', 'Roga', 'Laabha', 'Dhana', 'Visha', 'Amrita', 'Shunya'];

const GOWRI_RATINGS: Record<string, GoodBadRating> = {
    'Udyoga': 'good',
    'Shubha': 'good',
    'Roga': 'bad',
    'Laabha': 'good',
    'Dhana': 'good',
    'Visha': 'bad',
    'Amrita': 'good',
    'Shunya': 'bad'
};

const DAY_SEQUENCES: Record<number, string[]> = {
    0: ['Udyoga', 'Shubha', 'Roga', 'Laabha', 'Dhana', 'Visha', 'Amrita', 'Shunya'], // Sun
    1: ['Amrita', 'Shunya', 'Udyoga', 'Shubha', 'Roga', 'Laabha', 'Dhana', 'Visha'], // Mon
    2: ['Roga', 'Laabha', 'Dhana', 'Visha', 'Amrita', 'Shunya', 'Udyoga', 'Shubha'], // Tue
    3: ['Laabha', 'Dhana', 'Visha', 'Amrita', 'Shunya', 'Udyoga', 'Shubha', 'Roga'], // Wed
    4: ['Dhana', 'Visha', 'Amrita', 'Shunya', 'Udyoga', 'Shubha', 'Roga', 'Laabha'], // Thu
    5: ['Visha', 'Amrita', 'Shunya', 'Udyoga', 'Shubha', 'Roga', 'Laabha', 'Dhana'], // Fri
    6: ['Shunya', 'Udyoga', 'Visha', 'Amrita', 'Roga', 'Laabha', 'Dhana', 'Shubha']  // Sat (Fixed based on user verification)
};

// Night Sequence is different usually.
// Validated Sat Night sequence with user data.
const NIGHT_SEQUENCES: Record<number, string[]> = {
    0: ['Shubha', 'Amrita', 'Shunya', 'Roga', 'Visha', 'Dhana', 'Udyoga', 'Laabha'], // Sun
    1: ['Udyoga', 'Laabha', 'Shubha', 'Amrita', 'Shunya', 'Roga', 'Visha', 'Dhana'], // Mon
    2: ['Dhana', 'Udyoga', 'Laabha', 'Shubha', 'Amrita', 'Shunya', 'Roga', 'Visha'], // Tue
    3: ['Visha', 'Dhana', 'Udyoga', 'Laabha', 'Shubha', 'Amrita', 'Shunya', 'Roga'], // Wed
    4: ['Roga', 'Visha', 'Dhana', 'Udyoga', 'Laabha', 'Shubha', 'Amrita', 'Shunya'], // Thu
    5: ['Shunya', 'Roga', 'Visha', 'Dhana', 'Udyoga', 'Laabha', 'Shubha', 'Amrita'], // Fri
    6: ['Laabha', 'Dhana', 'Shubha', 'Shunya', 'Udyoga', 'Visha', 'Amrita', 'Roga']  // Sat (Fixed based on user verification)
};

function getGowriIntervals(start: Date, end: Date, sequence: string[]): GowriInterval[] {
    const totalDuration = end.getTime() - start.getTime();
    const durationPerpart = totalDuration / 8;
    const intervals: GowriInterval[] = [];

    for (let i = 0; i < 8; i++) {
        const segStart = new Date(start.getTime() + (i * durationPerpart));
        const segEnd = new Date(start.getTime() + ((i + 1) * durationPerpart));
        const name = sequence[i];

        intervals.push({
            name,
            startTime: segStart,
            endTime: segEnd,
            rating: GOWRI_RATINGS[name]
        });
    }

    return intervals;
}

export function calculateGowriPanchangam(sunrise: Date, sunset: Date, nextSunrise: Date, vara: number): GowriResult {
    const daySeq = DAY_SEQUENCES[vara];
    const dayGowri = getGowriIntervals(sunrise, sunset, daySeq);

    const nightSeq = NIGHT_SEQUENCES[vara];
    const nightGowri = getGowriIntervals(sunset, nextSunrise, nightSeq);

    return {
        day: dayGowri,
        night: nightGowri
    };
}
