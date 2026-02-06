/**
 * Festival Calculation Logic - v3.0.0
 * 
 * Complete redesign with Udaya Tithi support, proper categorization,
 * and multi-day festival spans.
 */

import type { Festival, FestivalCalculationOptions, FestivalCategory } from '../types/festivals.js';
import { masaNames, SOLAR_FESTIVALS, SANKRANTI_NAMES, MULTI_DAY_FESTIVALS } from './constants.js';
import { getTithiAtSunrise } from './udaya-tithi.js';
import { getSankrantiForDate } from './calculations.js';
import { getAyanamsa } from './ayanamsa.js';

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
 * Main Festival Calculation Function (v3.0.0)
 * 
 * Uses Udaya Tithi (sunrise Tithi) for accurate festival detection.
 * Returns structured Festival objects instead of strings.
 */
export function getFestivals(options: FestivalCalculationOptions): Festival[] {
    const festivals: Festival[] = [];

    const { date, observer, sunrise, masa, paksha, tithi: civilTithi } = options;

    // Skip Adhika Masa (no major festivals in extra month)
    if (masa.isAdhika) {
        return festivals;
    }

    // Calculate Udaya Tithi (Tithi at sunrise)
    const udayaTithi = getTithiAtSunrise(date, sunrise, observer);
    const masaIndex = masa.index;

    // Helper to create festival object
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
        masa: masa.name,
        ...metadata
    });

    // ===== MAJOR FESTIVALS =====

    // Ugadi / Gudi Padwa - Chaitra Shukla Prathama
    if (masaIndex === 0 && udayaTithi === 1) {
        festivals.push(createFestival("Ugadi / Gudi Padwa", 'major', {
            description: "Hindu New Year",
            observances: ["New Year celebrations", "Panchanga reading"],
            regional: ['South', 'Maharashtra']
        }));
        festivals.push(createFestival("Chaitra Navratri Ghatasthapana", 'major'));
    }

    // Rama Navami - Chaitra Shukla Navami
    if (masaIndex === 0 && udayaTithi === 9) {
        festivals.push(createFestival("Rama Navami", 'major', {
            description: "Birth of Lord Rama",
            observances: ["Rama Katha", "Chariot processions"],
            isFastingDay: true
        }));
    }

    // Hanuman Jayanti - Chaitra Purnima
    if (masaIndex === 0 && udayaTithi === 15) {
        festivals.push(createFestival("Hanuman Jayanti", 'jayanti', {
            description: "Birth of Lord Hanuman"
        }));
        festivals.push(createFestival("Chaitra Purnima", 'minor'));
    }

    // Sheetala Ashtami - Chaitra Krishna Ashtami
    if (masaIndex === 0 && udayaTithi === 23) {
        festivals.push(createFestival("Sheetala Ashtami (Basoda)", 'vrat', {
            description: "Worship of Goddess Sheetala for good health",
            isFastingDay: true,
            regional: ['North', 'Rajasthan']
        }));
    }

    // Gangaur - Chaitra Shukla Tritiya
    if (masaIndex === 0 && udayaTithi === 3) {
        festivals.push(createFestival("Gangaur", 'vrat', {
            description: "Worship of Goddess Gauri",
            regional: ['Rajasthan', 'MP']
        }));
    }

    // Yamuna Chhath - Chaitra Shukla Shashthi
    if (masaIndex === 0 && udayaTithi === 6) {
        festivals.push(createFestival("Yamuna Chhath (Yamuna Jayanti)", 'jayanti', {
            description: "Goddess Yamuna descended on earth",
            regional: ['Brij']
        }));
    }

    // Akshaya Tritiya - Vaishakha Shukla Tritiya
    if (masaIndex === 1 && udayaTithi === 3) {
        festivals.push(createFestival("Akshaya Tritiya", 'major', {
            description: "Auspicious day for new beginnings",
            observances: ["Gold purchases", "Charity"]
        }));
        festivals.push(createFestival("Parashurama Jayanti", 'jayanti'));
    }

    // Buddha Purnima - Vaishakha Purnima
    if (masaIndex === 1 && udayaTithi === 15) {
        festivals.push(createFestival("Buddha Purnima", 'major', {
            description: "Birth of Gautama Buddha"
        }));
        festivals.push(createFestival("Kurma Jayanti", 'jayanti', {
            description: "Birth anniversary of Kurma Avatar"
        }));
    }

    // Ganga Saptami - Vaishakha Shukla Saptami
    if (masaIndex === 1 && udayaTithi === 7) {
        festivals.push(createFestival("Ganga Saptami", 'minor', {
            description: "Rebirth of Goddess Ganga"
        }));
    }

    // Sita Navami - Vaishakha Shukla Navami
    if (masaIndex === 1 && udayaTithi === 9) {
        festivals.push(createFestival("Sita Navami (Janaki Jayanti)", 'jayanti', {
            description: "Birth anniversary of Goddess Sita",
            observances: ["Married women observe fast"]
        }));
    }

    // Narasimha Jayanti - Vaishakha Shukla Chaturdashi
    if (masaIndex === 1 && udayaTithi === 14) {
        festivals.push(createFestival("Narasimha Jayanti", 'jayanti', {
            description: "Appearance of Narasimha Avatar",
            observances: ["One-day fast"]
        }));
    }

    // ===== JYESHTHA (Masa 2) =====

    // Narada Jayanti - Jyeshtha Krishna Prathama
    if (masaIndex === 2 && udayaTithi === 16) {
        festivals.push(createFestival("Narada Jayanti", 'jayanti', {
            description: "Birth anniversary of Devrishi Narada Muni"
        }));
    }

    // Ganga Dussehra - Jyeshtha Shukla Dashami
    if (masaIndex === 2 && udayaTithi === 10) {
        festivals.push(createFestival("Ganga Dussehra", 'minor', {
            description: "Descent of Ganga to Earth"
        }));
    }

    // Mahesh Navami - Jyeshtha Shukla Navami
    if (masaIndex === 2 && udayaTithi === 9) {
        festivals.push(createFestival("Mahesh Navami", 'minor', {
            description: "Worship of Lord Shiva and Goddess Parvati"
        }));
    }

    // Gayatri Jayanti - Jyeshtha Shukla Ekadashi (alternate tradition)
    if (masaIndex === 2 && udayaTithi === 11) {
        festivals.push(createFestival("Gayatri Jayanti (Jyeshtha)", 'jayanti', {
            description: "Celebration of Goddess Gayatri"
        }));
    }

    // Vat Savitri Vrat - Jyeshtha Amavasya (Amanta)
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

    // Vat Purnima - Jyeshtha Purnima
    if (masaIndex === 2 && udayaTithi === 15) {
        festivals.push(createFestival("Vat Purnima", 'vrat', {
            description: "Married women fast for husband's longevity",
            regional: ['North'],
            isFastingDay: true
        }));
    }

    // Jagannath Rathyatra - Ashadha Shukla Dwitiya
    if (masaIndex === 3 && udayaTithi === 2) {
        festivals.push(createFestival("Jagannath Rathyatra", 'major', {
            description: "Annual chariot festival of Lord Jagannath",
            regional: ['Odisha', 'East']
        }));
    }

    // Guru Purnima - Ashadha Purnima
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

    // ===== SHRAVANA (Masa 4) =====

    // Hariyali Teej - Shravana Shukla Tritiya
    if (masaIndex === 4 && udayaTithi === 3) {
        festivals.push(createFestival("Hariyali Teej", 'vrat', {
            description: "Monsoon festival of greenery and swings",
            regional: ['North'],
            isFastingDay: true
        }));
    }

    // Nag Panchami - Shravana Shukla Panchami
    if (masaIndex === 4 && udayaTithi === 5) {
        festivals.push(createFestival("Nag Panchami", 'minor', {
            description: "Serpent worship"
        }));
        festivals.push(createFestival("Kalki Jayanti", 'jayanti'));
    }

    // Varalakshmi Vrat - Shravana Shukla Shukravar (Friday before Purnima)
    // Note: This requires day-of-week calculation which we approximate to Shukla Dwadashi
    if (masaIndex === 4 && udayaTithi === 12) {
        festivals.push(createFestival("Varalakshmi Vratam", 'vrat', {
            description: "Worship of Goddess Lakshmi for wealth and prosperity",
            regional: ['South', 'Karnataka', 'Andhra'],
            isFastingDay: true
        }));
    }

    // Raksha Bandhan - Shravana Purnima
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

    // Kajari Teej - Shravana/Bhadrapada Krishna Tritiya
    if (masaIndex === 4 && udayaTithi === 18) {
        festivals.push(createFestival("Kajari Teej", 'vrat', {
            description: "Third Teej festival",
            regional: ['North'],
            isFastingDay: true
        }));
    }


    // Krishna Janmashtami - Shravana Krishna Ashtami
    if (masaIndex === 4 && udayaTithi === 23) {
        festivals.push(createFestival("Krishna Janmashtami", 'major', {
            description: "Birth of Lord Krishna",
            observances: ["Fasting", "Midnight celebrations", "Dahi Handi"],
            isFastingDay: true
        }));
    }

    // Ganesh Chaturthi - Bhadrapada Shukla Chaturthi
    if (masaIndex === 5 && udayaTithi === 4) {
        festivals.push(createFestival("Ganesh Chaturthi", 'major', {
            description: "Birth of Lord Ganesha",
            observances: ["Ganesha idol worship", "Modak offerings"],
            regional: ['Maharashtra', 'Karnataka']
        }));
    }

    // Anant Chaturdashi - Bhadrapada Shukla Chaturdashi
    if (masaIndex === 5 && udayaTithi === 14) {
        festivals.push(createFestival("Anant Chaturdashi", 'major'));
        festivals.push(createFestival("Ganesh Visarjan", 'major', {
            description: "Immersion of Ganesha idols"
        }));
    }

    // Sarva Pitru Amavasya / Mahalaya - Bhadrapada Amavasya
    if (masaIndex === 5 && udayaTithi === 30) {
        festivals.push(createFestival("Sarva Pitru Amavasya (Mahalaya)", 'major', {
            description: "Last day of Pitru Paksha",
            observances: ["Ancestor worship", "Tarpan"]
        }));
    }

    // Navaratri Ghatasthapana - Ashwina Shukla Prathama
    if (masaIndex === 6 && udayaTithi === 1) {
        festivals.push(createFestival("Navaratri Ghatasthapana", 'major', {
            description: "Start of 9-day Durga worship",
            observances: ["Kalash sthapana", "Fasting begins"]
        }));
    }

    // Durga Ashtami - Ashwina Shukla Ashtami
    if (masaIndex === 6 && udayaTithi === 8) {
        festivals.push(createFestival("Durga Ashtami (Maha Ashtami)", 'major', {
            observances: ["Durga puja", "Kumari puja"]
        }));
    }

    // Maha Navami - Ashwina Shukla Navami
    if (masaIndex === 6 && udayaTithi === 9) {
        festivals.push(createFestival("Maha Navami", 'major', {
            observances: ["Durga worship", "Ayudha puja"]
        }));
    }

    // Vijaya Dashami / Dussehra - Ashwina Shukla Dashami
    if (masaIndex === 6 && udayaTithi === 10) {
        festivals.push(createFestival("Vijaya Dashami (Dussehra)", 'major', {
            description: "Victory of good over evil",
            observances: ["Ravana effigy burning", "Vijayadashami puja"]
        }));
    }

    // Sharad Purnima - Ashwina Purnima
    if (masaIndex === 6 && udayaTithi === 15) {
        festivals.push(createFestival("Sharad Purnima", 'major', {
            description: "Harvest festival, full moon night"
        }));
        festivals.push(createFestival("Valmiki Jayanti", 'jayanti'));
    }

    // Karwa Chauth - Ashwina Krishna Chaturthi
    if (masaIndex === 6 && udayaTithi === 19) {
        festivals.push(createFestival("Karwa Chauth", 'vrat', {
            description: "Fasting for husband's longevity",
            isFastingDay: true,
            regional: ['North']
        }));
    }

    // Dhanteras - Ashwina Krishna Trayodashi
    if (masaIndex === 6 && udayaTithi === 28) {
        festivals.push(createFestival("Dhanteras", 'major', {
            description: "Festival of wealth",
            observances: ["Gold/utensil purchases", "Lakshmi puja"]
        }));
    }

    // Naraka Chaturdashi / Choti Diwali - Ashwina Krishna Chaturdashi
    if (masaIndex === 6 && udayaTithi === 29) {
        festivals.push(createFestival("Naraka Chaturdashi (Choti Diwali)", 'major', {
            observances: ["Oil bath", "Lamps"]
        }));
    }

    // Diwali - Ashwina Amavasya
    if (masaIndex === 6 && udayaTithi === 30) {
        festivals.push(createFestival("Diwali (Lakshmi Puja)", 'major', {
            description: "Festival of Lights",
            observances: ["Lakshmi puja", "Fireworks", "Lamps", "Sweets"]
        }));
    }

    // Govardhan Puja / Bali Pratipada - Kartika Shukla Prathama
    if (masaIndex === 7 && udayaTithi === 1) {
        festivals.push(createFestival("Govardhan Puja", 'major'));
        festivals.push(createFestival("Bali Pratipada", 'major'));
    }

    // Bhai Dooj - Kartika Shukla Dwitiya
    if (masaIndex === 7 && udayaTithi === 2) {
        festivals.push(createFestival("Bhai Dooj", 'major', {
            description: "Sister-brother bond celebration"
        }));
    }

    // Chhath Puja - Kartika Shukla Shashthi
    if (masaIndex === 7 && udayaTithi === 6) {
        festivals.push(createFestival("Chhath Puja", 'major', {
            description: "Sun god worship",
            regional: ['Bihar', 'Jharkhand', 'UP'],
            observances: ["Fasting", "Arghya to Sun"]
        }));
    }

    // Kartik Purnima / Dev Diwali - Kartika Purnima
    if (masaIndex === 7 && udayaTithi === 15) {
        festivals.push(createFestival("Kartik Purnima / Dev Diwali", 'major', {
            observances: ["River bathing", "Diyas"]
        }));
    }

    // Dattatreya Jayanti - Margashirsha Purnima
    if (masaIndex === 8 && udayaTithi === 15) {
        festivals.push(createFestival("Dattatreya Jayanti", 'jayanti'));
    }

    // Vasant Panchami - Magha Shukla Panchami
    if (masaIndex === 10 && udayaTithi === 5) {
        festivals.push(createFestival("Vasant Panchami", 'major', {
            description: "Welcoming spring, Saraswati worship",
            observances: ["Saraswati puja", "Yellow clothes"]
        }));
    }

    // Maha Shivaratri - Magha Krishna Chaturdashi
    if (masaIndex === 10 && udayaTithi === 29) {
        festivals.push(createFestival("Maha Shivaratri", 'major', {
            description: "Great night of Shiva",
            observances: ["Fasting", "All-night vigil", "Shiva puja"],
            isFastingDay: true
        }));
    }

    // Holi / Holika Dahan - Phalguna Purnima
    if (masaIndex === 11 && udayaTithi === 15) {
        festivals.push(createFestival("Holi / Holika Dahan", 'major', {
            description: "Festival of colors",
            observances: ["Bonfire", "Colors next day"]
        }));
    }

    // ===== MINOR FESTIVALS =====

    // Ganga Saptami - Vaishakha Shukla Saptami
    if (masaIndex === 1 && udayaTithi === 7) {
        festivals.push(createFestival("Ganga Saptami", 'minor'));
    }

    // Vat Savitri Vrat - Jyeshtha Amavasya
    if (masaIndex === 2 && udayaTithi === 30) {
        festivals.push(createFestival("Vat Savitri Vrat", 'vrat', {
            regional: ['Maharashtra', 'Gujarat'],
            isFastingDay: true
        }));
        festivals.push(createFestival("Shani Jayanti", 'jayanti'));
    }

    // Vat Purnima - Jyeshtha Purnima
    if (masaIndex === 2 && udayaTithi === 15) {
        festivals.push(createFestival("Vat Purnima", 'vrat', {
            regional: ['North'],
            isFastingDay: true
        }));
    }

    // Ganga Dussehra - Jyeshtha Shukla Dashami
    if (masaIndex === 2 && udayaTithi === 10) {
        festivals.push(createFestival("Ganga Dussehra", 'minor'));
    }

    // Hariyali Teej - Shravana Shukla Tritiya
    if (masaIndex === 4 && udayaTithi === 3) {
        festivals.push(createFestival("Hariyali Teej", 'vrat', {
            regional: ['North'],
            isFastingDay: true
        }));
    }

    // Nag Panchami - Shravana Shukla Panchami
    if (masaIndex === 4 && udayaTithi === 5) {
        festivals.push(createFestival("Nag Panchami", 'minor', {
            description: "Serpent worship"
        }));
        festivals.push(createFestival("Kalki Jayanti", 'jayanti'));
    }

    // Hartalika Teej - Bhadrapada Shukla Tritiya
    if (masaIndex === 5 && udayaTithi === 3) {
        festivals.push(createFestival("Hartalika Teej", 'vrat', { isFastingDay: true }));
        festivals.push(createFestival("Gowri Habba", 'vrat', { regional: ['Karnataka'] }));
    }

    // Rishi Panchami - Bhadrapada Shukla Panchami
    if (masaIndex === 5 && udayaTithi === 5) {
        festivals.push(createFestival("Rishi Panchami", 'vrat'));
    }

    // Radha Ashtami - Bhadrapada Shukla Ashtami
    if (masaIndex === 5 && udayaTithi === 8) {
        festivals.push(createFestival("Radha Ashtami", 'jayanti'));
    }

    // Vamana Jayanti - Bhadrapada Shukla Dwadashi
    if (masaIndex === 5 && udayaTithi === 12) {
        festivals.push(createFestival("Vamana Jayanti", 'jayanti'));
    }

    // Purnima Shraddha - Bhadrapada Purnima
    if (masaIndex === 5 && udayaTithi === 15) {
        festivals.push(createFestival("Purnima Shraddha", 'minor', {
            description: "Start of Pitru Paksha"
        }));
    }

    // Ahoi Ashtami - Ashwina Krishna Ashtami
    if (masaIndex === 6 && udayaTithi === 23) {
        festivals.push(createFestival("Ahoi Ashtami", 'vrat', {
            regional: ['North'],
            isFastingDay: true
        }));
    }

    // Tulasi Vivah - Kartika Shukla Dwadashi
    if (masaIndex === 7 && udayaTithi === 12) {
        festivals.push(createFestival("Tulasi Vivah", 'minor'));
    }

    // Gita Jayanti - Margashirsha Shukla Ekadashi
    if (masaIndex === 8 && udayaTithi === 11) {
        festivals.push(createFestival("Gita Jayanti", 'minor'));
    }

    // Ratha Saptami - Magha Shukla Saptami
    if (masaIndex === 10 && udayaTithi === 7) {
        festivals.push(createFestival("Ratha Saptami", 'minor', {
            description: "Sun's chariot turning north"
        }));
    }

    // Ranga Panchami - Phalguna Krishna Panchami
    if (masaIndex === 11 && udayaTithi === 20) {
        festivals.push(createFestival("Ranga Panchami", 'minor'));
    }

    // ===== ADDITIONAL FESTIVALS FROM DRIK PANCHANG =====

    // Dahi Handi - Day after Janmashtami (Bhadrapada Krishna Navami)
    if (masaIndex === 5 && udayaTithi === 24) {
        festivals.push(createFestival("Dahi Handi", 'major', {
            description: "Breaking of curd pot, Krishna's childhood celebration",
            regional: ['Maharashtra']
        }));
    }

    // Durva Ashtami - Bhadrapada Shukla Ashtami
    if (masaIndex === 5 && udayaTithi === 8) {
        festivals.push(createFestival("Durva Ashtami", 'vrat', {
            description: "Offering Durva grass to Ganesha"
        }));
    }

    // Jivitputrika Vrat - Ashwin Krishna Ashtami
    if (masaIndex === 6 && udayaTithi === 23) {
        festivals.push(createFestival("Jivitputrika Vrat (Jitiya)", 'vrat', {
            description: "Mothers fast for well-being of children",
            regional: ['Bihar', 'Jharkhand', 'UP'],
            isFastingDay: true
        }));
    }

    // Upang Lalita Vrat - Ashwin Shukla Panchami
    if (masaIndex === 6 && udayaTithi === 5) {
        festivals.push(createFestival("Upang Lalita Vrat", 'vrat', {
            description: "Navaratri observance"
        }));
    }

    // Kojagara Puja - Ashwin Purnima
    if (masaIndex === 6 && udayaTithi === 15) {
        festivals.push(createFestival("Kojagara Puja", 'minor', {
            description: "Night vigil for Lakshmi worship",
            regional: ['Bengal', 'Odisha']
        }));
    }

    // Gopashtami - Kartik Shukla Ashtami
    if (masaIndex === 7 && udayaTithi === 8) {
        festivals.push(createFestival("Gopashtami", 'minor', {
            description: "Krishna becomes cowherd, cow worship"
        }));
    }

    // Kansa Vadh - Kartik Shukla Dashami
    if (masaIndex === 7 && udayaTithi === 10) {
        festivals.push(createFestival("Kansa Vadh", 'minor', {
            description: "Krishna slaying of Kansa"
        }));
    }

    // Kalabhairav Jayanti - Margashirsha Krishna Ashtami
    if (masaIndex === 8 && udayaTithi === 23) {
        festivals.push(createFestival("Kalabhairav Jayanti", 'jayanti', {
            description: "Birth of Lord Kalabhairava"
        }));
    }

    // Vivah Panchami - Margashirsha Shukla Panchami
    if (masaIndex === 8 && udayaTithi === 5) {
        festivals.push(createFestival("Vivah Panchami", 'minor', {
            description: "Marriage anniversary of Rama and Sita"
        }));
    }

    // Annapurna Jayanti - Margashirsha Purnima
    if (masaIndex === 8 && udayaTithi === 15) {
        festivals.push(createFestival("Annapurna Jayanti", 'jayanti', {
            description: "Birthday of Goddess Annapurna"
        }));
    }

    // Saphala Ekadashi is already covered by Ekadashi logic

    // Banada Ashtami - Paush Shukla Ashtami
    if (masaIndex === 9 && udayaTithi === 8) {
        festivals.push(createFestival("Banada Ashtami", 'vrat', {
            description: "Shakambari Navratri observance"
        }));
    }

    // Shakambhari Purnima / Pausha Purnima - Paush Purnima
    if (masaIndex === 9 && udayaTithi === 15) {
        festivals.push(createFestival("Pausha Purnima", 'minor', {
            description: "Sacred bathing day"
        }));
        festivals.push(createFestival("Shakambhari Purnima", 'jayanti', {
            description: "End of Shakambari Navratri"
        }));
    }

    // Sakat Chauth - Magha Krishna Chaturthi
    if (masaIndex === 10 && udayaTithi === 19) {
        festivals.push(createFestival("Sakat Chauth (Sankashti)", 'vrat', {
            description: "Ganesha worship for removing obstacles",
            isFastingDay: true
        }));
    }

    // Bhishma Ashtami - Magha Shukla Ashtami
    if (masaIndex === 10 && udayaTithi === 8) {
        festivals.push(createFestival("Bhishma Ashtami", 'minor', {
            description: "Death anniversary of Bhishma Pitamaha"
        }));
    }

    // Phulera Dooj - Phalguna Shukla Dwitiya
    if (masaIndex === 11 && udayaTithi === 2) {
        festivals.push(createFestival("Phulera Dooj", 'minor', {
            description: "Start of Holi festivities, flower offerings"
        }));
    }

    // ===== EKADASHI & PRADOSHAM =====

    // Ekadashi - Tithi 11 (Shukla) or 26 (Krishna)
    if (udayaTithi === 11 || udayaTithi === 26) {
        const ekadashiName = getEkadashiName(masaIndex, paksha);
        festivals.push(createFestival(ekadashiName, 'ekadashi', {
            isFastingDay: true,
            observances: ["Fasting", "Vishnu worship"]
        }));
    }

    // Pradosham - Tithi 13 (Shukla) or 28 (Krishna)
    if (udayaTithi === 13 || udayaTithi === 28) {
        const pradoshamType = (udayaTithi === 13) ? "Shukla" : "Krishna";
        festivals.push(createFestival(`Pradosham (${pradoshamType})`, 'pradosham', {
            description: "Auspicious time for Shiva worship",
            observances: ["Evening Shiva puja"]
        }));
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
 * Legacy function for backward compatibility
 * @deprecated Use getFestivals() with FestivalCalculationOptions instead
 */
export function getFestivalsLegacy(
    masaIndex: number,
    isAdhika: boolean,
    paksha: string,
    tithiIndex: number,
    vara?: number
): string[] {
    // This is kept for reference only
    return [];
}
