import { Kundli } from "../kundli/types";

export interface MatchingInput {
    boy: Kundli;
    girl: Kundli;
}

export interface KootaResult {
    name: string;      // e.g., "Varna", "Vashya"
    score: number;     // e.g., 1
    maxScore: number;  // e.g., 1
    description: string; // e.g., "Brahmin - Kshatriya (Good)"
    area: string;      // e.g., "Work/Ego Compatibility"
}

export interface DoshaResult {
    hasDosha: boolean;
    isHigh: boolean;
    description: string;
}

export interface MatchResult {
    ashtakoot: {
        totalScore: number;
        kootas: KootaResult[];
    };
    dosha: {
        boy: DoshaResult;
        girl: DoshaResult;
    };
    verdict: string; // "Good to proceed", "Average", "Not recommended"
}
