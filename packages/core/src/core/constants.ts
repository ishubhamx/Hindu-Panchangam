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
