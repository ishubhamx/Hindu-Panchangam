/**
 * Festival Type Definitions
 * 
 * New API structure for accurate festival calculation with Udaya Tithi support
 */

import type { Observer } from 'astronomy-engine';

/**
 * Festival types:
 * - single: Single-day festival
 * - span: Multi-day festival (e.g., Navaratri, Pitru Paksha)
 */
export type FestivalType = 'single' | 'span';

/**
 * Festival categories for UI display and filtering
 */
export type FestivalCategory =
    | 'major'        // Major festivals (Diwali, Holi, etc.)
    | 'minor'        // Minor festivals
    | 'ekadashi'     // Ekadashi observances
    | 'pradosham'    // Pradosham (Trayodashi)
    | 'vrat'         // Fasting/observance days
    | 'jayanti'      // Birth anniversaries (deity/saint birthdays)
    | 'solar';       // Sankranti-based festivals

/**
 * Single-day or multi-day festival
 */
export interface Festival {
    /** Festival name */
    name: string;

    /** Festival type */
    type: FestivalType;

    /** Category for classification */
    category: FestivalCategory;

    /** Primary date (for single-day) or start date (for spans) */
    date: Date;

    // Single-day festival properties
    /** Tithi index (1-30) if tithi-based */
    tithi?: number;

    /** Paksha (Shukla/Krishna) if tithi-based */
    paksha?: string;

    /** Masa name if tithi-based */
    masa?: string;

    // Multi-day festival properties
    /** Start date for multi-day festivals */
    startDate?: Date;

    /** End date for multi-day festivals */
    endDate?: Date;

    /** Number of days the festival spans */
    spanDays?: number;

    /** Daily names for each day of the span (optional) */
    dailyNames?: string[];

    // Metadata
    /** Description of the festival */
    description?: string;

    /** Observances/practices associated with the festival */
    observances?: string[];

    /** Regional variations (e.g., ['Tamil', 'Kerala', 'North', 'South']) */
    regional?: string[];

    /** Whether this is a fasting day */
    isFastingDay?: boolean;
}

/**
 * Options for festival calculation
 */
export interface FestivalCalculationOptions {
    /** Date for which to calculate festivals */
    date: Date;

    /** Observer location for precise sunrise calculations */
    observer: Observer;

    /** Sunrise time for Udaya Tithi calculation */
    sunrise: Date;

    /** Sunset time (optional, for some calculations) */
    sunset?: Date;

    // Panchang data (from getPanchangam)
    /** Masa information */
    masa: {
        index: number;
        name: string;
        isAdhika: boolean;
    };

    /** Paksha (Shukla/Krishna) */
    paksha: string;

    /** Tithi index (1-30) at the given date/time */
    tithi: number;

    /** Nakshatra index (0-26) */
    nakshatra?: number;

    /** Vara (weekday, 0-6) */
    vara?: number;

    // Optional features
    /** Include Sankranti-based solar festivals */
    includeSolarFestivals?: boolean;

    /** Include regional festivals (e.g., ['Tamil', 'Malayalam']) */
    includeRegional?: string[];

    /** Calendar type (Amanta vs Purnimanta) */
    calendarType?: 'amanta' | 'purnimanta';

    /** Whether to calculate multi-day festival spans */
    includeMultiDaySpans?: boolean;
}

/**
 * Result of Udaya Tithi calculation
 */
export interface UdayaTithiInfo {
    /** Tithi prevailing at sunrise (1-30) */
    tithi: number;

    /** Paksha of the Udaya Tithi */
    paksha: string;

    /** Start time of this Tithi */
    tithiStart: Date;

    /** End time of this Tithi */
    tithiEnd: Date;

    /** Whether this is a Kshaya Tithi (lost tithi that doesn't touch sunrise) */
    isKshaya?: boolean;

    /** Whether this is a Vriddhi Tithi (two tithis touch sunrise) */
    isVriddhi?: boolean;
}

/**
 * Solar festival configuration
 */
export interface SolarFestivalConfig {
    /** Festival name */
    name: string;

    /** Rashi index (0-11) when Sankranti occurs */
    rashiIndex: number;

    /** Type of festival */
    type: FestivalType;

    /** Number of days if multi-day */
    spanDays?: number;

    /** Names for each day of multi-day festival */
    dayNames?: string[];

    /** Regional association */
    regional?: string[];

    /** Description */
    description?: string;
}
