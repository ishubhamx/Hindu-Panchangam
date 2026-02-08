/**
 * Festival Calculation Logic - v3.0.0
 * 
 * Complete redesign with Udaya Tithi support, proper categorization,
 * and multi-day festival spans.
 */

import type { Festival, FestivalCalculationOptions, FestivalCategory } from '../types/festivals.js';
import { masaNames, SOLAR_FESTIVALS, SANKRANTI_NAMES, MULTI_DAY_FESTIVALS } from './constants.js';
import { getTithiAtSunrise, getTithiAtTime } from './udaya-tithi.js';
import { getSankrantiForDate, getPaksha, getMasa } from './calculations.js';
import { getAyanamsa } from './ayanamsa.js';
import { Observer, GeoVector, Body, Ecliptic as EclipticFunc } from 'astronomy-engine';

/**
 * Ekadashi Names by Masa and Paksha
 */
export const EKADASHI_NAMES: { [key: string]: string } = {
    // Chaitra (0)
    "0-Shukla": "Kamada Ekadashi",
    "0-Krishna": "Varuthini Ekadashi",
    // Vaishakha (1)
    "1-Shukla": "Mohini Ekadashi",
    "1-Krishna": "Apara Ekadashi",
    // Jyeshtha (2)
    "2-Shukla": "Nirjala Ekadashi",
    "2-Krishna": "Yogini Ekadashi",
    // Ashadha (3)
    "3-Shukla": "Devshayani Ekadashi",
    "3-Krishna": "Kamika Ekadashi",
    // Shravana (4)
    "4-Shukla": "Shravana Putrada Ekadashi",
    "4-Krishna": "Aja Ekadashi",
    // Bhadrapada (5)
    "5-Shukla": "Parsva Ekadashi",
    "5-Krishna": "Indira Ekadashi",
    // Ashwina (6)
    "6-Shukla": "Papankusha Ekadashi",
    "6-Krishna": "Rama Ekadashi",
    // Kartika (7)
    "7-Shukla": "Devutthana Ekadashi",
    "7-Krishna": "Utpanna Ekadashi",
    // Margashirsha (8)
    "8-Shukla": "Mokshada Ekadashi",
    "8-Krishna": "Saphala Ekadashi",
    // Pausha (9)
    "9-Shukla": "Pausha Putrada Ekadashi",
    "9-Krishna": "Shattila Ekadashi",
    // Magha (10)
    "10-Shukla": "Jaya Ekadashi",
    "10-Krishna": "Vijaya Ekadashi",
    // Phalguna (11)
    "11-Shukla": "Amalaki Ekadashi",
    "11-Krishna": "Papmochani Ekadashi",
};

/**
 * Get Ekadashi name for a given Masa and Paksha
 */
export function getEkadashiName(masaIndex: number, paksha: string): string {
    const key = `${masaIndex}-${paksha}`;
    return EKADASHI_NAMES[key] || `${masaNames[masaIndex]} ${paksha} Ekadashi`;
}

/**
 * Get Solar Calendar Festivals (Sankranti-based)
 */
function getSolarFestivals(
    date: Date,
    options: FestivalCalculationOptions
): Festival[] {
    const festivals: Festival[] = [];

    if (!options.includeSolarFestivals) {
        return festivals;
    }

    const timezoneOffsetMinutes = -date.getTimezoneOffset();
    const ayanamsa = getAyanamsa(date);
    const sankranti = getSankrantiForDate(date, ayanamsa, timezoneOffsetMinutes);

    if (!sankranti) {
        return festivals;
    }

    const rashiIndex = sankranti.rashi;
    const solarFestivalConfigs = SOLAR_FESTIVALS[rashiIndex];

    if (!solarFestivalConfigs) {
        return festivals;
    }

    for (const config of solarFestivalConfigs) {
        if (config.type === 'span' && config.spanDays && config.dayNames) {
            const sankrantiTime = sankranti.exactTime.getTime();
            const currentTime = date.getTime();
            const daysDiff = Math.floor((currentTime - sankrantiTime) / (24 * 60 * 60 * 1000));

            if (daysDiff >= -1 && daysDiff < config.spanDays - 1) {
                const dayIndex = daysDiff + 1;
                if (dayIndex >= 0 && dayIndex < config.spanDays) {
                    const dayName = config.dayNames[dayIndex];
                    festivals.push({
                        name: dayName,
                        type: 'span',
                        category: 'solar',
                        date,
                        description: config.description,
                        regional: config.regional,
                        spanDays: config.spanDays,
                        dailyNames: config.dayNames
                    });
                }
            }
        } else {
            festivals.push({
                name: config.name,
                type: 'single',
                category: 'solar',
                date,
                description: config.description,
                regional: config.regional
            });
        }
    }

    return festivals;
}

/**
 * Get Multi-Day Festival Span Information
 */
function getMultiDayFestivals(
    masaIndex: number,
    udayaTithi: number,
    date: Date,
    options: FestivalCalculationOptions
): Festival[] {
    const festivals: Festival[] = [];

    if (!options.includeMultiDaySpans) {
        return festivals;
    }

    for (const [key, config] of Object.entries(MULTI_DAY_FESTIVALS)) {
        if (config.masaIndex !== masaIndex) {
            continue;
        }

        if (udayaTithi >= config.startTithi && udayaTithi <= config.endTithi) {
            const dayIndex = udayaTithi - config.startTithi;
            const dailyName = config.dailyNames[dayIndex] || `${config.name} Day ${dayIndex + 1}`;

            festivals.push({
                name: dailyName,
                type: 'span',
                category: 'major',
                date,
                tithi: udayaTithi,
                masa: masaNames[masaIndex],
                spanDays: config.spanDays,
                dailyNames: config.dailyNames,
                description: `${config.description} (Day ${dayIndex + 1} of ${config.spanDays})`
            });
        }
    }

    return festivals;
}

/**
 * Main Festival Calculation Function (v3.2.0)
 * 
 * Uses Udaya Tithi (sunrise Tithi) as primary, with full-day tithi
 * look-ahead for accurate festival date assignment per Drik Panchang
 * convention.
 *
 * Three-pass approach:
 *  1. Sunrise tithi — standard udaya-tithi festivals
 *  2. Midday tithi  — Madhyahna-vyapini (most festivals)
 *  3. Sunset tithi  — Aparahna/Sayahna-vyapini (e.g. Dussehra, Vat Savitri)
 *
 * When a tithi crosses a month boundary (Amavasya → Pratipada), the
 * midday/sunset pass uses the NEXT masa index automatically.
 *
 * Also handles:
 * - Adhika Masa festivals (only Ekadashi/Pradosham in Adhika)
 * - Kshaya Tithi (short tithis that don't touch any sunrise)
 */
export function getFestivals(options: FestivalCalculationOptions): Festival[] {
    const { date, observer, sunrise, masa, paksha } = options;
    const masaIndex = masa.index;

    // Calculate Udaya Tithi (Tithi at sunrise) — always 1-indexed (1-30)
    const udayaTithi = getTithiAtSunrise(date, sunrise, observer);

    // Detect tithi-based festivals for the sunrise tithi
    const festivals = detectTithiBasedFestivals(masaIndex, udayaTithi, paksha, date, options.vara, masa.isAdhika);

    // Helper: determine the masa index for a given tithi.
    // If we cross from Amavasya (30 / Krishna Amavasya) into Shukla Pratipada (1),
    // that means we've entered the next lunar month. In the Amanta system the
    // sunrise masa is still the "old" month; the midday/sunset tithi that is
    // Pratipada or later in Shukla paksha after an Amavasya sunrise belongs to
    // the next month.
    const getMasaForTithi = (checkTithi: number): number => {
        // If the sunrise was in the last portion of Krishna paksha (tithi >= 26,
        // i.e. late Amavasya region) and the check tithi is in early Shukla
        // (tithi <= 15), we have crossed the month boundary.
        if (udayaTithi >= 26 && checkTithi <= 15) {
            return (masaIndex + 1) % 12;
        }
        return masaIndex;
    };

    // Helper: add festivals for a tithi, avoiding duplicates
    const addFestivalsForTithi = (tithi: number, useMasa?: number) => {
        const t0 = tithi - 1;
        const tPaksha = getPaksha(t0);
        const mIdx = useMasa !== undefined ? useMasa : getMasaForTithi(tithi);
        const isAdh = (mIdx === masaIndex) ? masa.isAdhika : false;
        const fests = detectTithiBasedFestivals(mIdx, tithi, tPaksha, date, options.vara, isAdh);
        for (const f of fests) {
            if (!festivals.some(existing => existing.name === f.name)) {
                festivals.push(f);
            }
        }
    };

    if (options.sunset) {
        const midday = new Date((sunrise.getTime() + options.sunset.getTime()) / 2);
        const middayTithi = getTithiAtTime(midday);
        const sunsetTithi = getTithiAtTime(options.sunset);

        // Collect all distinct tithis that occur during the day
        // (sunrise → midday → sunset), skipping the sunrise tithi already handled
        const tithisSeen = new Set<number>([udayaTithi]);

        // Walk from udayaTithi+1 up to and including sunsetTithi
        if (middayTithi !== udayaTithi || sunsetTithi !== udayaTithi) {
            // Determine the furthest tithi reached during the day
            const endTithi = sunsetTithi;

            let t = udayaTithi;
            // Walk forward from sunrise tithi until we reach the sunset tithi
            // This handles: sunrise=8, midday=9, sunset=10 → add 9 and 10
            // Also handles kshaya: sunrise=8, midday=10 → add 9 (kshaya) and 10
            while (true) {
                t = t + 1;
                if (t > 30) t = 1;
                tithisSeen.add(t);
                addFestivalsForTithi(t);
                if (t === endTithi) break;
                // Safety: avoid infinite loop (shouldn't happen in normal conditions)
                if (tithisSeen.size > 5) break;
            }
        }
    }

    // ===== NIGHT FESTIVAL SPECIAL CASES =====
    // Maha Shivaratri: Night festival (Ratri Vrat) observed on the day when
    // Krishna Chaturdashi prevails during Pradosh Kala (evening after sunset)
    // and Nishita Kala (midnight). Per Drik Panchang convention:
    //   - If sunrise tithi is Trayodashi and Chaturdashi starts before sunset,
    //     that day IS Shivaratri (the night vigil happens that night).
    //   - If sunrise tithi is Chaturdashi but Amavasya starts before sunset,
    //     that day is NOT Shivaratri (Chaturdashi doesn't prevail at night).
    if (masaIndex === 10 && !masa.isAdhika) {
        // tithi 29 (1-indexed) = Krishna Chaturdashi
        const CHATURDASHI = 29;
        const hasChaturdashiAtSunset = options.sunset
            ? getTithiAtTime(options.sunset) === CHATURDASHI
            : udayaTithi === CHATURDASHI; // fallback if no sunset available

        if (hasChaturdashiAtSunset && !festivals.some(f => f.name === 'Maha Shivaratri')) {
            festivals.push({
                name: 'Maha Shivaratri',
                type: 'single',
                category: 'major',
                date,
                tithi: CHATURDASHI,
                paksha: 'Krishna',
                masa: masaNames[masaIndex],
                description: 'Great night of Shiva — observed on the night when Chaturdashi prevails',
                observances: ['Fasting', 'All-night vigil', 'Shiva puja'],
                isFastingDay: true
            });
        }
    }

    // ===== MULTI-DAY FESTIVAL SPANS =====
    const multiDayFestivals = getMultiDayFestivals(masaIndex, udayaTithi, date, options);
    festivals.push(...multiDayFestivals);

    // ===== SOLAR FESTIVALS =====
    const solarFestivals = getSolarFestivals(date, options);
    festivals.push(...solarFestivals);

    return festivals;
}


/**
 * Pure festival detection by Tithi — no astronomical dependencies.
 * 
 * This is the recommended function for **unit testing** festival logic
 * since it doesn't require Date, Observer, or sunrise calculations.
 * 
 * @param masaIndex - Masa index (0-11, Chaitra to Phalguna)
 * @param isAdhika - Whether it's an Adhika (intercalary) month
 * @param udayaTithi - Udaya Tithi (1-30, 1-indexed)
 * @param paksha - "Shukla" or "Krishna"
 * @param vara - Day of week (0=Sunday ... 6=Saturday), optional
 * @returns Array of festival names (strings) matching the given tithi/masa
 */
export function getFestivalsByTithi(
    masaIndex: number,
    isAdhika: boolean,
    udayaTithi: number,
    paksha: string,
    vara?: number
): string[] {
    const stubDate = new Date();

    // Run the pure tithi-based detection (skip Udaya Tithi recalculation)
    const festivals = detectTithiBasedFestivals(masaIndex, udayaTithi, paksha, stubDate, vara, isAdhika);
    return festivals.map(f => f.name);
}

/**
 * Pure tithi-based festival detection — extracted core logic.
 * No astronomical dependencies. Used by both getFestivals() and getFestivalsByTithi().
 *
 * @param isAdhika - When true, only Ekadashi and Pradosham are returned;
 *                   major/minor/jayanti/vrat festivals are skipped per tradition.
 */
function detectTithiBasedFestivals(
    masaIndex: number,
    udayaTithi: number,
    paksha: string,
    date: Date,
    vara?: number,
    isAdhika: boolean = false
): Festival[] {
    const festivals: Festival[] = [];

    const createFestival = (
        name: string,
        category: FestivalCategory,
        metadata?: Partial<Festival>
    ): Festival => ({
        name,
        type: 'single',
        category,
        date,
        tithi: udayaTithi,
        paksha,
        masa: masaNames[masaIndex] || '',
        ...metadata
    });

    // In Adhika Masa only Ekadashi and Pradosham are observed;
    // skip all major / minor / jayanti / vrat festivals.
    if (isAdhika) {
        // Jump directly to Ekadashi/Pradosham at the bottom
        if (udayaTithi === 11 || udayaTithi === 26) {
            const ekadashiName = getEkadashiName(masaIndex, paksha);
            festivals.push(createFestival(ekadashiName, 'ekadashi', {
                isFastingDay: true,
                observances: ["Fasting", "Vishnu worship"]
            }));
        }
        if (udayaTithi === 13 || udayaTithi === 28) {
            const pradoshamType = (udayaTithi === 13) ? "Shukla" : "Krishna";
            festivals.push(createFestival(`Pradosham (${pradoshamType})`, 'pradosham', {
                description: "Auspicious time for Shiva worship",
                observances: ["Evening Shiva puja"]
            }));
        }
        return festivals;
    }

    // ===== MAJOR FESTIVALS =====

    if (masaIndex === 0 && udayaTithi === 1) {
        festivals.push(createFestival("Ugadi / Gudi Padwa", 'major', {
            description: "Hindu New Year",
            observances: ["New Year celebrations", "Panchanga reading"],
            regional: ['South', 'Maharashtra']
        }));
        festivals.push(createFestival("Chaitra Navratri Ghatasthapana", 'major'));
    }

    if (masaIndex === 0 && udayaTithi === 9) {
        festivals.push(createFestival("Rama Navami", 'major', {
            description: "Birth of Lord Rama",
            observances: ["Rama Katha", "Chariot processions"],
            isFastingDay: true
        }));
    }

    if (masaIndex === 0 && udayaTithi === 15) {
        festivals.push(createFestival("Hanuman Jayanti", 'jayanti', {
            description: "Birth of Lord Hanuman"
        }));
        festivals.push(createFestival("Chaitra Purnima", 'minor'));
    }

    if (masaIndex === 0 && udayaTithi === 23) {
        festivals.push(createFestival("Sheetala Ashtami (Basoda)", 'vrat', {
            description: "Worship of Goddess Sheetala for good health",
            isFastingDay: true,
            regional: ['North', 'Rajasthan']
        }));
    }

    if (masaIndex === 0 && udayaTithi === 3) {
        festivals.push(createFestival("Gangaur", 'vrat', {
            description: "Worship of Goddess Gauri",
            regional: ['Rajasthan', 'MP']
        }));
    }

    if (masaIndex === 0 && udayaTithi === 6) {
        festivals.push(createFestival("Yamuna Chhath (Yamuna Jayanti)", 'jayanti', {
            description: "Goddess Yamuna descended on earth",
            regional: ['Brij']
        }));
    }

    if (masaIndex === 1 && udayaTithi === 3) {
        festivals.push(createFestival("Akshaya Tritiya", 'major', {
            description: "Auspicious day for new beginnings",
            observances: ["Gold purchases", "Charity"]
        }));
        festivals.push(createFestival("Parashurama Jayanti", 'jayanti'));
    }

    if (masaIndex === 1 && udayaTithi === 15) {
        festivals.push(createFestival("Buddha Purnima", 'major', {
            description: "Birth of Gautama Buddha"
        }));
        festivals.push(createFestival("Kurma Jayanti", 'jayanti', {
            description: "Birth anniversary of Kurma Avatar"
        }));
    }

    if (masaIndex === 1 && udayaTithi === 7) {
        festivals.push(createFestival("Ganga Saptami", 'minor', {
            description: "Rebirth of Goddess Ganga"
        }));
    }

    if (masaIndex === 1 && udayaTithi === 9) {
        festivals.push(createFestival("Sita Navami (Janaki Jayanti)", 'jayanti', {
            description: "Birth anniversary of Goddess Sita",
            observances: ["Married women observe fast"]
        }));
    }

    if (masaIndex === 1 && udayaTithi === 14) {
        festivals.push(createFestival("Narasimha Jayanti", 'jayanti', {
            description: "Appearance of Narasimha Avatar",
            observances: ["One-day fast"]
        }));
    }

    if (masaIndex === 2 && udayaTithi === 16) {
        festivals.push(createFestival("Narada Jayanti", 'jayanti', {
            description: "Birth anniversary of Devrishi Narada Muni"
        }));
    }

    if (masaIndex === 2 && udayaTithi === 10) {
        festivals.push(createFestival("Ganga Dussehra", 'minor', {
            description: "Descent of Ganga to Earth"
        }));
    }

    if (masaIndex === 2 && udayaTithi === 9) {
        festivals.push(createFestival("Mahesh Navami", 'minor', {
            description: "Worship of Lord Shiva and Goddess Parvati"
        }));
    }

    if (masaIndex === 2 && udayaTithi === 11) {
        festivals.push(createFestival("Gayatri Jayanti (Jyeshtha)", 'jayanti', {
            description: "Celebration of Goddess Gayatri"
        }));
    }

    if (masaIndex === 2 && udayaTithi === 30) {
        festivals.push(createFestival("Vat Savitri Vrat", 'vrat', {
            description: "Married women fast for husband's well-being",
            regional: ['Maharashtra', 'Gujarat'],
            isFastingDay: true
        }));
        festivals.push(createFestival("Shani Jayanti", 'jayanti', {
            description: "Birth anniversary of Lord Shani"
        }));
    }

    if (masaIndex === 2 && udayaTithi === 15) {
        festivals.push(createFestival("Vat Purnima", 'vrat', {
            description: "Married women fast for husband's longevity",
            regional: ['North'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 3 && udayaTithi === 2) {
        festivals.push(createFestival("Jagannath Rathyatra", 'major', {
            description: "Annual chariot festival of Lord Jagannath",
            regional: ['Odisha', 'East']
        }));
    }

    if (masaIndex === 3 && udayaTithi === 15) {
        festivals.push(createFestival("Guru Purnima", 'major', {
            description: "Day to honor spiritual and academic teachers",
            observances: ["Guru worship", "Prayers"]
        }));
        festivals.push(createFestival("Vyasa Puja", 'jayanti', {
            description: "Birth anniversary of Sage Vyasa"
        }));
        festivals.push(createFestival("Kokila Vrat", 'vrat', {
            isFastingDay: true
        }));
    }

    if (masaIndex === 4 && udayaTithi === 3) {
        festivals.push(createFestival("Hariyali Teej", 'vrat', {
            description: "Monsoon festival of greenery and swings",
            regional: ['North'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 4 && udayaTithi === 5) {
        festivals.push(createFestival("Nag Panchami", 'minor', {
            description: "Serpent worship"
        }));
        festivals.push(createFestival("Kalki Jayanti", 'jayanti'));
    }

    if (masaIndex === 4 && udayaTithi === 12) {
        festivals.push(createFestival("Varalakshmi Vratam", 'vrat', {
            description: "Worship of Goddess Lakshmi for wealth and prosperity",
            regional: ['South', 'Karnataka', 'Andhra'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 4 && udayaTithi === 15) {
        festivals.push(createFestival("Raksha Bandhan", 'major', {
            description: "Festival celebrating brother-sister bond",
            observances: ["Rakhi tying"]
        }));
        festivals.push(createFestival("Gayatri Jayanti", 'jayanti'));
        festivals.push(createFestival("Hayagriva Jayanti", 'jayanti'));
        festivals.push(createFestival("Narali Purnima", 'minor', {
            description: "Coconut offering to sea god",
            regional: ['Maharashtra', 'Konkan']
        }));
    }

    if (masaIndex === 4 && udayaTithi === 18) {
        festivals.push(createFestival("Kajari Teej", 'vrat', {
            description: "Third Teej festival",
            regional: ['North'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 4 && udayaTithi === 23) {
        festivals.push(createFestival("Krishna Janmashtami", 'major', {
            description: "Birth of Lord Krishna",
            observances: ["Fasting", "Midnight celebrations", "Dahi Handi"],
            isFastingDay: true
        }));
    }

    if (masaIndex === 5 && udayaTithi === 4) {
        festivals.push(createFestival("Ganesh Chaturthi", 'major', {
            description: "Birth of Lord Ganesha",
            observances: ["Ganesha idol worship", "Modak offerings"],
            regional: ['Maharashtra', 'Karnataka']
        }));
    }

    if (masaIndex === 5 && udayaTithi === 14) {
        festivals.push(createFestival("Anant Chaturdashi", 'major'));
        festivals.push(createFestival("Ganesh Visarjan", 'major', {
            description: "Immersion of Ganesha idols"
        }));
    }

    if (masaIndex === 5 && udayaTithi === 30) {
        festivals.push(createFestival("Sarva Pitru Amavasya (Mahalaya)", 'major', {
            description: "Last day of Pitru Paksha",
            observances: ["Ancestor worship", "Tarpan"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 1) {
        festivals.push(createFestival("Navaratri Ghatasthapana", 'major', {
            description: "Start of 9-day Durga worship",
            observances: ["Kalash sthapana", "Fasting begins"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 8) {
        festivals.push(createFestival("Durga Ashtami (Maha Ashtami)", 'major', {
            observances: ["Durga puja", "Kumari puja"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 9) {
        festivals.push(createFestival("Maha Navami", 'major', {
            observances: ["Durga worship", "Ayudha puja"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 10) {
        festivals.push(createFestival("Vijaya Dashami (Dussehra)", 'major', {
            description: "Victory of good over evil",
            observances: ["Ravana effigy burning", "Vijayadashami puja"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 15) {
        festivals.push(createFestival("Sharad Purnima", 'major', {
            description: "Harvest festival, full moon night"
        }));
        festivals.push(createFestival("Valmiki Jayanti", 'jayanti'));
    }

    if (masaIndex === 6 && udayaTithi === 19) {
        festivals.push(createFestival("Karwa Chauth", 'vrat', {
            description: "Fasting for husband's longevity",
            isFastingDay: true,
            regional: ['North']
        }));
    }

    if (masaIndex === 6 && udayaTithi === 28) {
        festivals.push(createFestival("Dhanteras", 'major', {
            description: "Festival of wealth",
            observances: ["Gold/utensil purchases", "Lakshmi puja"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 29) {
        festivals.push(createFestival("Naraka Chaturdashi (Choti Diwali)", 'major', {
            observances: ["Oil bath", "Lamps"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 30) {
        festivals.push(createFestival("Diwali (Lakshmi Puja)", 'major', {
            description: "Festival of Lights",
            observances: ["Lakshmi puja", "Fireworks", "Lamps", "Sweets"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 1) {
        festivals.push(createFestival("Govardhan Puja", 'major'));
        festivals.push(createFestival("Bali Pratipada", 'major'));
    }

    if (masaIndex === 7 && udayaTithi === 2) {
        festivals.push(createFestival("Bhai Dooj", 'major', {
            description: "Sister-brother bond celebration"
        }));
    }

    if (masaIndex === 7 && udayaTithi === 6) {
        festivals.push(createFestival("Chhath Puja", 'major', {
            description: "Sun god worship",
            regional: ['Bihar', 'Jharkhand', 'UP'],
            observances: ["Fasting", "Arghya to Sun"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 15) {
        festivals.push(createFestival("Kartik Purnima / Dev Diwali", 'major', {
            observances: ["River bathing", "Diyas"]
        }));
    }

    if (masaIndex === 8 && udayaTithi === 15) {
        festivals.push(createFestival("Dattatreya Jayanti", 'jayanti'));
    }

    if (masaIndex === 10 && udayaTithi === 5) {
        festivals.push(createFestival("Vasant Panchami", 'major', {
            description: "Welcoming spring, Saraswati worship",
            observances: ["Saraswati puja", "Yellow clothes"]
        }));
    }

    // NOTE: Maha Shivaratri is handled as a special night-festival case in
    // getFestivals() — it fires on the day whose evening/night (Pradosh Kala)
    // has Krishna Chaturdashi prevailing, not on the udaya-tithi day.

    if (masaIndex === 11 && udayaTithi === 15) {
        festivals.push(createFestival("Holika Dahan", 'major', {
            description: "Bonfire night preceding Holi",
            observances: ["Bonfire", "Prayers"]
        }));
    }

    // Holi (Rangwali Holi / Dhulandi) is celebrated the day AFTER Holika Dahan,
    // i.e. on Krishna Pratipada (tithi 16) in Phalguna.
    if (masaIndex === 11 && udayaTithi === 16) {
        festivals.push(createFestival("Holi", 'major', {
            description: "Festival of colors",
            observances: ["Colors", "Celebrations"]
        }));
    }

    // ===== MINOR FESTIVALS =====

    if (masaIndex === 5 && udayaTithi === 3) {
        festivals.push(createFestival("Hartalika Teej", 'vrat', { isFastingDay: true }));
        festivals.push(createFestival("Gowri Habba", 'vrat', { regional: ['Karnataka'] }));
    }

    if (masaIndex === 5 && udayaTithi === 5) {
        festivals.push(createFestival("Rishi Panchami", 'vrat'));
    }

    if (masaIndex === 5 && udayaTithi === 8) {
        festivals.push(createFestival("Radha Ashtami", 'jayanti'));
    }

    if (masaIndex === 5 && udayaTithi === 12) {
        festivals.push(createFestival("Vamana Jayanti", 'jayanti'));
    }

    if (masaIndex === 5 && udayaTithi === 15) {
        festivals.push(createFestival("Purnima Shraddha", 'minor', {
            description: "Start of Pitru Paksha"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 23) {
        festivals.push(createFestival("Ahoi Ashtami", 'vrat', {
            regional: ['North'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 7 && udayaTithi === 12) {
        festivals.push(createFestival("Tulasi Vivah", 'minor'));
    }

    if (masaIndex === 8 && udayaTithi === 11) {
        festivals.push(createFestival("Gita Jayanti", 'minor'));
    }

    if (masaIndex === 10 && udayaTithi === 7) {
        festivals.push(createFestival("Ratha Saptami", 'minor', {
            description: "Sun's chariot turning north"
        }));
    }

    if (masaIndex === 11 && udayaTithi === 20) {
        festivals.push(createFestival("Ranga Panchami", 'minor'));
    }

    // ===== ADDITIONAL FESTIVALS =====

    if (masaIndex === 5 && udayaTithi === 24) {
        festivals.push(createFestival("Dahi Handi", 'major', {
            description: "Breaking of curd pot, Krishna's childhood celebration",
            regional: ['Maharashtra']
        }));
    }

    if (masaIndex === 5 && udayaTithi === 8) {
        festivals.push(createFestival("Durva Ashtami", 'vrat', {
            description: "Offering Durva grass to Ganesha"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 23) {
        festivals.push(createFestival("Jivitputrika Vrat (Jitiya)", 'vrat', {
            description: "Mothers fast for well-being of children",
            regional: ['Bihar', 'Jharkhand', 'UP'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 6 && udayaTithi === 5) {
        festivals.push(createFestival("Upang Lalita Vrat", 'vrat', {
            description: "Navaratri observance"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 15) {
        festivals.push(createFestival("Kojagara Puja", 'minor', {
            description: "Night vigil for Lakshmi worship",
            regional: ['Bengal', 'Odisha']
        }));
    }

    if (masaIndex === 7 && udayaTithi === 8) {
        festivals.push(createFestival("Gopashtami", 'minor', {
            description: "Krishna becomes cowherd, cow worship"
        }));
    }

    if (masaIndex === 7 && udayaTithi === 10) {
        festivals.push(createFestival("Kansa Vadh", 'minor', {
            description: "Krishna slaying of Kansa"
        }));
    }

    if (masaIndex === 8 && udayaTithi === 23) {
        festivals.push(createFestival("Kalabhairav Jayanti", 'jayanti', {
            description: "Birth of Lord Kalabhairava"
        }));
    }

    if (masaIndex === 8 && udayaTithi === 5) {
        festivals.push(createFestival("Vivah Panchami", 'minor', {
            description: "Marriage anniversary of Rama and Sita"
        }));
    }

    if (masaIndex === 8 && udayaTithi === 15) {
        festivals.push(createFestival("Annapurna Jayanti", 'jayanti', {
            description: "Birthday of Goddess Annapurna"
        }));
    }

    if (masaIndex === 9 && udayaTithi === 8) {
        festivals.push(createFestival("Banada Ashtami", 'vrat', {
            description: "Shakambari Navratri observance"
        }));
    }

    if (masaIndex === 9 && udayaTithi === 15) {
        festivals.push(createFestival("Pausha Purnima", 'minor', {
            description: "Sacred bathing day"
        }));
        festivals.push(createFestival("Shakambhari Purnima", 'jayanti', {
            description: "End of Shakambari Navratri"
        }));
    }

    if (masaIndex === 10 && udayaTithi === 19) {
        festivals.push(createFestival("Sakat Chauth (Sankashti)", 'vrat', {
            description: "Ganesha worship for removing obstacles",
            isFastingDay: true
        }));
    }

    if (masaIndex === 10 && udayaTithi === 8) {
        festivals.push(createFestival("Bhishma Ashtami", 'minor', {
            description: "Death anniversary of Bhishma Pitamaha"
        }));
    }

    if (masaIndex === 11 && udayaTithi === 2) {
        festivals.push(createFestival("Phulera Dooj", 'minor', {
            description: "Start of Holi festivities, flower offerings"
        }));
    }

    // ===== RECURRING MONTHLY OBSERVANCES =====

    // Sankashti Chaturthi — every Krishna Chaturthi (tithi 19), Ganesha worship
    if (udayaTithi === 19) {
        festivals.push(createFestival("Sankashti Chaturthi", 'vrat', {
            description: "Monthly Ganesha worship for removing obstacles",
            isFastingDay: true,
            observances: ["Moonrise-time puja", "Fasting until moonrise"]
        }));
    }

    // Vinayaka Chaturthi — every Shukla Chaturthi (tithi 4), Ganesha worship
    if (udayaTithi === 4) {
        festivals.push(createFestival("Vinayaka Chaturthi", 'vrat', {
            description: "Monthly Ganesha worship (Shukla Chaturthi)",
            observances: ["Ganesha puja"]
        }));
    }

    // Masik Shivaratri — every Krishna Chaturdashi (tithi 29), Shiva worship
    // Maha Shivaratri (Magha) is handled separately as a night-festival special
    // case in getFestivals(), so Masik Shivaratri fires for ALL months here.
    if (udayaTithi === 29) {
        festivals.push(createFestival("Masik Shivaratri", 'vrat', {
            description: "Monthly night of Shiva worship",
            isFastingDay: true,
            observances: ["Night vigil", "Shiva puja"]
        }));
    }

    // Purnima — every full moon day (tithi 15)
    if (udayaTithi === 15) {
        festivals.push(createFestival("Purnima", 'minor', {
            description: "Full Moon day — auspicious for charity, fasting and prayers",
            isFastingDay: true,
            observances: ["Satyanarayan Puja", "River bathing"]
        }));
    }

    // Amavasya — every new moon day (tithi 30)
    if (udayaTithi === 30) {
        festivals.push(createFestival("Amavasya", 'minor', {
            description: "New Moon day — Pitru Tarpan and ancestral prayers",
            observances: ["Pitru Tarpan", "Ancestor remembrance"]
        }));
    }

    // ===== ADDITIONAL MISSING FESTIVALS =====

    // --- Chaitra (0) ---
    if (masaIndex === 0 && udayaTithi === 2) {
        festivals.push(createFestival("Chaitra Navratri Dwitiya", 'minor', {
            description: "Navratri Day 2 — Worship of Maa Brahmacharini"
        }));
    }
    if (masaIndex === 0 && udayaTithi === 4) {
        festivals.push(createFestival("Chaitra Navratri Chaturthi", 'minor', {
            description: "Navratri Day 4 — Worship of Maa Kushmanda"
        }));
    }
    if (masaIndex === 0 && udayaTithi === 5) {
        festivals.push(createFestival("Chaitra Navratri Panchami", 'minor', {
            description: "Navratri Day 5 — Worship of Maa Skandamata"
        }));
    }
    if (masaIndex === 0 && udayaTithi === 6) {
        festivals.push(createFestival("Chaitra Navratri Shashthi", 'minor', {
            description: "Navratri Day 6 — Worship of Maa Katyayani"
        }));
    }
    if (masaIndex === 0 && udayaTithi === 7) {
        festivals.push(createFestival("Chaitra Navratri Saptami", 'minor', {
            description: "Navratri Day 7 — Worship of Maa Kaalratri"
        }));
    }
    if (masaIndex === 0 && udayaTithi === 8) {
        festivals.push(createFestival("Durga Ashtami (Chaitra)", 'major', {
            description: "Navratri Day 8 — Worship of Maa Mahagauri",
            observances: ["Kanya Pujan", "Havan"]
        }));
    }

    // --- Ashadha (3) — sparse, add more ---
    if (masaIndex === 3 && udayaTithi === 11) {
        festivals.push(createFestival("Devshayani Ekadashi", 'ekadashi', {
            description: "Lord Vishnu goes to sleep — start of Chaturmas",
            isFastingDay: true,
            observances: ["Fasting", "Start of Chaturmas"]
        }));
    }

    // --- Shravana (4) ---
    if (masaIndex === 4 && udayaTithi === 15) {
        festivals.push(createFestival("Shravana Purnima", 'minor', {
            description: "Sacred thread ceremony (Avani Avittam)",
            regional: ['South'],
            observances: ["Upakarma", "Sacred thread change"]
        }));
    }

    // --- Bhadrapada (5) ---
    if (masaIndex === 5 && udayaTithi === 11) {
        festivals.push(createFestival("Parivartini Ekadashi", 'ekadashi', {
            description: "Vishnu turns in his cosmic sleep",
            isFastingDay: true,
            observances: ["Fasting", "Vishnu worship"]
        }));
    }

    // --- Ashwina (6) ---
    if (masaIndex === 6 && udayaTithi === 2) {
        festivals.push(createFestival("Navaratri Dwitiya", 'minor', {
            description: "Navratri Day 2 — Worship of Maa Brahmacharini"
        }));
    }
    if (masaIndex === 6 && udayaTithi === 3) {
        festivals.push(createFestival("Navaratri Tritiya", 'minor', {
            description: "Navratri Day 3 — Worship of Maa Chandraghanta"
        }));
    }
    if (masaIndex === 6 && udayaTithi === 4) {
        festivals.push(createFestival("Navaratri Chaturthi", 'minor', {
            description: "Navratri Day 4 — Worship of Maa Kushmanda"
        }));
    }
    if (masaIndex === 6 && udayaTithi === 6) {
        festivals.push(createFestival("Navaratri Shashthi", 'minor', {
            description: "Navratri Day 6 — Worship of Maa Katyayani"
        }));
    }
    if (masaIndex === 6 && udayaTithi === 7) {
        festivals.push(createFestival("Navaratri Saptami", 'minor', {
            description: "Navratri Day 7 — Worship of Maa Kaalratri"
        }));
    }

    // --- Kartika (7) ---
    if (masaIndex === 7 && udayaTithi === 4) {
        festivals.push(createFestival("Karva Chauth (Kartik)", 'vrat', {
            description: "Some regions observe Karva Chauth in Kartika",
            regional: ['North'],
            isFastingDay: true
        }));
    }
    if (masaIndex === 7 && udayaTithi === 9) {
        festivals.push(createFestival("Akshaya Navami (Amla Navami)", 'minor', {
            description: "Worship of Amla tree (Indian gooseberry)"
        }));
    }
    if (masaIndex === 7 && udayaTithi === 11) {
        festivals.push(createFestival("Devutthana Ekadashi", 'ekadashi', {
            description: "Lord Vishnu wakes from cosmic sleep — end of Chaturmas",
            isFastingDay: true,
            observances: ["Fasting", "End of Chaturmas", "Tulsi Vivah begins"]
        }));
    }

    // --- Margashirsha (8) ---
    if (masaIndex === 8 && udayaTithi === 1) {
        festivals.push(createFestival("Margashirsha Begins", 'minor', {
            description: "Lord Krishna's favorite month begins"
        }));
    }

    // --- Pausha (9) ---
    if (masaIndex === 9 && udayaTithi === 11) {
        festivals.push(createFestival("Pausha Putrada Ekadashi", 'ekadashi', {
            description: "Ekadashi for those wishing for a son",
            isFastingDay: true,
            observances: ["Fasting", "Vishnu worship"]
        }));
    }
    if (masaIndex === 9 && udayaTithi === 6) {
        festivals.push(createFestival("Skanda Sashti", 'vrat', {
            description: "Worship of Lord Murugan (Skanda)",
            regional: ['South', 'Tamil Nadu'],
            isFastingDay: true
        }));
    }
    if (masaIndex === 9 && udayaTithi === 30) {
        festivals.push(createFestival("Mauni Amavasya", 'minor', {
            description: "Day of silence and sacred bathing",
            observances: ["Silence vow", "Holy dip"]
        }));
    }

    // --- Magha (10) ---
    if (masaIndex === 10 && udayaTithi === 15) {
        festivals.push(createFestival("Magha Purnima", 'minor', {
            description: "Sacred bathing and charity day"
        }));
        festivals.push(createFestival("Thai Pusam", 'major', {
            description: "Worship of Lord Murugan (Skanda)",
            regional: ['South', 'Tamil Nadu', 'Malaysia'],
            observances: ["Kavadi", "Vel worship"]
        }));
    }
    if (masaIndex === 10 && udayaTithi === 1) {
        festivals.push(createFestival("Magha Gupta Navratri Begins", 'minor', {
            description: "Start of Magha Gupta Navratri"
        }));
    }
    if (masaIndex === 10 && udayaTithi === 13) {
        festivals.push(createFestival("Maghi (Magha Shukla Trayodashi)", 'minor', {
            description: "Sacred bathing day, especially in Punjab",
            regional: ['Punjab', 'North']
        }));
    }

    // --- Phalguna (11) ---
    if (masaIndex === 11 && udayaTithi === 11) {
        festivals.push(createFestival("Amalaki Ekadashi", 'ekadashi', {
            description: "Worship of Amla tree and Lord Vishnu",
            isFastingDay: true,
            observances: ["Fasting", "Amla tree puja"]
        }));
    }
    if (masaIndex === 11 && udayaTithi === 14) {
        festivals.push(createFestival("Holashtak Begins", 'minor', {
            description: "Eight inauspicious days before Holi begin"
        }));
    }

    // ===== EKADASHI & PRADOSHAM =====

    if (udayaTithi === 11 || udayaTithi === 26) {
        const ekadashiName = getEkadashiName(masaIndex, paksha);
        festivals.push(createFestival(ekadashiName, 'ekadashi', {
            isFastingDay: true,
            observances: ["Fasting", "Vishnu worship"]
        }));
    }

    if (udayaTithi === 13 || udayaTithi === 28) {
        const pradoshamType = (udayaTithi === 13) ? "Shukla" : "Krishna";
        festivals.push(createFestival(`Pradosham (${pradoshamType})`, 'pradosham', {
            description: "Auspicious time for Shiva worship",
            observances: ["Evening Shiva puja"]
        }));
    }

    return festivals;
}
