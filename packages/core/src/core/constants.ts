export const repeatingKaranaNames = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"
];

export const fixedKaranaNames = [
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

export const karanaNames = [...repeatingKaranaNames, ...fixedKaranaNames];

export const yogaNames = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha",
    "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const tithiNames = [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const rashiNames = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const horaRulers = [
    "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"
];

export const masaNames = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

export const rituNames = [
    "Vasant", "Grishma", "Varsha", "Sharad", "Hemant", "Shishir"
];

export const ayanaNames = [
    "Uttarayana", "Dakshinayana"
];

// Day of week names (0 = Sunday, 6 = Saturday)
export const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export const pakshaNames = [
    "Shukla", "Krishna"
];

export const samvatsaraNames = [
    "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angira", "Srimukha", "Bhava", "Yuva", "Dhatru",
    "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrusha", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
    "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
    "Hemalamba", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava",
    "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
    "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];

// Sankranti names for each Rashi (Sun's ingress into Rashi)
// Index 0 = Aries (Mesh Sankranti), Index 9 = Capricorn (Makar Sankranti)
export const sankrantiNames = [
    "Mesh Sankranti",      // 0: Aries - Hindu New Year in some traditions
    "Vrishabh Sankranti",  // 1: Taurus
    "Mithun Sankranti",    // 2: Gemini
    "Kark Sankranti",      // 3: Cancer - Summer Solstice region
    "Simha Sankranti",     // 4: Leo
    "Kanya Sankranti",     // 5: Virgo
    "Tula Sankranti",      // 6: Libra - Start of Dakshinayana
    "Vrischik Sankranti",  // 7: Scorpio
    "Dhanu Sankranti",     // 8: Sagittarius
    "Makar Sankranti",     // 9: Capricorn - Most celebrated, start of Uttarayana
    "Kumbh Sankranti",     // 10: Aquarius
    "Meen Sankranti"       // 11: Pisces
];

// Varjyam Start Times (in Ghatis) for each Nakshatra (0-26)
// 1 Ghati = 24 Minutes
// Can be a single number or array of numbers (e.g. Mula has 20 and 56 in some traditions)
export const varjyamStartGhatis: (number | number[])[] = [
    50, // Ashwini
    24, // Bharani
    30, // Krittika
    40, // Rohini
    14, // Mrigashirsha
    21, // Ardra
    30, // Punarvasu
    20, // Pushya
    32, // Ashlesha
    30, // Magha
    20, // Purva Phalguni
    18, // Uttara Phalguni
    21, // Hasta
    20, // Chitra
    14, // Swati
    14, // Vishakha
    10, // Anuradha
    14, // Jyeshtha
    [20, 56], // Mula (20 is standard, 56 also observed in Drik)
    24, // Purva Ashadha
    20, // Uttara Ashadha
    10, // Shravana
    10, // Dhanishta
    18, // Shatabhisha
    16, // Purva Bhadrapada
    24, // Uttara Bhadrapada
    30  // Revati
];

// Amrit Kalam Start Times (in Ghatis) for each Nakshatra (0-26)
// Source: Standard Muhurta texts
// Amrit Kalam Start Times (in Ghatis) roughly Visha (Varjyam) + 24
// Derived from observation of Drik Panchang and common rule Visha + 24 (or similar)
export const amritKalamStartGhatis = [
    42, // Ashwini
    48, // Bharani
    54, // Krittika
    52, // Rohini
    38, // Mrigashira
    35, // Ardra
    54, // Punarvasu
    44, // Pushya
    56, // Ashlesha
    54, // Magha
    44, // Purva Phalguni
    42, // Uttara Phalguni
    45, // Hasta
    44, // Chitra
    38, // Swati
    38, // Vishakha
    34, // Anuradha
    38, // Jyeshtha
    44, // Mula
    48, // Purva Ashadha
    44, // Uttara Ashadha
    34, // Shravana
    34, // Dhanishta
    42, // Shatabhisha
    40, // Purva Bhadrapada
    48, // Uttara Bhadrapada
    54  // Revati
];

// Re-writing with the values found above.

// Vimshottari Dasha Constants
export const vimshottariLords = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

// Dasha duration in years
export const vimshottariDurations = [
    7,  // Ketu
    20, // Venus
    6,  // Sun
    10, // Moon
    7,  // Mars
    18, // Rahu
    16, // Jupiter
    19, // Saturn
    17  // Mercury
];

// Planetary Dignity Constants
// Rashi Indices: 0=Aries, ..., 11=Pisces
export const planetExaltation: Record<string, number> = {
    "Sun": 0,      // Aries
    "Moon": 1,     // Taurus
    "Mars": 9,     // Capricorn
    "Mercury": 5,  // Virgo
    "Jupiter": 3,  // Cancer
    "Venus": 11,   // Pisces
    "Saturn": 6,   // Libra
    "Rahu": 1,     // Taurus (Standard view)
    "Ketu": 7      // Scorpio (Standard view)
};

export const planetDebilitation: Record<string, number> = {
    "Sun": 6,      // Libra
    "Moon": 7,     // Scorpio
    "Mars": 3,     // Cancer
    "Mercury": 11, // Pisces
    "Jupiter": 9,  // Capricorn
    "Venus": 5,    // Virgo
    "Saturn": 0,   // Aries
    "Rahu": 7,     // Scorpio
    "Ketu": 1      // Taurus
};

export const planetOwnSigns: Record<string, number[]> = {
    "Sun": [4],          // Leo
    "Moon": [3],         // Cancer
    "Mars": [0, 7],      // Aries, Scorpio
    "Mercury": [2, 5],   // Gemini, Virgo
    "Jupiter": [8, 11],  // Sagittarius, Pisces
    "Venus": [1, 6],     // Taurus, Libra
    "Saturn": [9, 10],   // Capricorn, Aquarius
    // Rahu/Ketu co-lordship often debated, omitting 'Own' for now to avoid confusion unless requested.
};

// Solar Festival Configurations (Sankranti-based)
export const SOLAR_FESTIVALS: Record<number, Array<{
    name: string;
    type: 'single' | 'span';
    spanDays?: number;
    dayNames?: string[];
    regional?: string[];
    description?: string;
}>> = {
    // Capricorn (Makar) - Rashi 9
    9: [
        {
            name: "Makar Sankranti",
            type: "span",
            spanDays: 4,
            dayNames: ["Bhogi", "Makar Sankranti (Pongal)", "Mattu Pongal", "Kaanum Pongal"],
            regional: ["South", "Maharashtra", "Gujarat", "Punjab"],
            description: "Harvest festival marking Sun's northward journey"
        }
    ],
    // Aries (Mesha) - Rashi 0
    0: [
        {
            name: "Vishu",
            type: "single",
            regional: ["Kerala", "Malayalam"],
            description: "Malayalam New Year"
        },
        {
            name: "Tamil Puthandu",
            type: "single",
            regional: ["Tamil Nadu"],
            description: "Tamil New Year"
        },
        {
            name: "Vaisakhi / Baisakhi",
            type: "single",
            regional: ["Punjab", "North"],
            description: "Punjabi New Year and harvest festival"
        }
    ]
};

// Sankranti Names by Rashi
export const SANKRANTI_NAMES = [
    "Mesha Sankranti",      // 0 - Aries
    "Vrishabha Sankranti",  // 1 - Taurus
    "Mithuna Sankranti",    // 2 - Gemini
    "Karka Sankranti",      // 3 - Cancer
    "Simha Sankranti",      // 4 - Leo
    "Kanya Sankranti",      // 5 - Virgo
    "Tula Sankranti",       // 6 - Libra
    "Vrishchika Sankranti", // 7 - Scorpio
    "Dhanu Sankranti",      // 8 - Sagittarius
    "Makar Sankranti",      // 9 - Capricorn
    "Kumbha Sankranti",     // 10 - Aquarius
    "Meena Sankranti"       // 11 - Pisces
];

/**
 * Multi-Day Festival Spans Configuration
 * 
 * These festivals span multiple consecutive Tithis.
 */
export const MULTI_DAY_FESTIVALS: Record<string, {
    name: string;
    masaIndex: number;
    startTithi: number;
    endTithi: number;
    spanDays: number;
    dailyNames: string[];
    description: string;
}> = {
    // Navaratri: Ashwina Shukla Prathama (1) to Navami (9) - 9 days
    "navaratri": {
        name: "Navaratri",
        masaIndex: 6,  // Ashwina
        startTithi: 1, // Shukla Prathama
        endTithi: 9,   // Shukla Navami
        spanDays: 9,
        dailyNames: [
            "Ghatasthapana (Day 1)",
            "Dwitiya (Day 2)",
            "Tritiya (Day 3)",
            "Chaturthi (Day 4)",
            "Panchami (Day 5)",
            "Shashthi (Day 6)",
            "Saptami (Day 7)",
            "Durga Ashtami (Day 8)",
            "Maha Navami (Day 9)"
        ],
        description: "Nine nights of Durga worship"
    },

    // Ganesh Utsav: Bhadrapada Shukla Chaturthi (4) to Chaturdashi (14) - 10 days
    "ganesh_utsav": {
        name: "Ganesh Utsav",
        masaIndex: 5,  // Bhadrapada
        startTithi: 4, // Shukla Chaturthi
        endTithi: 14,  // Shukla Chaturdashi
        spanDays: 10,
        dailyNames: [
            "Ganesh Chaturthi (Day 1)",
            "Ganesh Panchami (Day 2)",
            "Shashthi (Day 3)",
            "Saptami (Day 4)",
            "Ashtami (Day 5)",
            "Navami (Day 6)",
            "Dashami (Day 7)",
            "Ekadashi (Day 8)",
            "Dwadashi (Day 9)",
            "Anant Chaturdashi (Day 10)"
        ],
        description: "Ten days of Ganesha celebration"
    },

    // Pitru Paksha: Bhadrapada Purnima (15) to Amavasya (30) - 15 days
    "pitru_paksha": {
        name: "Pitru Paksha",
        masaIndex: 5,  // Bhadrapada
        startTithi: 16, // Krishna Prathama (after Purnima)
        endTithi: 30,   // Amavasya
        spanDays: 15,
        dailyNames: [
            "Prathama Shraddha (Day 1)",
            "Dwitiya Shraddha (Day 2)",
            "Tritiya Shraddha (Day 3)",
            "Chaturthi Shraddha (Day 4)",
            "Panchami Shraddha (Day 5)",
            "Shashthi Shraddha (Day 6)",
            "Saptami Shraddha (Day 7)",
            "Ashtami Shraddha (Day 8)",
            "Navami Shraddha (Day 9)",
            "Dashami Shraddha (Day 10)",
            "Ekadashi Shraddha (Day 11)",
            "Dwadashi Shraddha (Day 12)",
            "Trayodashi Shraddha (Day 13)",
            "Chaturdashi Shraddha (Day 14)",
            "Sarva Pitru Amavasya (Day 15)"
        ],
        description: "Fifteen days of ancestor worship"
    }
};
