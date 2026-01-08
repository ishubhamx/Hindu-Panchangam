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

export interface PlanetaryPosition {
    longitude: number;      // Longitude in degrees (0-360)
    rashi: number;         // Rashi index (0-11: Aries to Pisces)
    rashiName: string;     // Rashi name
    degree: number;        // Degree within the rashi (0-30)
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
    // Enhanced Vedic Features
    abhijitMuhurta: MuhurtaTime | null;
    brahmaMuhurta: MuhurtaTime | null;
    govardhanMuhurta: MuhurtaTime | null;
    yamagandaKalam: MuhurtaTime | null;
    gulikaKalam: MuhurtaTime | null;
    durMuhurta: MuhurtaTime[] | null;
    planetaryPositions: {
        sun: PlanetaryPosition;
        moon: PlanetaryPosition;
        mars: PlanetaryPosition;
        mercury: PlanetaryPosition;
        jupiter: PlanetaryPosition;
        venus: PlanetaryPosition;
        saturn: PlanetaryPosition;
    };
    chandrabalam: number;  // Moon strength (0-100)
    currentHora: string;   // Current planetary hour
}

export interface PanchangamDetails extends Panchangam {
    sunrise: Date | null;
}
