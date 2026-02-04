// --- Nakshatra Attributes for Ashtakoot ---
// Indices correspond to 0: Ashwini, 1: Bharani ... 26: Revati

// 1. Varna (Caste/Work) - 1 Point
// 0: Brahmin, 1: Kshatriya, 2: Vaishya, 3: Shudra
// Derived from Rashi (Moon Sign), NOT Nakshatra directly usually.
// Rules: Brahmin > Kshatriya > Vaishya > Shudra.
// If Girl > Boy = 0 points. If Boy >= Girl = 1 point.
// Wait, standard practice:
// Cancer, Scorpio, Pisces = Brahmin (4, 8, 12)
// Aries, Leo, Sagittarius = Kshatriya (1, 5, 9)
// Taurus, Virgo, Capricorn = Vaishya (2, 6, 10)
// Gemini, Libra, Aquarius = Shudra (3, 7, 11)
export const VARNA_ORDER = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"];
export const RASHI_VARNA: number[] = [
    1, // Aries (0) -> Kshatriya
    2, // Taurus (1) -> Vaishya
    3, // Gemini (2) -> Shudra
    0, // Cancer (3) -> Brahmin
    1, // Leo (4) -> Kshatriya
    2, // Virgo (5) -> Vaishya
    3, // Libra (6) -> Shudra
    0, // Scorpio (7) -> Brahmin
    1, // Sag (8) -> Kshatriya
    2, // Cap (9) -> Vaishya
    3, // Aqua (10) -> Shudra
    0  // Pisces (11) -> Brahmin
];

// 2. Vashya (Control) - 2 Points
// Derived from Rashi.
// 0: Chatushpad (Quadruped), 1: Manav (Human), 2: Jalchar (Water), 3: Vanchar (Wild), 4: Keet (Insect)
// Aries: Chatushpad
// Taurus: Chatushpad
// Gemini: Manav
// Cancer: Jalchar
// Leo: Vanchar
// Virgo: Manav
// Libra: Manav
// Scorpio: Keet
// Sagittarius: First half Manav, Second Chatushpad. (Simplification: Manav usually, or special rule everywhere)
// Capricorn: First Chatushpad, Second Jalchar.
// Aquarius: Manav
// Pisces: Jalchar
export const VASHYA_TYPES = ["Chatushpad", "Manav", "Jalchar", "Vanchar", "Keet"];
export const RASHI_VASHYA: number[] = [
    0, // Aries: Chatushpad
    0, // Taurus: Chatushpad
    1, // Gemini: Manav
    2, // Cancer: Jalchar
    3, // Leo: Vanchar
    1, // Virgo: Manav
    1, // Libra: Manav
    4, // Scorpio: Keet
    1, // Sag: Manav (Simplify)
    0, // Cap: Chatushpad (Simplify - typically works for most calcs)
    1, // Aqua: Manav
    2  // Pisces: Jalchar
];

// 3. Tara (Star) - 3 Points
// Calculated from Nakshatra Distance: (Boy - Girl) % 9 or vice versa (Girl - Boy).
// It's checked mutual. Count from Girl to Boy, and Boy to Girl.
// 1, 2, 4, 6, 8 are Good.
// 3 (Vipat), 5 (Pratyak), 7 (Naidhana) are Bad.

// 4. Yoni (Sexual Compatibility) - 4 Points
// 0: Horse (Ashwa) - Ashwini, Satabhisha
// 1: Elephant (Gaja) - Bharani, Revati
// 2: Sheep (Mesha) - Krittika, Pushya
// 3: Snake (Sarpa) - Rohini, Mrigasira
// 4: Dog (Shwan) - Ardra, Moola
// 5: Cat (Marjar) - Punarvasu, Ashlesha
// 6: Rat (Mushak) - Magha, Purva Phalguni
// 7: Cow (Gau) - Uttara Phalguni, Uttara Bhadrapada
// 8: Buffalo (Mahish) - Hasta, Swati
// 9: Tiger (Vyaghra) - Chitra, Visakha
// 10: Deer (Mriga) - Anuradha, Jyeshtha
// 11: Monkey (Vanar) - Moola (Wait, Moola is Dog? No check), Purva Ashadha, Shravana
// 12: Mongoose (Nakul) - Uttara Ashadha, Abhijit (conceptually)
// 13: Lion (Simha) - Dhanishta, Purva Bhadrapada
// Let's verify standard list.
// Ashwini: Horse
// Bharani: Elephant
// Krittika: Sheep
// Rohini: Snake
// Mrigasira: Snake
// Ardra: Dog
// Punarvasu: Cat
// Pushya: Sheep
// Ashlesha: Cat
// Magha: Rat
// P.Phalguni: Rat
// U.Phalguni: Cow
// Hasta: Buffalo
// Chitra: Tiger
// Swati: Buffalo
// Visakha: Tiger
// Anuradha: Deer
// Jyeshtha: Deer
// Moola: Dog
// P.Ashadha: Monkey
// U.Ashadha: Mongoose
// Shravana: Monkey
// Dhanishta: Lion
// Satabhisha: Horse
// P.Bhadrapada: Lion
// U.Bhadrapada: Cow
// Revati: Elephant

export const NAKSHATRA_YONI: number[] = [
    0, 1, 2, 3, 3, 4, 5, 2, 5, // 0-8
    6, 6, 7, 8, 9, 8, 9, 10, 10, // 9-17
    4, 11, 12, 11, 13, 0, 13, 7, 1 // 18-26
];
export const YONI_NAMES = [
    "Horse", "Elephant", "Sheep", "Snake", "Dog", "Cat", "Rat",
    "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"
];

// 5. Graha Maitri (Planetary Friendship) - 5 Points
// Based on Rashi Lord (Moon Sign Lord)
// Signs: 0(Ar-Mar), 1(Ta-Ven), 2(Ge-Mer), 3(Cn-Moo), 4(Le-Sun), 5(Vi-Mer), 6(Li-Ven), 7(Sc-Mar), 8(Sg-Jup), 9(Cp-Sat), 10(Aq-Sat), 11(Pi-Jup)
export const RASHI_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];
// Friendships (Natural): 
// Sun: Friend(Moon, Mars, Jup), Neutral(Mer), Enemy(Ven, Sat)
// Moon: Friend(Sun, Mer), Neutral(Mar, Jup, Ven, Sat), Enemy(None)
// Mars: Friend(Sun, Moon, Jup), Neutral(Ven, Sat), Enemy(Mer)
// Mercury: Friend(Sun, Ven), Neutral(Mar, Jup, Sat), Enemy(Moon)
// Jupiter: Friend(Sun, Moon, Mar), Neutral(Sat), Enemy(Mer, Ven)
// Venus: Friend(Mer, Sat), Neutral(Mar, Jup), Enemy(Sun, Moon)
// Saturn: Friend(Mer, Ven), Neutral(Jup), Enemy(Sun, Moon, Mar)

// 6. Gana (Temperament) - 6 Points
// 0: Deva (Divine), 1: Manushya (Human), 2: Rakshasa (Demon)
// Deva: Ashwini, Mrigasira, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati
// Manushya: Bharani, Rohini, Ardra, P.Phalguni, U.Phalguni, P.Ashadha, U.Ashadha, P.Bhadrapada, U.Bhadrapada
// Rakshasa: Krittika, Ashlesha, Magha, Chitra, Visakha, Jyeshtha, Moola, Dhanishta, Satabhisha
// Wait, cross check:
// Ardra is Manushya? Usually Ardra is wild (Lord Rahu). Some sources say Rakshasa?
// DrikPanchang: Ardra is Manushya.
// Krittika: Rakshasa.
// Ashlesha: Rakshasa.
// Magha: Rakshasa.
// Visakha: Rakshasa.
// Jyeshtha: Rakshasa.
// Moola: Rakshasa.
// Dhanishta: Rakshasa.
// Satabhisha: Rakshasa.
// Okay, let's map.
export const NAKSHATRA_GANA: number[] = [
    0, // Ashwini - Deva
    1, // Bharani - Manushya
    2, // Krittika - Rakshasa
    1, // Rohini - Manushya
    0, // Mrigasira - Deva
    1, // Ardra - Manushya (Check: Some say Rakshasa due to Rahu/Rudra). Drik says Manushya.
    0, // Punarvasu - Deva
    0, // Pushya - Deva
    2, // Ashlesha - Rakshasa
    2, // Magha - Rakshasa
    1, // P.Phalguni - Manushya
    1, // U.Phalguni - Manushya
    0, // Hasta - Deva
    2, // Chitra - Rakshasa
    0, // Swati - Deva
    2, // Visakha - Rakshasa
    0, // Anuradha - Deva
    2, // Jyeshtha - Rakshasa
    2, // Moola - Rakshasa
    1, // P.Ashadha - Manushya
    1, // U.Ashadha - Manushya
    0, // Shravana - Deva
    2, // Dhanishta - Rakshasa
    2, // Satabhisha - Rakshasa
    1, // P.Bhadrapada - Manushya
    1, // U.Bhadrapada - Manushya
    0  // Revati - Deva
];
export const GANA_NAMES = ["Deva", "Manushya", "Rakshasa"];

// 7. Bhakoot (Relative Position) - 7 Points
// Calculated dynamically: (Girl - Boy) % 12.
// 2-12, 5-9, 6-8 are bad. 
// 1-1, 3-11, 4-10, 7-7 are Good.

// 8. Nadi (Pulse/Health) - 8 Points
// 0: Adi (Vata/Start), 1: Madhya (Pitta/Middle), 2: Antya (Kapha/End)
// Pattern usually: Adi, Madhya, Antya, Antya, Madhya, Adi... REPEATS.
// Ashwini (0): Adi
// Bharani (1): Madhya
// Krittika (2): Antya
// Rohini (3): Antya
// Mrigasira (4): Madhya
// Ardra (5): Adi
// Punarvasu (6): Adi
// Pushya (7): Madhya
// Ashlesha (8): Antya
// ... pattern: 0, 1, 2, 2, 1, 0, 0, 1, 2...
export const NAKSHATRA_NADI: number[] = [
    0, 1, 2, 2, 1, 0, 0, 1, 2,
    2, 1, 0, 0, 1, 2, 2, 1, 0,
    0, 1, 2, 2, 1, 0, 0, 1, 2
];
export const NADI_NAMES = ["Adi (Start)", "Madhya (Middle)", "Antya (End)"];
