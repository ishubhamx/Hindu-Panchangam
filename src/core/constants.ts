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
