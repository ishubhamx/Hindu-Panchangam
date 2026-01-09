export interface KaranaTransition {
    name: string;
    endTime: Date;
}

export interface TithiTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface NakshatraTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface YogaTransition {
    index: number;
    name: string;
    endTime: Date;
}

export interface RashiTransition {
    rashi: number;
    name: string;
    endTime: Date;
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
    // Enhanced Vedic Features
    amritKalam: MuhurtaTime[];
    varjyam: MuhurtaTime[];
    abhijitMuhurta: MuhurtaTime | null;
    brahmaMuhurta: MuhurtaTime | null;
    govardhanMuhurta: MuhurtaTime | null;
    yamagandaKalam: MuhurtaTime | null;
    gulikaKalam: MuhurtaTime | null;
    durMuhurta: MuhurtaTime[] | null;

    // Special Yogas
    specialYogas: SpecialYogaResult[];

    // Dasha
    vimshottariDasha: DashaResult;

    // Festivals
    festivals: string[];

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
