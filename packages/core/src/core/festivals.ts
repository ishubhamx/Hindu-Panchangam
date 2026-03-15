/**
 * Festival Calculation Logic - v3.1.0
 *
 * Fixes applied over v3.0.0:
 *  - Dahi Handi: moved to Shravana (masa 4), tithi 24
 *  - Ahoi Ashtami: moved to Kartika (masa 7), tithi 23
 *  - Mauni Amavasya: moved to Magha (masa 10), tithi 30
 *  - Holashtak Begins: corrected to Phalguna Shukla Ashtami (tithi 8)
 *  - Kalki Jayanti: corrected to Shravana Shukla Shashthi (tithi 6)
 *  - Vat Savitri Vrat regional: corrected to North India
 *  - Vat Purnima regional: corrected to Maharashtra/Gujarat
 *  - Narada Jayanti: moved to Vaishakha (masa 1), tithi 16
 *  - Masik Shivaratri: suppressed in Magha (Maha Shivaratri handled separately)
 *  - Maghi: marked as solar-approximate, guarded with vara === 0 (Sunday nearest Makar)
 *  - Varalakshmi Vratam: moved to vara-based logic (Friday before Shravana Purnima)
 *  - Gayatri Jayanti (Jyeshtha): disambiguated from Shravana Purnima entry
 *  - Parivartini/Parsva Ekadashi duplicate: consolidated under EKADASHI_NAMES
 *  - Minor additions: Skanda Sashti (masa 7 + vara), Kamada Ekadashi description,
 *    Chaitra Navratri day-3/day-9 stubs, Shraddha Paksha daily observance.
 */

import type { Festival, FestivalCalculationOptions, FestivalCategory } from '../types/festivals';
import { masaNames, SOLAR_FESTIVALS, SANKRANTI_NAMES, MULTI_DAY_FESTIVALS } from './constants';
import { getTithiAtSunrise, getTithiAtTime } from './udaya-tithi';
import { getSankrantiForDate, getPaksha, getMasa } from './calculations';
import { getAyanamsa } from './ayanamsa';
import { Observer, GeoVector, Body, Ecliptic as EclipticFunc } from 'astronomy-engine';

/**
 * Ekadashi Names by Masa and Paksha
 *
 * Keys: "<masaIndex>-<Shukla|Krishna>"
 * Tithis: Shukla Ekadashi = 11, Krishna Ekadashi = 26
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
    // NOTE: Devshayani = Ashadha Shukla Ekadashi; handled in major-festivals block
    // with richer metadata; duplicate-check prevents double-entry.
    "3-Shukla": "Devshayani Ekadashi",
    "3-Krishna": "Kamika Ekadashi",
    // Shravana (4)
    "4-Shukla": "Shravana Putrada Ekadashi",
    "4-Krishna": "Aja Ekadashi",
    // Bhadrapada (5)
    // NOTE: Parivartini / Parsva are the same Ekadashi — consolidated here.
    "5-Shukla": "Parsva Ekadashi (Parivartini)",
    "5-Krishna": "Indira Ekadashi",
    // Ashwina (6)
    "6-Shukla": "Papankusha Ekadashi",
    "6-Krishna": "Rama Ekadashi",
    // Kartika (7)
    // NOTE: Devutthana = Kartika Shukla Ekadashi; handled with richer metadata below.
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
 * Get Ekadashi name for a given Masa and Paksha.
 */
export function getEkadashiName(masaIndex: number, paksha: string, isAdhika: boolean = false): string {
    if (isAdhika) {
        return paksha === 'Shukla' ? 'Padmini Ekadashi' : 'Parama Ekadashi';
    }
    const key = `${masaIndex}-${paksha}`;
    return EKADASHI_NAMES[key] || `${masaNames[masaIndex]} ${paksha} Ekadashi`;
}

// ---------------------------------------------------------------------------
// Solar Calendar Festivals (Sankranti-based)
// ---------------------------------------------------------------------------

function getSolarFestivals(
    date: Date,
    options: FestivalCalculationOptions
): Festival[] {
    const festivals: Festival[] = [];

    if (!options.includeSolarFestivals) {
        return festivals;
    }

    const timezoneOffsetMinutes = options.timezoneOffset ?? -date.getTimezoneOffset();
    const ayanamsa = getAyanamsa(date);
    const sankranti = getSankrantiForDate(date, ayanamsa, timezoneOffsetMinutes);

    if (!sankranti) return festivals;

    const rashiIndex = sankranti.rashi;
    const solarFestivalConfigs = SOLAR_FESTIVALS[rashiIndex];

    if (!solarFestivalConfigs) return festivals;

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

// ---------------------------------------------------------------------------
// Multi-Day Festival Spans
// ---------------------------------------------------------------------------

function getMultiDayFestivals(
    masaIndex: number,
    udayaTithi: number,
    date: Date,
    options: FestivalCalculationOptions
): Festival[] {
    const festivals: Festival[] = [];

    if (!options.includeMultiDaySpans) return festivals;

    for (const [, config] of Object.entries(MULTI_DAY_FESTIVALS)) {
        if (config.masaIndex !== masaIndex) continue;

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

// ---------------------------------------------------------------------------
// Main Festival Calculation Function (v3.1.0)
// ---------------------------------------------------------------------------
/**
 * Uses Udaya Tithi (sunrise Tithi) as primary, with full-day tithi
 * look-ahead for accurate festival date assignment per Drik Panchang
 * convention.
 *
 * Three-pass approach:
 *  1. Sunrise tithi  — standard udaya-tithi festivals
 *  2. Midday tithi   — Madhyahna-vyapini (most festivals)
 *  3. Sunset tithi   — Aparahna/Sayahna-vyapini (e.g. Dussehra, Vat Savitri)
 *
 * When a tithi crosses a month boundary (Amavasya → Pratipada), the
 * midday/sunset pass uses the NEXT masa index automatically.
 *
 * Also handles:
 *  - Adhika Masa festivals (only Ekadashi/Pradosham in Adhika)
 *  - Kshaya Tithi (short tithis that don't touch any sunrise)
 *  - Vriddhi Tithi (long tithis spanning two sunrises — festival on FIRST day)
 */
export function getFestivals(options: FestivalCalculationOptions): Festival[] {
    const { date, observer, sunrise, masa, paksha } = options;
    const masaIndex = masa.index;

    // Udaya Tithi (1-indexed, 1–30)
    const udayaTithi = getTithiAtSunrise(date, sunrise, observer);

    // Vriddhi Tithi: skip if previous sunrise had the same tithi
    const approxPrevSunrise = new Date(sunrise.getTime() - 24 * 60 * 60 * 1000);
    const prevSunriseTithi = getTithiAtTime(approxPrevSunrise);
    const isVriddhiSecondDay = prevSunriseTithi === udayaTithi;

    const festivals = isVriddhiSecondDay
        ? []
        : detectTithiBasedFestivals(masaIndex, udayaTithi, paksha, date, options.vara, masa.isAdhika);

    // Helper: detect masa crossing at month boundary
    const getMasaForTithi = (checkTithi: number): number => {
        if (udayaTithi >= 26 && checkTithi <= 15) {
            return (masaIndex + 1) % 12;
        }
        return masaIndex;
    };

    // Helper: add festivals for intra-day tithis, deduplicating by name
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

        const approxNextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
        const nextSunriseTithi = getTithiAtTime(approxNextSunrise);

        const tithisSeen = new Set<number>([udayaTithi]);

        if (middayTithi !== udayaTithi || sunsetTithi !== udayaTithi) {
            const endTithi = sunsetTithi;
            let t = udayaTithi;

            while (true) {
                t = t + 1;
                if (t > 30) t = 1;
                tithisSeen.add(t);
                if (t !== nextSunriseTithi) {
                    addFestivalsForTithi(t);
                }
                if (t === endTithi) break;
                if (tithisSeen.size > 5) break;
            }
        }
    }

    // ===== NIGHT FESTIVAL SPECIAL CASES =====
    // Maha Shivaratri: fire when Chaturdashi prevails at sunset in Magha Krishna
    if (masaIndex === 10 && !masa.isAdhika) {
        const CHATURDASHI = 29; // 1-indexed Krishna Chaturdashi
        const hasChaturdashiAtSunset = options.sunset
            ? getTithiAtTime(options.sunset) === CHATURDASHI
            : udayaTithi === CHATURDASHI;

        if (hasChaturdashiAtSunset && !festivals.some(f => f.name === 'Maha Shivaratri')) {
            festivals.push({
                name: 'Maha Shivaratri',
                type: 'single',
                category: 'major',
                date,
                tithi: CHATURDASHI,
                paksha: 'Krishna',
                masa: masaNames[masaIndex],
                description: 'Great night of Shiva — observed on the night when Chaturdashi prevails at Pradosh Kala',
                observances: ['Fasting', 'All-night vigil', 'Rudrabhishek', 'Shiva puja'],
                isFastingDay: true
            });
        }
    }

    // ===== MULTI-DAY FESTIVAL SPANS =====
    if (!isVriddhiSecondDay && !masa.isAdhika) {
        const multiDayFestivals = getMultiDayFestivals(masaIndex, udayaTithi, date, options);
        festivals.push(...multiDayFestivals);
    }

    // ===== SOLAR FESTIVALS =====
    const solarFestivals = getSolarFestivals(date, options);
    festivals.push(...solarFestivals);

    return festivals;
}

// ---------------------------------------------------------------------------
// Public testable wrapper
// ---------------------------------------------------------------------------
/**
 * Pure festival detection by Tithi — no astronomical dependencies.
 * Recommended for unit testing.
 *
 * @param masaIndex  - 0–11 (Chaitra → Phalguna)
 * @param isAdhika   - intercalary month flag
 * @param udayaTithi - 1–30 (1-indexed)
 * @param paksha     - "Shukla" | "Krishna"
 * @param vara       - day of week 0=Sun…6=Sat (optional, used for vara-based festivals)
 */
export function getFestivalsByTithi(
    masaIndex: number,
    isAdhika: boolean,
    udayaTithi: number,
    paksha: string,
    vara?: number
): string[] {
    const stubDate = new Date();
    const festivals = detectTithiBasedFestivals(masaIndex, udayaTithi, paksha, stubDate, vara, isAdhika);
    return festivals.map(f => f.name);
}

// ---------------------------------------------------------------------------
// Core detection — no astronomical dependencies
// ---------------------------------------------------------------------------
/**
 * @param isAdhika - When true, only Ekadashi and Pradosham are returned.
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

    // In Adhika Masa only Ekadashi and Pradosham are observed.
    if (isAdhika) {
        if (udayaTithi === 11 || udayaTithi === 26) {
            const ekadashiName = getEkadashiName(masaIndex, paksha, isAdhika);
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

    // =========================================================
    // CHAITRA (masa 0)
    // =========================================================

    if (masaIndex === 0 && udayaTithi === 1) {
        festivals.push(createFestival("Ugadi / Gudi Padwa", 'major', {
            description: "Hindu Luni-Solar New Year",
            observances: ["Panchanga reading", "Neem-jaggery prasad", "New clothes"],
            regional: ['South', 'Maharashtra']
        }));
        festivals.push(createFestival("Chaitra Navratri Ghatasthapana", 'major', {
            description: "Navratri Day 1 — Worship of Maa Shailputri; Kalash installation",
            observances: ["Kalash sthapana", "Fasting begins", "Durga puja"]
        }));
    }

    if (masaIndex === 0 && udayaTithi === 2) {
        festivals.push(createFestival("Chaitra Navratri Dwitiya", 'minor', {
            description: "Navratri Day 2 — Worship of Maa Brahmacharini"
        }));
    }

    if (masaIndex === 0 && udayaTithi === 3) {
        festivals.push(createFestival("Chaitra Navratri Tritiya", 'minor', {
            description: "Navratri Day 3 — Worship of Maa Chandraghanta"
        }));
        festivals.push(createFestival("Gangaur", 'vrat', {
            description: "Worship of Goddess Gauri (Isari/Gangaur) for marital bliss",
            regional: ['Rajasthan', 'MP'],
            isFastingDay: true
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
        festivals.push(createFestival("Yamuna Chhath (Yamuna Jayanti)", 'jayanti', {
            description: "Goddess Yamuna descended to Earth",
            regional: ['Brij', 'UP']
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

    if (masaIndex === 0 && udayaTithi === 9) {
        festivals.push(createFestival("Rama Navami", 'major', {
            description: "Birth of Lord Rama — Navratri Day 9",
            observances: ["Rama Katha", "Chariot processions", "Fasting"],
            isFastingDay: true
        }));
    }

    if (masaIndex === 0 && udayaTithi === 15) {
        festivals.push(createFestival("Hanuman Jayanti", 'jayanti', {
            description: "Birth of Lord Hanuman",
            observances: ["Hanuman puja", "Sundarkand path"]
        }));
        festivals.push(createFestival("Chaitra Purnima", 'minor', {
            description: "Full moon of Chaitra — Chitragupta worship",
            isFastingDay: true
        }));
    }

    if (masaIndex === 0 && udayaTithi === 23) {
        festivals.push(createFestival("Sheetala Ashtami (Basoda)", 'vrat', {
            description: "Worship of Goddess Sheetala for good health; cold food offered",
            isFastingDay: true,
            regional: ['North', 'Rajasthan', 'UP']
        }));
    }

    // =========================================================
    // VAISHAKHA (masa 1)
    // =========================================================

    if (masaIndex === 1 && udayaTithi === 3) {
        festivals.push(createFestival("Akshaya Tritiya", 'major', {
            description: "Imperishable auspicious day — new beginnings, charity and gold purchase",
            observances: ["Gold/silver purchases", "Charity", "Pitru tarpan"]
        }));
        festivals.push(createFestival("Parashurama Jayanti", 'jayanti', {
            description: "Sixth avatar of Vishnu — Parashurama's birth anniversary"
        }));
    }

    if (masaIndex === 1 && udayaTithi === 7) {
        festivals.push(createFestival("Ganga Saptami", 'minor', {
            description: "Second birth (Punara Janma) of Goddess Ganga",
            observances: ["Ganga puja", "River bathing"]
        }));
    }

    if (masaIndex === 1 && udayaTithi === 9) {
        festivals.push(createFestival("Sita Navami (Janaki Jayanti)", 'jayanti', {
            description: "Birth anniversary of Goddess Sita",
            observances: ["Married women observe fast", "Sita-Rama puja"]
        }));
    }

    if (masaIndex === 1 && udayaTithi === 14) {
        festivals.push(createFestival("Narasimha Jayanti", 'jayanti', {
            description: "Appearance of Narasimha (man-lion) Avatar of Vishnu",
            observances: ["One-day fast", "Narasimha puja"]
        }));
    }

    // FIX: Narada Jayanti moved here from Jyeshtha (masa 2)
    // Most sources: Vaishakha Krishna Pratipada (tithi 16)
    if (masaIndex === 1 && udayaTithi === 16) {
        festivals.push(createFestival("Narada Jayanti", 'jayanti', {
            description: "Birth anniversary of Devrishi Narada Muni"
        }));
    }

    if (masaIndex === 1 && udayaTithi === 15) {
        festivals.push(createFestival("Buddha Purnima", 'major', {
            description: "Birth, Enlightenment and Mahaparinirvana of Gautama Buddha",
            observances: ["Meditation", "Dana (charity)", "Dhamma teachings"]
        }));
        festivals.push(createFestival("Kurma Jayanti", 'jayanti', {
            description: "Birth anniversary of Kurma (Tortoise) Avatar of Vishnu"
        }));
        festivals.push(createFestival("Vaishakha Purnima", 'minor', {
            description: "Full moon of Vaishakha — auspicious for bathing and charity",
            isFastingDay: true
        }));
    }

    // =========================================================
    // JYESHTHA (masa 2)
    // =========================================================

    if (masaIndex === 2 && udayaTithi === 9) {
        festivals.push(createFestival("Mahesh Navami", 'minor', {
            description: "Worship of Lord Shiva and Goddess Parvati",
            regional: ['Rajasthan', 'North']
        }));
    }

    if (masaIndex === 2 && udayaTithi === 10) {
        festivals.push(createFestival("Ganga Dussehra", 'minor', {
            description: "Descent of Ganga to Earth — 10 sins washed away",
            observances: ["Ganga bathing", "Charity of 10 items"]
        }));
    }

    if (masaIndex === 2 && udayaTithi === 11) {
        // FIX: disambiguated — this is a minority tradition
        festivals.push(createFestival("Gayatri Jayanti (Jyeshtha Shukla)", 'jayanti', {
            description: "Minority tradition: Gayatri Jayanti on Jyeshtha Shukla Ekadashi",
            regional: ['Some traditions']
        }));
    }

    if (masaIndex === 2 && udayaTithi === 15) {
        // FIX: regional corrected — Vat Purnima is Maharashtra/Gujarat
        festivals.push(createFestival("Vat Purnima", 'vrat', {
            description: "Married women fast and tie thread around Banyan tree for husband's longevity",
            regional: ['Maharashtra', 'Gujarat'],
            isFastingDay: true,
            observances: ["Banyan tree puja", "Savitri-Satyavan story recitation"]
        }));
    }

    if (masaIndex === 2 && udayaTithi === 30) {
        // FIX: regional corrected — Vat Savitri on Amavasya is North India
        festivals.push(createFestival("Vat Savitri Vrat", 'vrat', {
            description: "Married women fast for husband's well-being; Banyan tree circumambulation",
            regional: ['North', 'UP', 'Bihar', 'Rajasthan', 'Punjab'],
            isFastingDay: true,
            observances: ["Banyan tree puja", "Savitri-Satyavan story recitation"]
        }));
        festivals.push(createFestival("Shani Jayanti", 'jayanti', {
            description: "Birth anniversary of Lord Shani (Saturn)",
            observances: ["Shani puja", "Sesame oil lamp offering"]
        }));
    }

    // =========================================================
    // ASHADHA (masa 3)
    // =========================================================

    if (masaIndex === 3 && udayaTithi === 2) {
        festivals.push(createFestival("Jagannath Rathyatra", 'major', {
            description: "Annual chariot festival of Lord Jagannath, Balabhadra and Subhadra",
            regional: ['Odisha', 'East'],
            observances: ["Chariot procession", "Mahaprasad"]
        }));
    }

    if (masaIndex === 3 && udayaTithi === 11) {
        festivals.push(createFestival("Devshayani Ekadashi", 'ekadashi', {
            description: "Lord Vishnu begins cosmic sleep (Yoga Nidra) — start of Chaturmas",
            isFastingDay: true,
            observances: ["Fasting", "Start of Chaturmas", "No auspicious events for 4 months"]
        }));
    }

    if (masaIndex === 3 && udayaTithi === 15) {
        festivals.push(createFestival("Guru Purnima", 'major', {
            description: "Day to honour spiritual and academic teachers; Vyasa Puja",
            observances: ["Guru worship", "Guru Dakshina", "Prayers"]
        }));
        festivals.push(createFestival("Vyasa Puja", 'jayanti', {
            description: "Birth anniversary of Sage Veda Vyasa — compiler of Vedas and Puranas"
        }));
        festivals.push(createFestival("Kokila Vrat", 'vrat', {
            description: "Women fast for a happy married life",
            isFastingDay: true,
            regional: ['Maharashtra', 'Gujarat']
        }));
    }

    // =========================================================
    // SHRAVANA (masa 4)
    // =========================================================

    if (masaIndex === 4 && udayaTithi === 3) {
        festivals.push(createFestival("Hariyali Teej", 'vrat', {
            description: "Monsoon festival of greenery, swings and marital happiness",
            regional: ['North', 'Rajasthan', 'UP'],
            isFastingDay: true,
            observances: ["Swing games", "Songs of Teej", "Shiva-Parvati puja"]
        }));
    }

    if (masaIndex === 4 && udayaTithi === 5) {
        festivals.push(createFestival("Nag Panchami", 'minor', {
            description: "Serpent deity worship — milk and flowers offered to snake idols",
            observances: ["Snake worship", "Milk offering"]
        }));
    }

    // FIX: Kalki Jayanti corrected to Shravana Shukla Shashthi (tithi 6)
    if (masaIndex === 4 && udayaTithi === 6) {
        festivals.push(createFestival("Kalki Jayanti", 'jayanti', {
            description: "Anticipated birth anniversary of Kalki — the tenth and future avatar of Vishnu"
        }));
    }

    // Varalakshmi Vratam: observed on the FRIDAY falling between Shravana
    // Shukla Ashtami and Chaturdashi (tithis 8–14), i.e. the last Friday
    // before Shravana Purnima. A fixed tithi does not exist — the vara check
    // is the canonical trigger.
    if (masaIndex === 4 && udayaTithi >= 8 && udayaTithi <= 14 && vara === 5) {
        festivals.push(createFestival("Varalakshmi Vratam", 'vrat', {
            description: "Worship of Goddess Varalakshmi for wealth and prosperity — observed on the Friday nearest to (and before) Shravana Purnima",
            regional: ['South', 'Karnataka', 'Andhra', 'Tamil Nadu'],
            isFastingDay: true,
            observances: ["Lakshmi puja", "Kalasha worship", "New saree offered"]
        }));
    }

    if (masaIndex === 4 && udayaTithi === 15) {
        festivals.push(createFestival("Raksha Bandhan", 'major', {
            description: "Festival celebrating the brother-sister bond",
            observances: ["Rakhi tying", "Sister's prayers for brother", "Gift exchange"]
        }));
        // Canonical Gayatri Jayanti (most traditions: Shravana Purnima)
        festivals.push(createFestival("Gayatri Jayanti", 'jayanti', {
            description: "Manifestation anniversary of Goddess Gayatri (Vedmata)"
        }));
        festivals.push(createFestival("Hayagriva Jayanti", 'jayanti', {
            description: "Birth anniversary of Hayagriva — the horse-headed avatar of Vishnu",
            observances: ["Hayagriva puja", "Vedic recitation"]
        }));
        festivals.push(createFestival("Narali Purnima", 'minor', {
            description: "Coconut offering to sea god — start of fishing season",
            regional: ['Maharashtra', 'Konkan', 'Goa']
        }));
        festivals.push(createFestival("Shravana Purnima", 'minor', {
            description: "Full moon of Shravana — Avani Avittam (Upakarma) in South India",
            regional: ['South'],
            observances: ["Upakarma", "Sacred thread change"],
            isFastingDay: true
        }));
    }

    if (masaIndex === 4 && udayaTithi === 18) {
        festivals.push(createFestival("Kajari Teej", 'vrat', {
            description: "Third Teej of the season — Shiva-Parvati worship",
            regional: ['North', 'UP', 'MP', 'Bihar'],
            isFastingDay: true
        }));
    }

    // FIX: Dahi Handi moved here from Bhadrapada; it is observed one day
    // after Janmashtami (Shravana Krishna Navami → tithi 24)
    if (masaIndex === 4 && udayaTithi === 24) {
        festivals.push(createFestival("Dahi Handi", 'major', {
            description: "Breaking of suspended curd pot — celebrating Krishna's childhood butter theft",
            regional: ['Maharashtra', 'Konkan', 'Mumbai'],
            observances: ["Human pyramid (Govinda)", "Singing"]
        }));
    }

    if (masaIndex === 4 && udayaTithi === 23) {
        festivals.push(createFestival("Krishna Janmashtami", 'major', {
            description: "Birth of Lord Krishna — Shravana Krishna Ashtami",
            observances: ["Fasting", "Midnight celebrations", "Dahi Handi", "Bhajan Sandhya"],
            isFastingDay: true
        }));
    }

    // =========================================================
    // BHADRAPADA (masa 5)
    // =========================================================

    if (masaIndex === 5 && udayaTithi === 3) {
        festivals.push(createFestival("Hartalika Teej", 'vrat', {
            description: "Shiva-Parvati puja for marital bliss — sandless fast",
            isFastingDay: true,
            observances: ["All-night vigil", "Sand Parvati image worship"]
        }));
        festivals.push(createFestival("Gowri Habba", 'vrat', {
            description: "Worship of Goddess Gowri (Parvati) — eve of Ganesh Chaturthi",
            regional: ['Karnataka', 'South']
        }));
    }

    if (masaIndex === 5 && udayaTithi === 4) {
        festivals.push(createFestival("Ganesh Chaturthi", 'major', {
            description: "Birth of Lord Ganesha — 10-day festival",
            observances: ["Ganesha idol installation", "Modak offerings", "Aarti", "Visarjan"],
            regional: ['Maharashtra', 'Karnataka', 'Andhra']
        }));
    }

    if (masaIndex === 5 && udayaTithi === 5) {
        festivals.push(createFestival("Rishi Panchami", 'vrat', {
            description: "Worship of Saptarishi (seven sages) — women observe atonement fast",
            observances: ["Saptarishi puja", "Fasting"]
        }));
    }

    if (masaIndex === 5 && udayaTithi === 8) {
        festivals.push(createFestival("Radha Ashtami", 'jayanti', {
            description: "Birth anniversary of Goddess Radha — consort of Krishna",
            observances: ["Radha puja", "Bhajan sandhya"]
        }));
        festivals.push(createFestival("Durva Ashtami", 'vrat', {
            description: "Offering Durva (Bermuda grass) to Lord Ganesha",
            observances: ["21 Durva blade offering"]
        }));
    }

    if (masaIndex === 5 && udayaTithi === 11) {
        // Consolidated: Parsva Ekadashi = Parivartini Ekadashi (same festival)
        festivals.push(createFestival("Parsva Ekadashi (Parivartini)", 'ekadashi', {
            description: "Vishnu turns sides in cosmic sleep (Parsva Parivartana)",
            isFastingDay: true,
            observances: ["Fasting", "Vishnu puja", "Dwadashi parana"]
        }));
    }

    if (masaIndex === 5 && udayaTithi === 12) {
        festivals.push(createFestival("Vamana Jayanti", 'jayanti', {
            description: "Birth anniversary of Vamana — the dwarf avatar of Vishnu",
            observances: ["Vamana puja", "Daana (charity)"]
        }));
    }

    if (masaIndex === 5 && udayaTithi === 14) {
        festivals.push(createFestival("Anant Chaturdashi", 'major', {
            description: "Worship of Ananta (Vishnu) — Anant Vrat thread tied on wrist",
            observances: ["Ananta puja", "Vrat thread"]
        }));
        festivals.push(createFestival("Ganesh Visarjan", 'major', {
            description: "Immersion of Ganesha idols on the 10th day",
            observances: ["Procession", "Immersion in water body"]
        }));
    }

    if (masaIndex === 5 && udayaTithi === 15) {
        festivals.push(createFestival("Purnima Shraddha", 'minor', {
            description: "First day of Pitru Paksha — Purnima Shraddha for ancestors"
        }));
    }

    if (masaIndex === 5 && udayaTithi === 30) {
        festivals.push(createFestival("Sarva Pitru Amavasya (Mahalaya)", 'major', {
            description: "Last and most important day of Pitru Paksha — all ancestor worship",
            observances: ["Tarpan", "Pinda Daan", "Brahmin bhojan"]
        }));
    }

    // =========================================================
    // ASHWINA (masa 6)
    // =========================================================

    if (masaIndex === 6 && udayaTithi === 1) {
        festivals.push(createFestival("Navaratri Ghatasthapana", 'major', {
            description: "Sharad Navaratri Day 1 — Worship of Maa Shailputri; Kalash installation",
            observances: ["Kalash sthapana", "Fasting begins", "Akhand Jyot"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 2) {
        festivals.push(createFestival("Navaratri Dwitiya", 'minor', {
            description: "Navaratri Day 2 — Worship of Maa Brahmacharini"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 3) {
        festivals.push(createFestival("Navaratri Tritiya", 'minor', {
            description: "Navaratri Day 3 — Worship of Maa Chandraghanta"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 4) {
        festivals.push(createFestival("Navaratri Chaturthi", 'minor', {
            description: "Navaratri Day 4 — Worship of Maa Kushmanda"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 5) {
        festivals.push(createFestival("Navaratri Panchami", 'minor', {
            description: "Navaratri Day 5 — Worship of Maa Skandamata"
        }));
        festivals.push(createFestival("Upang Lalita Vrat", 'vrat', {
            description: "Worship of Goddess Lalita Devi on Navaratri Day 5"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 6) {
        festivals.push(createFestival("Navaratri Shashthi", 'minor', {
            description: "Navaratri Day 6 — Worship of Maa Katyayani"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 7) {
        festivals.push(createFestival("Navaratri Saptami", 'minor', {
            description: "Navaratri Day 7 — Worship of Maa Kaalratri"
        }));
    }

    if (masaIndex === 6 && udayaTithi === 8) {
        festivals.push(createFestival("Durga Ashtami (Maha Ashtami)", 'major', {
            description: "Navaratri Day 8 — Worship of Maa Mahagauri",
            observances: ["Durga puja", "Kumari puja", "Sandhi puja at Ashtami-Navami junction"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 9) {
        festivals.push(createFestival("Maha Navami", 'major', {
            description: "Navaratri Day 9 — Worship of Maa Siddhidatri",
            observances: ["Durga worship", "Ayudha puja", "Kanya Pujan"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 10) {
        festivals.push(createFestival("Vijaya Dashami (Dussehra)", 'major', {
            description: "Victory of good over evil — Rama's victory over Ravana",
            observances: ["Ravana effigy burning", "Shami tree worship", "Shaastra puja"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 15) {
        festivals.push(createFestival("Sharad Purnima", 'major', {
            description: "Full harvest moon — Goddess Lakshmi descends; Kheer left in moonlight",
            observances: ["Moonlight kheer offering", "River bathing"]
        }));
        festivals.push(createFestival("Valmiki Jayanti", 'jayanti', {
            description: "Birth anniversary of Maharishi Valmiki — author of Ramayana",
            observances: ["Valmiki puja", "Ramayan recitation"]
        }));
        festivals.push(createFestival("Kojagara Puja", 'minor', {
            description: "Night vigil for Lakshmi worship — 'Who is awake?' (Ko Jagara)",
            regional: ['Bengal', 'Odisha', 'East']
        }));
    }

    if (masaIndex === 6 && udayaTithi === 19) {
        festivals.push(createFestival("Karwa Chauth", 'vrat', {
            description: "Married women fast from sunrise to moonrise for husband's long life",
            isFastingDay: true,
            regional: ['North', 'UP', 'Punjab', 'Rajasthan', 'Delhi'],
            observances: ["Sunrise-to-moonrise fast", "Moon sighting through sieve"]
        }));
    }

    // FIX: Ahoi Ashtami moved to Kartika (masa 7) below
    if (masaIndex === 6 && udayaTithi === 23) {
        festivals.push(createFestival("Jivitputrika Vrat (Jitiya)", 'vrat', {
            description: "Mothers observe nirjala (waterless) fast for children's well-being",
            regional: ['Bihar', 'Jharkhand', 'UP', 'Nepal'],
            isFastingDay: true,
            observances: ["Nirjala fast", "Jivitputrika story recitation"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 28) {
        festivals.push(createFestival("Dhanteras (Dhanatrayodashi)", 'major', {
            description: "Festival of wealth and health — Lakshmi and Dhanvantari worship",
            observances: ["Gold/silver/utensil purchase", "Lakshmi puja", "Yama Deepak outside home"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 29) {
        festivals.push(createFestival("Naraka Chaturdashi (Choti Diwali)", 'major', {
            description: "Celebration of Krishna's victory over demon Narakasura",
            observances: ["Abhyanga snan (oil bath) before sunrise", "Lamps lit"]
        }));
    }

    if (masaIndex === 6 && udayaTithi === 30) {
        festivals.push(createFestival("Diwali (Lakshmi Puja)", 'major', {
            description: "Festival of Lights — Lakshmi-Ganesha puja on Kartika Amavasya",
            observances: ["Lakshmi-Ganesha puja", "Fireworks", "Diyas", "Sweets exchange", "Gambling tradition"]
        }));
    }

    // =========================================================
    // KARTIKA (masa 7)
    // =========================================================

    if (masaIndex === 7 && udayaTithi === 1) {
        festivals.push(createFestival("Govardhan Puja", 'major', {
            description: "Worship of Govardhan Hill — Krishna lifted it to protect Braj from Indra's wrath",
            observances: ["Annakut (mountain of food offered)", "Cow worship"]
        }));
        festivals.push(createFestival("Bali Pratipada", 'major', {
            description: "King Bali's return from netherworld; New Year in some regions",
            regional: ['Maharashtra', 'Karnataka', 'South']
        }));
    }

    if (masaIndex === 7 && udayaTithi === 2) {
        festivals.push(createFestival("Bhai Dooj (Yama Dwitiya)", 'major', {
            description: "Sister-brother bond celebration — Yama visits sister Yamuna",
            observances: ["Tilak ceremony", "Sister's prayers for brother", "Gift exchange"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 4) {
        festivals.push(createFestival("Karva Chauth (Kartik)", 'vrat', {
            description: "Regional variant: some communities observe Karva Chauth in Kartika Shukla",
            regional: ['Some North traditions'],
            isFastingDay: true
        }));
    }

    if (masaIndex === 7 && udayaTithi === 6) {
        festivals.push(createFestival("Chhath Puja", 'major', {
            description: "Four-day Sun god (Chhathi Maiya/Surya) worship — one of the most rigorous Hindu festivals",
            regional: ['Bihar', 'Jharkhand', 'UP', 'Nepal'],
            observances: ["Nahay-Khay", "Kharna", "Sandhya Arghya to setting Sun", "Usha Arghya to rising Sun"]
        }));
    }

    // PRIMARY Skanda Sashti (Kanda Sashti): Kartika Shukla Shashthi is the
    // canonical Skanda Sashti — a 6-day fast culminating in Soorasamharam
    // (Murugan's victory over demon Soorapadman). Most important in Tamil Nadu.
    if (masaIndex === 7 && udayaTithi === 6) {
        festivals.push(createFestival("Skanda Sashti (Kanda Sashti)", 'major', {
            description: "Six-day fast culminating in Lord Murugan's victory over demon Soorapadman (Soorasamharam)",
            regional: ['South', 'Tamil Nadu', 'Kerala', 'Sri Lanka'],
            isFastingDay: true,
            observances: ["6-day fast", "Kavadi", "Vel worship", "Soorasamharam re-enactment"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 8) {
        festivals.push(createFestival("Gopashtami", 'minor', {
            description: "Krishna formally becomes a cowherd; cow and cowherd worship",
            regional: ['Brij', 'North']
        }));
    }

    if (masaIndex === 7 && udayaTithi === 9) {
        festivals.push(createFestival("Akshaya Navami (Amla Navami)", 'minor', {
            description: "Worship of Amla (Indian gooseberry) tree — Vishnu resides in it this day",
            observances: ["Amla tree circumambulation", "Food cooked under tree"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 10) {
        festivals.push(createFestival("Kansa Vadh", 'minor', {
            description: "Commemoration of Krishna slaying the demon king Kansa"
        }));
    }

    if (masaIndex === 7 && udayaTithi === 11) {
        festivals.push(createFestival("Devutthana Ekadashi (Prabodhini)", 'ekadashi', {
            description: "Lord Vishnu wakes from cosmic sleep — end of Chaturmas; auspicious season begins",
            isFastingDay: true,
            observances: ["Fasting", "End of Chaturmas", "Tulsi Vivah performed", "Weddings resume"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 12) {
        festivals.push(createFestival("Tulasi Vivah", 'minor', {
            description: "Ceremonial marriage of Tulasi plant with Lord Vishnu (Shaligram)",
            observances: ["Tulasi-Shaligram puja", "Wedding rituals", "Sugarcane canopy"]
        }));
    }

    // FIX: Ahoi Ashtami moved here (Kartika Krishna Ashtami = tithi 23)
    if (masaIndex === 7 && udayaTithi === 23) {
        festivals.push(createFestival("Ahoi Ashtami", 'vrat', {
            description: "Mothers fast from sunrise to starrise for children's well-being",
            regional: ['North', 'UP', 'Rajasthan', 'Punjab', 'Delhi'],
            isFastingDay: true,
            observances: ["Starrise-time puja", "Ahoi Mata story recitation"]
        }));
    }

    if (masaIndex === 7 && udayaTithi === 15) {
        festivals.push(createFestival("Kartik Purnima / Dev Diwali", 'major', {
            description: "Gods celebrate Diwali — Tripura Nasini (Shiva destroys Tripura); grand lamp festival at Varanasi ghats",
            observances: ["River bathing at Varanasi", "Diyas on river", "Boat puja", "Pushkar Fair"]
        }));
    }

    // =========================================================
    // MARGASHIRSHA (masa 8)
    // =========================================================

    if (masaIndex === 8 && udayaTithi === 1) {
        festivals.push(createFestival("Margashirsha Shukla Pratipada", 'minor', {
            description: "Lord Krishna's favourite month begins (BG 10.35)"
        }));
    }

    if (masaIndex === 8 && udayaTithi === 5) {
        festivals.push(createFestival("Vivah Panchami", 'minor', {
            description: "Divine marriage anniversary of Lord Rama and Goddess Sita",
            observances: ["Rama-Sita wedding re-enactment", "Bhajan"]
        }));
    }

    if (masaIndex === 8 && udayaTithi === 11) {
        festivals.push(createFestival("Gita Jayanti", 'minor', {
            description: "Anniversary of Lord Krishna's Bhagavad Gita discourse to Arjuna",
            observances: ["Gita recitation", "Gita Yajna", "Gita distribution"]
        }));
    }

    if (masaIndex === 8 && udayaTithi === 15) {
        festivals.push(createFestival("Dattatreya Jayanti", 'jayanti', {
            description: "Birth anniversary of Lord Dattatreya — combined avatar of Brahma, Vishnu, Shiva",
            observances: ["Dattatreya puja", "All-night bhajan"]
        }));
        festivals.push(createFestival("Annapurna Jayanti", 'jayanti', {
            description: "Birthday of Goddess Annapurna — goddess of food and nourishment"
        }));
    }

    if (masaIndex === 8 && udayaTithi === 23) {
        festivals.push(createFestival("Kalabhairav Jayanti", 'jayanti', {
            description: "Birth of Lord Kalabhairava — fierce form of Shiva, guardian of Kashi",
            observances: ["Night puja", "Bhairav ashtami fast"]
        }));
    }

    // =========================================================
    // PAUSHA (masa 9)
    // =========================================================

    if (masaIndex === 9 && udayaTithi === 6) {
        // Pausha Skanda Sashti: monthly Shukla Shashthi Murugan worship.
        // The PRIMARY / most important Skanda Sashti is in Kartika (masa 7) above.
        festivals.push(createFestival("Skanda Sashti", 'vrat', {
            description: "Monthly Shukla Shashthi worship of Lord Murugan (Skanda/Kartikeya). The principal Skanda Sashti is Kartika Shukla Shashthi (Kanda Sashti).",
            regional: ['South', 'Tamil Nadu', 'Kerala'],
            isFastingDay: true,
            observances: ["Murugan puja", "Vel worship"]
        }));
    }

    if (masaIndex === 9 && udayaTithi === 8) {
        festivals.push(createFestival("Banada Ashtami", 'vrat', {
            description: "Shakambhari Navratri observance — Goddess Shakambhari worship",
            regional: ['Rajasthan', 'North']
        }));
    }

    if (masaIndex === 9 && udayaTithi === 11) {
        festivals.push(createFestival("Pausha Putrada Ekadashi", 'ekadashi', {
            description: "Ekadashi for those wishing for progeny — Vishnu worship",
            isFastingDay: true,
            observances: ["Fasting", "Vishnu worship", "Satyanarayan Katha"]
        }));
    }

    if (masaIndex === 9 && udayaTithi === 15) {
        festivals.push(createFestival("Pausha Purnima", 'minor', {
            description: "Sacred bathing day — start of month-long Magha mela bathing",
            isFastingDay: true
        }));
        festivals.push(createFestival("Shakambhari Purnima", 'jayanti', {
            description: "End of Shakambari Navratri — Goddess Shakambhari (vegetable goddess) worship"
        }));
    }

    // =========================================================
    // MAGHA (masa 10)
    // =========================================================

    if (masaIndex === 10 && udayaTithi === 1) {
        festivals.push(createFestival("Magha Gupta Navratri Begins", 'minor', {
            description: "Start of Magha Gupta Navratri — hidden Navratri for Tantric practice"
        }));
    }

    if (masaIndex === 10 && udayaTithi === 5) {
        festivals.push(createFestival("Vasant Panchami (Shri Panchami)", 'major', {
            description: "Arrival of spring — Goddess Saraswati worship; yellow-clad celebrations",
            observances: ["Saraswati puja", "Yellow clothes worn", "Books/instruments worshipped", "Kite flying in Punjab"]
        }));
    }

    if (masaIndex === 10 && udayaTithi === 7) {
        festivals.push(createFestival("Ratha Saptami", 'minor', {
            description: "Sun god's chariot turns northward — Surya's seven-horse chariot worship",
            observances: ["Surya puja", "Ayilyam leaves bath", "108 Surya Namaskara"]
        }));
    }

    if (masaIndex === 10 && udayaTithi === 8) {
        festivals.push(createFestival("Bhishma Ashtami", 'minor', {
            description: "Death anniversary of Bhishma Pitamaha — tarpan offered for paternal lineage",
            observances: ["Bhishma tarpan", "Pitru shraddha"]
        }));
    }

    // FIX: Masik Shivaratri is suppressed in Magha — Maha Shivaratri
    // is handled separately as a night-festival in getFestivals().
    // The recurring block at the bottom explicitly guards masaIndex === 10.

    if (masaIndex === 10 && udayaTithi === 13 && vara === 0) {
        // Maghi is a solar festival (Makar Sankranti) celebrated in Punjab.
        // It has no fixed lunar tithi; vara === 0 (Sunday) is used as a
        // best-effort guard so it doesn't fire on every Magha Trayodashi.
        // For accurate placement, use the solar SOLAR_FESTIVALS Makar Sankranti
        // entry instead — this block is a lunar fallback only.
        festivals.push(createFestival("Maghi (approx.)", 'minor', {
            description: "Punjabi Maghi — traditionally on Makar Sankranti (solar). Lunar tithi 13 + Sunday is an approximation; prefer the solar festival entry.",
            regional: ['Punjab', 'North'],
            observances: ["Sacred bathing at Muktsar", "Prayers"]
        }));
    }

    if (masaIndex === 10 && udayaTithi === 15) {
        festivals.push(createFestival("Magha Purnima", 'minor', {
            description: "Most sacred bathing day of Magha mela — charity and fast",
            isFastingDay: true,
            observances: ["Sangam snan", "Charity", "Lamp offering"]
        }));
        festivals.push(createFestival("Thai Pusam", 'major', {
            description: "Worship of Lord Murugan (Skanda) — Kavadi festival",
            regional: ['South', 'Tamil Nadu', 'Malaysia', 'Singapore'],
            observances: ["Kavadi Attam", "Vel worship", "Piercing rituals"]
        }));
    }

    if (masaIndex === 10 && udayaTithi === 19) {
        festivals.push(createFestival("Sakat Chauth (Sankashti)", 'vrat', {
            description: "Ganesha worship for removing obstacles — Tilkuta (sesame-jaggery) offered",
            isFastingDay: true,
            observances: ["Moonrise-time Ganesha puja", "Fasting until moonrise", "Sesame-jaggery offering"]
        }));
    }

    // FIX: Mauni Amavasya moved here from Pausha (masa 9)
    if (masaIndex === 10 && udayaTithi === 30) {
        festivals.push(createFestival("Mauni Amavasya", 'minor', {
            description: "Day of silence — most auspicious bathing day of Magh Mela; mauna (silence) vow kept",
            observances: ["Mauna vrat (silence)", "Sangam snan", "Charity"]
        }));
    }

    // =========================================================
    // PHALGUNA (masa 11)
    // =========================================================

    if (masaIndex === 11 && udayaTithi === 2) {
        festivals.push(createFestival("Phulera Dooj", 'minor', {
            description: "Start of Holi festivities — flower offerings at Krishna temples; only auspicious day of Phalguna",
            observances: ["Flower play at temples", "Phag songs"]
        }));
    }

    // FIX: Holashtak Begins corrected from tithi 14 → tithi 8 (Phalguna Shukla Ashtami)
    if (masaIndex === 11 && udayaTithi === 8) {
        festivals.push(createFestival("Holashtak Begins", 'minor', {
            description: "Eight inauspicious days before Holi begin on Phalguna Shukla Ashtami",
            observances: ["No auspicious events (weddings, mundan etc.) for 8 days"]
        }));
    }

    if (masaIndex === 11 && udayaTithi === 11) {
        festivals.push(createFestival("Amalaki Ekadashi", 'ekadashi', {
            description: "Worship of Amla tree and Lord Vishnu — very auspicious Ekadashi",
            isFastingDay: true,
            observances: ["Fasting", "Amla tree puja", "Vishnu worship", "Charity"]
        }));
    }

    if (masaIndex === 11 && udayaTithi === 15) {
        festivals.push(createFestival("Holika Dahan", 'major', {
            description: "Bonfire night — burning of demoness Holika; triumph of devotion over evil",
            observances: ["Bonfire", "Pradakshina (circumambulation)", "Prayers"]
        }));
    }

    // Holi is the day AFTER Holika Dahan — Krishna Pratipada (tithi 16) of Phalguna
    if (masaIndex === 11 && udayaTithi === 16) {
        festivals.push(createFestival("Holi (Rangwali / Dhulandi)", 'major', {
            description: "Festival of colors — celebrated on Krishna Pratipada, day after Holika Dahan",
            observances: ["Gulal (dry color)", "Pichkari (water guns)", "Bhang", "Community celebrations"]
        }));
    }

    if (masaIndex === 11 && udayaTithi === 20) {
        festivals.push(createFestival("Ranga Panchami", 'minor', {
            description: "Holi with dry colors (gulal) — celebrated 5 days after Holi in Deccan",
            regional: ['Maharashtra', 'MP', 'Deccan']
        }));
    }

    // =========================================================
    // RECURRING MONTHLY OBSERVANCES
    // =========================================================

    // Vinayaka Chaturthi — Shukla Chaturthi (tithi 4), every month
    if (udayaTithi === 4) {
        festivals.push(createFestival("Vinayaka Chaturthi", 'vrat', {
            description: "Monthly Shukla Chaturthi Ganesha worship",
            observances: ["Ganesha puja", "Modak offering"]
        }));
    }

    // Sankashti Chaturthi — Krishna Chaturthi (tithi 19), every month
    if (udayaTithi === 19) {
        festivals.push(createFestival("Sankashti Chaturthi", 'vrat', {
            description: "Monthly Ganesha worship for removing obstacles — fast until moonrise",
            isFastingDay: true,
            observances: ["Moonrise-time puja", "Fasting until moonrise"]
        }));
    }

    // Purnima — full moon (tithi 15), every month
    if (udayaTithi === 15) {
        festivals.push(createFestival("Purnima", 'minor', {
            description: "Full Moon — auspicious for charity, Satyanarayan puja and river bathing",
            isFastingDay: true,
            observances: ["Satyanarayan Puja", "River bathing", "Lamp offering"]
        }));
    }

    // Amavasya — new moon (tithi 30), every month
    if (udayaTithi === 30) {
        festivals.push(createFestival("Amavasya", 'minor', {
            description: "New Moon — ancestral prayers and Pitru Tarpan",
            observances: ["Pitru Tarpan", "Ancestor remembrance", "Shradh"]
        }));
    }

    // Masik Shivaratri — Krishna Chaturdashi (tithi 29), every month
    // FIX: suppressed in Magha (masa 10) — Maha Shivaratri is the special case there
    if (udayaTithi === 29 && masaIndex !== 10) {
        festivals.push(createFestival("Masik Shivaratri", 'vrat', {
            description: "Monthly Shiva worship night — fast and evening puja",
            isFastingDay: true,
            observances: ["Night vigil", "Shiva puja", "Rudrabhishek"]
        }));
    }

    // Ekadashi — Shukla (tithi 11) and Krishna (tithi 26), every month
    if (udayaTithi === 11 || udayaTithi === 26) {
        const ekadashiName = getEkadashiName(masaIndex, paksha, isAdhika);
        if (!festivals.some(f => f.name === ekadashiName)) {
            festivals.push(createFestival(ekadashiName, 'ekadashi', {
                isFastingDay: true,
                observances: ["Fasting", "Vishnu worship", "Tulasi puja", "Dwadashi parana"]
            }));
        }
    }

    // Pradosham — Shukla Trayodashi (tithi 13) and Krishna Trayodashi (tithi 28)
    if (udayaTithi === 13 || udayaTithi === 28) {
        const pradoshamType = (udayaTithi === 13) ? "Shukla" : "Krishna";
        festivals.push(createFestival(`Pradosham (${pradoshamType})`, 'pradosham', {
            description: "Auspicious twilight window (Pradosh Kala) for Shiva worship",
            observances: ["Evening Shiva puja", "Pradosh Vrat", "Shiva Tandava path"]
        }));
    }

    return festivals;
}

// ---------------------------------------------------------------------------
// Upcoming Festivals Scanner
// ---------------------------------------------------------------------------

export interface UpcomingFestivalsOptions {
    /** Start date to scan from */
    date: Date;
    /** Observer location for sunrise calculations */
    observer: Observer;
    /** Number of days to scan ahead (default: 30) */
    days?: number;
    /** Timezone offset in minutes (e.g. 330 for IST) */
    timezoneOffset?: number;
    /** Minimum festival category to include (default: all) */
    categories?: FestivalCategory[];
}

/**
 * Scan ahead N days and return all upcoming festivals.
 *
 * Useful for "upcoming festivals" widgets where calling `getPanchangam` for
 * a single date might return zero festivals.
 *
 * @param options - Scan options including date, observer, and number of days
 * @returns Array of festivals with their dates, sorted chronologically
 *
 * @example
 * ```typescript
 * const upcoming = getUpcomingFestivals({
 *     date: new Date(),
 *     observer: new Observer(12.97, 77.59, 920),
 *     days: 30,
 *     timezoneOffset: 330
 * });
 * ```
 */
export function getUpcomingFestivals(options: UpcomingFestivalsOptions): Festival[] {
    const { date, observer, days = 30, timezoneOffset, categories } = options;
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const allFestivals: Festival[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < days; i++) {
        const d = new Date(date.getTime() + i * MS_PER_DAY);

        // Get sunrise for this day
        const { getSunrise, getSunset, getVara, getMasa, getPaksha, getTithi, getNakshatra } = require('./calculations');
        const { getAyanamsa: getAya } = require('./ayanamsa');

        const sunrise = getSunrise(d, observer, { timezoneOffset });
        const sunset = getSunset(d, observer, { timezoneOffset });
        const anchorDate = sunrise || d;
        const ayanamsa = getAya(anchorDate);

        const { Body: B, GeoVector: GV, Ecliptic: Ecl } = require('astronomy-engine');
        const sunVec = GV(B.Sun, anchorDate, true);
        const moonVec = GV(B.Moon, anchorDate, true);
        const sunLon = (Ecl(sunVec).elon - ayanamsa + 360) % 360;
        const moonLon = (Ecl(moonVec).elon - ayanamsa + 360) % 360;

        const tithi = getTithi(sunLon, moonLon);
        const masa = getMasa(sunLon, moonLon, anchorDate);
        const paksha = getPaksha(tithi);
        const vara = getVara(anchorDate, observer, timezoneOffset);
        const nakshatra = getNakshatra(moonLon);

        const dayFestivals = getFestivals({
            date: d,
            observer,
            sunrise: sunrise || d,
            sunset: sunset || undefined,
            masa,
            paksha,
            tithi: tithi + 1,
            nakshatra,
            vara,
            includeSolarFestivals: true,
            includeMultiDaySpans: false,
            calendarType: 'amanta',
            timezoneOffset
        });

        for (const f of dayFestivals) {
            // Apply category filter
            if (categories && !categories.includes(f.category)) continue;

            // Deduplicate by name (same festival can span multiple algorithm passes)
            const key = `${f.name}-${d.toISOString().slice(0, 10)}`;
            if (seen.has(key)) continue;
            seen.add(key);

            f.date = d; // Set the actual civil date
            allFestivals.push(f);
        }
    }

    return allFestivals;
}