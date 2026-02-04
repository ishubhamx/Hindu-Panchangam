import { PlanetaryPosition, DashaResult } from '../core/types';

/**
 * Represents a single House (Bhava) in the Kundli.
 */
export interface Bhava {
    number: number;         // 1 to 12
    rashi: number;          // Rashi at the cusp/start of the house (0=Aries, 11=Pisces)
    longitude: number;      // Longitude of the cusp (0-360)
    startLongitude: number; // Start degree of the house (for Chalit)
    endLongitude: number;   // End degree of the house
    planets: string[];      // Names of planets residing in this house
}

/**
 * Configuration options for Kundli generation.
 */
export interface KundliConfig {
    houseSystem?: 'whole_sign' | 'equal_house' | 'placidus'; // Default: whole_sign
    ayanamsa?: 'lahiri' | 'raman' | 'kp'; // Default: lahiri (currently only Lahiri supported in Core)
    lang?: 'en' | 'hi'; // Default: en (future implementation)
}

/**
 * The complete Janam Kundli (Horoscope) object.
 */
export interface Kundli {
    // Basic Details
    birthDetails: {
        date: Date;
        lat: number;
        lon: number;
        timezone: number; // Offset in minutes? Or just derived from Date object?
    };

    // Lagna (Ascendant)
    ascendant: {
        rashi: number;
        rashiName: string;
        longitude: number;
        nakshatra: string;
        pada: number;
    };

    // Planetary Positions (Reused from Core, but maybe enriched?)
    planets: Record<string, PlanetaryPosition>;

    // Houses (Bhavas)
    houses: Bhava[];
    dasha: DashaResult;
    vargas?: Record<string, VargaChart>;
}

export interface VargaChart {
    ascendant: {
        rashi: number;
        rashiName: string;
    };
    planets: Record<string, {
        rashi: number;
        rashiName: string;
    }>;
    houses: Bhava[];
}
