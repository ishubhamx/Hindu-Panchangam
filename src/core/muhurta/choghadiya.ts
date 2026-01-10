import { ChoghadiyaInterval, ChoghadiyaResult, GoodBadRating } from './types';

const CHOGHADIYA_ORDER = ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Rog', 'Shubh'];

const RATINGS: Record<string, GoodBadRating> = {
    'Udveg': 'bad',
    'Chal': 'neutral',
    'Labh': 'good',
    'Amrit': 'good',
    'Kaal': 'bad',
    'Rog': 'bad',
    'Shubh': 'good'
};

const DAY_SEQUENCES: Record<number, string[]> = {
    0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Rog', 'Shubh', 'Udveg'], // Sun
    1: ['Amrit', 'Kaal', 'Rog', 'Shubh', 'Udveg', 'Chal', 'Labh', 'Amrit'], // Mon
    2: ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],   // Tue
    3: ['Labh', 'Amrit', 'Kaal', 'Rog', 'Shubh', 'Udveg', 'Chal', 'Labh'],   // Wed
    4: ['Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh'],   // Thu
    5: ['Chal', 'Labh', 'Amrit', 'Kaal', 'Rog', 'Shubh', 'Udveg', 'Chal'],   // Fri
    6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal']    // Sat
};

const NIGHT_SEQUENCES: Record<number, string[]> = {
    0: ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
    1: ['Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal'],  // Mon
    2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal'],   // Tue
    3: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg'],  // Wed
    4: ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],  // Thu
    5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog'],    // Fri
    6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh']    // Sat
};

function getIntervals(start: Date, end: Date, sequence: string[]): ChoghadiyaInterval[] {
    const totalDuration = end.getTime() - start.getTime();
    const durationPerpart = totalDuration / 8;
    const intervals: ChoghadiyaInterval[] = [];

    for (let i = 0; i < 8; i++) {
        const segStart = new Date(start.getTime() + (i * durationPerpart));
        const segEnd = new Date(start.getTime() + ((i + 1) * durationPerpart));
        const name = sequence[i];

        intervals.push({
            name,
            startTime: segStart,
            endTime: segEnd,
            rating: RATINGS[name]
        });
    }

    return intervals;
}

export function calculateChoghadiya(sunrise: Date, sunset: Date, nextSunrise: Date, vara: number): ChoghadiyaResult {
    const daySeq = DAY_SEQUENCES[vara];
    const dayChoghadiya = getIntervals(sunrise, sunset, daySeq);

    const nightSeq = NIGHT_SEQUENCES[vara];
    const nightChoghadiya = getIntervals(sunset, nextSunrise, nightSeq);

    return {
        day: dayChoghadiya,
        night: nightChoghadiya
    };
}
