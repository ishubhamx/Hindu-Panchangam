export type GoodBadRating = 'good' | 'bad' | 'neutral';

export interface ChoghadiyaInterval {
    name: string; // Udveg, Amrit, etc.
    startTime: Date;
    endTime: Date;
    rating: GoodBadRating; // Helper for UI
}

export interface ChoghadiyaResult {
    day: ChoghadiyaInterval[];
    night: ChoghadiyaInterval[];
}

export interface GowriInterval {
    name: string;
    startTime: Date;
    endTime: Date;
    rating: GoodBadRating;
}

export interface GowriResult {
    day: GowriInterval[];
    night: GowriInterval[];
}
