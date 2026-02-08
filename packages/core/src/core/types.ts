import type { Festival } from '../types/festivals';

export interface KaranaTransition {
    name: string;
    startTime: Date;
    endTime: Date;
}

export interface TithiTransition {
    index: number;
    name: string;
    startTime: Date;
    endTime: Date;
}

export interface NakshatraTransition {
    index: number;
    name: string;
    startTime: Date;
    endTime: Date;
}

export interface YogaTransition {
    index: number;
    name: string;
    startTime: Date;
    endTime: Date;
}

export interface RashiTransition {
    rashi: number;
    name: string;
    startTime: Date;
    endTime: Date;
}

export interface SankrantiInfo {
    rashi: number;           // Rashi Sun is entering (0-11)
    rashiName: string;       // Name of the Rashi
    name: string;            // Sankranti name (e.g., "Makar Sankranti")
    exactTime: Date;         // Exact moment of ingress
    punyaKalam: {            // Auspicious window around Sankranti
        start: Date;
        end: Date;
    } | null;
}

export interface PanchakInfo {
    isPanchak: boolean;      // True if currently in Panchak period
    nakshatra: number;       // Current Nakshatra index (22-26 during Panchak)
    nakshatraName: string;   // Nakshatra name
    type: string;            // Type of Panchak (Mrityu, Agni, Raja, Chora, Roga)
    description: string;     // Brief description of what to avoid
}

export interface SpecialYogaResult {
    name: string;
    description: string;
    isAuspicious: boolean;
}

export interface DashaInfo {
    planet: string;
    endYear: number;
    fractionLeft: number;
}

export interface DashaResult {
    birthNakshatra: string;
    nakshatraPada: number;
    dashaBalance: string; // e.g. "Mars: 2y 4m 10d"
    currentMahadasha: {
        planet: string;
        endTime: Date;
    };
    currentAntardasha: {
        planet: string;
        endTime: Date;
    } | null;
    fullCycle: Array<{
        planet: string;
        startTime: Date;
        endTime: Date;
    }>;
}

export interface PlanetaryPosition {
    longitude: number;      // Longitude in degrees (0-360)
    rashi: number;         // Rashi index (0-11: Aries to Pisces)
    rashiName: string;     // Rashi name
    degree: number;        // Degree within the rashi (0-30)
    isRetrograde: boolean; // True if planet is moving backward
    speed: number;         // Daily motion in degrees (positive = direct, negative = retrograde)
    dignity: 'exalted' | 'debilitated' | 'own' | 'neutral';
}

export interface MuhurtaTime {
    start: Date;
    end: Date;
}

import { ChoghadiyaResult, GowriResult } from './muhurta/types';


export interface PanchangamOptions {
    timezoneOffset?: number; // Timezone Offset in MINUTES (e.g. -480 for UTC-8, 330 for IST)
}

export interface Panchangam {
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: string;
    vara: number;
    ayanamsa: number; // The Ayanamsa value used (Lahiri)
    sunrise: Date | null;
    sunset: Date | null;
    moonrise: Date | null;
    moonset: Date | null;
    nakshatraStartTime: Date | null;
    nakshatraEndTime: Date | null;
    tithiStartTime: Date | null;
    tithiEndTime: Date | null;
    yogaEndTime: Date | null;
    rahuKalamStart: Date | null;
    rahuKalamEnd: Date | null;
    karanaTransitions: KaranaTransition[];
    tithiTransitions: TithiTransition[];
    nakshatraTransitions: NakshatraTransition[];
    yogaTransitions: YogaTransition[];
    moonRashiTransitions: RashiTransition[];

    // Unified List for Day's Occurrences
    tithis: TithiTransition[];
    nakshatras: NakshatraTransition[];
    yogas: YogaTransition[];
    karanas: KaranaTransition[];
    rashis: RashiTransition[];

    // Enhanced Vedic Features
    amritKalam: MuhurtaTime[];
    varjyam: MuhurtaTime[];
    abhijitMuhurta: MuhurtaTime | null;
    brahmaMuhurta: MuhurtaTime | null;
    govardhanMuhurta: MuhurtaTime | null;
    yamagandaKalam: MuhurtaTime | null;
    gulikaKalam: MuhurtaTime | null;
    durMuhurta: MuhurtaTime[] | null;

    // Advanced Muhurta (v2.1)
    choghadiya: ChoghadiyaResult;
    gowri: GowriResult;

    // Special Yogas
    specialYogas: SpecialYogaResult[];

    // Dasha
    vimshottariDasha: DashaResult;

    // Festivals (v3.0.0 - structured Festival objects)
    festivals: Festival[];

    planetaryPositions: {
        sun: PlanetaryPosition;
        moon: PlanetaryPosition;
        mars: PlanetaryPosition;
        mercury: PlanetaryPosition;
        jupiter: PlanetaryPosition;
        venus: PlanetaryPosition;
        saturn: PlanetaryPosition;
        rahu: PlanetaryPosition;
        ketu: PlanetaryPosition;
    };
    chandrabalam: number;  // Moon strength (0-100)
    currentHora: string;   // Current planetary hour


    // Phase 3: Planetary Details
    nakshatraPada: number;
    moonRashi: {
        index: number;
        name: string;
    };
    sunRashi: {
        index: number;
        name: string;
    };
    sunNakshatra: {
        index: number;
        name: string;
        pada: number;
    };
    udayaLagna: number; // Sidereal Ascendant degree

    // Calendar Units
    masa: {
        index: number;      // 0-11 (Chaitra - Phalguna)
        name: string;       // Localized name
        isAdhika: boolean;  // True if Adhika Masa (Extra Month)
    };
    paksha: string;         // Shukla or Krishna
    ritu: string;           // Vasant, Grishma, etc.
    ayana: string;          // Uttarayana or Dakshinayana
    samvat: {
        vikram: number;     // Vikram Samvat Year
        shaka: number;      // Shaka Samvat Year
        samvatsara: string; // Jupiter Year Name (e.g., Prabhava)
    };
}

export interface PanchangamDetails extends Panchangam {
    sunrise: Date | null;
}
