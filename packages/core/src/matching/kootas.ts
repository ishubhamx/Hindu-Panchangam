import {
    VARNA_ORDER, RASHI_VARNA,
    VASHYA_TYPES, RASHI_VASHYA,
    NAKSHATRA_YONI, YONI_NAMES,
    NAKSHATRA_GANA, GANA_NAMES,
    NAKSHATRA_NADI, NADI_NAMES,
    RASHI_LORDS
} from "./constants";
import { KootaResult } from "./types";

// --- 1. Varna (1 Point) ---
export function calculateVarna(boyRashi: number, girlRashi: number): KootaResult {
    const bVarna = RASHI_VARNA[boyRashi];
    const gVarna = RASHI_VARNA[girlRashi];

    // Rule: Boy Varna >= Girl Varna => 1. Else 0.
    // Brahmin(0) > Kshatriya(1) > Vaishya(2) > Shudra(3).
    // Note: Lower index is Higher Rank.
    let score = 0;
    if (bVarna <= gVarna) {
        score = 1;
    }

    return {
        name: "Varna",
        score,
        maxScore: 1,
        description: `Boy:${VARNA_ORDER[bVarna]} - Girl:${VARNA_ORDER[gVarna]}`,
        area: "Work/Ego"
    };
}

// --- 2. Vashya (2 Points) ---
export function calculateVashya(boyRashi: number, girlRashi: number): KootaResult {
    const bType = RASHI_VASHYA[boyRashi];
    const gType = RASHI_VASHYA[girlRashi];

    // Lookup Table [Boy][Girl]
    // Indices: 0:Chat, 1:Man, 2:Jal, 3:Van, 4:Keet
    const table = [
        [2, 1, 1, 0.5, 1], // Chatushpad
        [1, 2, 0.5, 0, 1], // Manav
        [1, 0.5, 2, 1, 1], // Jalchar
        [0.5, 0, 1, 2, 0], // Vanchar
        [1, 1, 1, 0, 2]    // Keet
    ];

    const score = table[bType][gType];

    return {
        name: "Vashya",
        score,
        maxScore: 2,
        description: `Boy:${VASHYA_TYPES[bType]} - Girl:${VASHYA_TYPES[gType]}`,
        area: "Dominance/Control"
    };
}

// --- 3. Tara (3 Points) ---
export function calculateTara(boyNak: number, girlNak: number): KootaResult {
    // Count from Girl to Boy
    let countGB = (boyNak - girlNak);
    if (countGB < 0) countGB += 27;
    countGB += 1; // Inclusive count

    // Remainder by 9
    const remGB = countGB % 9;
    // Good: 1, 2, 4, 6, 8, 9(0). Bad: 3, 5, 7.
    const isGoodGB = [1, 2, 4, 6, 8, 0].includes(remGB);

    // Count from Boy to Girl
    let countBG = (girlNak - boyNak);
    if (countBG < 0) countBG += 27;
    countBG += 1;
    const remBG = countBG % 9;
    const isGoodBG = [1, 2, 4, 6, 8, 0].includes(remBG);

    let score = 0;
    if (isGoodGB && isGoodBG) score = 3;
    else if (isGoodGB || isGoodBG) score = 1.5;
    else score = 0;

    return {
        name: "Tara",
        score,
        maxScore: 3,
        description: `G-B Count:${countGB} (${isGoodGB ? 'Good' : 'Bad'}) / B-G Count:${countBG} (${isGoodBG ? 'Good' : 'Bad'})`,
        area: "Destiny/Luck"
    };
}

// --- 4. Yoni (4 Points) ---
export function calculateYoni(boyNak: number, girlNak: number): KootaResult {
    const bYoni = NAKSHATRA_YONI[boyNak];
    const gYoni = NAKSHATRA_YONI[girlNak];

    if (bYoni === gYoni) {
        return { name: "Yoni", score: 4, maxScore: 4, description: "Same Yoni (Perfect)", area: "Sexual Compatibility" };
    }

    // Great Enemies (0 Points)
    const greatEnemies = [[0, 8], [1, 13], [2, 11], [3, 12], [4, 10], [5, 6], [7, 9]];
    let isGreatEnemy = false;
    greatEnemies.forEach(pair => {
        if ((bYoni === pair[0] && gYoni === pair[1]) || (bYoni === pair[1] && gYoni === pair[0])) {
            isGreatEnemy = true;
        }
    });
    if (isGreatEnemy) return { name: "Yoni", score: 0, maxScore: 4, description: `Boy:${YONI_NAMES[bYoni]} - Girl:${YONI_NAMES[gYoni]} (Great Enemies)`, area: "Sexual Compatibility" };

    // Enemy Pairs (1 Point)
    // Updated based on verification: 
    // Buffalo(8) - Tiger(9) is Enemy (1 Point) in AstroSage logic.
    const enemies = [[8, 9], [1, 9], [0, 10]];
    let isEnemy = false;
    enemies.forEach(pair => {
        if ((bYoni === pair[0] && gYoni === pair[1]) || (bYoni === pair[1] && gYoni === pair[0])) {
            isEnemy = true;
        }
    });
    if (isEnemy) return { name: "Yoni", score: 1, maxScore: 4, description: `Boy:${YONI_NAMES[bYoni]} - Girl:${YONI_NAMES[gYoni]} (Enemies)`, area: "Sexual Compatibility" };

    // Default to 2 (Neutral)
    return {
        name: "Yoni",
        score: 2,
        maxScore: 4,
        description: `Boy:${YONI_NAMES[bYoni]} - Girl:${YONI_NAMES[gYoni]} (Neutral)`,
        area: "Sexual Compatibility"
    };
}

// --- 5. Graha Maitri (5 Points) ---
export function calculateGrahaMaitri(boyRashi: number, girlRashi: number): KootaResult {
    const bLord = RASHI_LORDS[boyRashi];
    const gLord = RASHI_LORDS[girlRashi];

    const friends: Record<string, string[]> = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"]
    };

    const enemies: Record<string, string[]> = {
        "Sun": ["Venus", "Saturn"],
        "Moon": [],
        "Mars": ["Mercury"],
        "Mercury": ["Moon"],
        "Jupiter": ["Mercury", "Venus"],
        "Venus": ["Sun", "Moon"],
        "Saturn": ["Sun", "Moon", "Mars"]
    };

    const getRel = (planet: string, other: string): number => {
        if (planet === other) return 1;
        if (friends[planet].includes(other)) return 1;
        if (enemies[planet].includes(other)) return -1;
        return 0; // Neutral
    };

    const bToG = getRel(bLord, gLord);
    const gToB = getRel(gLord, bLord);

    let score = 0;
    if (bToG === 1 && gToB === 1) score = 5;
    else if ((bToG === 1 && gToB === 0) || (bToG === 0 && gToB === 1)) score = 4;
    else if (bToG === 0 && gToB === 0) score = 3;
    else if ((bToG === 1 && gToB === -1) || (bToG === -1 && gToB === 1)) score = 1;
    else if ((bToG === 0 && gToB === -1) || (bToG === -1 && gToB === 0)) score = 0.5;
    else score = 0;

    const relMap: Record<number, string> = {
        5: "Best Friends",
        4: "Friends",
        3: "Neutral",
        1: "Enemies",
        0.5: "Bad enemies",
        0: "Bitter Enemies"
    };

    return {
        name: "Graha Maitri",
        score,
        maxScore: 5,
        description: `Boy:${bLord} - Girl:${gLord} (${relMap[score] || ''})`,
        area: "Mental Compatibility"
    };
}

// --- 6. Gana (6 Points) ---
export function calculateGana(boyNak: number, girlNak: number): KootaResult {
    const bGana = NAKSHATRA_GANA[boyNak];
    const gGana = NAKSHATRA_GANA[girlNak];

    if (bGana === gGana) {
        return { name: "Gana", score: 6, maxScore: 6, description: "Same Gana", area: "Temperament" };
    }

    // Strict Matrix based on Verification (AstroSage gave 0 for Deva-Rakshasa)
    // Deva(0), Manushya(1), Rakshasa(2)
    // D-M=6, D-R=0 (Strict)
    // M-D=5, M-R=0
    // R-D=0 (Strict), R-M=0

    const matrix = [
        [6, 6, 0], // Deva vs [D, M, R]
        [5, 6, 0], // Manushya vs [D, M, R]
        [0, 0, 6]  // Rakshasa vs [D, M, R]
    ];

    const score = matrix[bGana][gGana];

    return {
        name: "Gana",
        score,
        maxScore: 6,
        description: `Boy:${GANA_NAMES[bGana]} - Girl:${GANA_NAMES[gGana]}`,
        area: "Temperament"
    };
}

// --- 7. Bhakoot (7 Points) ---
export function calculateBhakoot(boyRashi: number, girlRashi: number): KootaResult {
    let diff = (girlRashi - boyRashi);
    if (diff < 0) diff += 12;
    const pos = diff + 1; // 1-based (e.g. 1 means Same sign)

    // Bad Pairs: 2-12 (Dwirdwadash), 5-9 (Navpancham), 6-8 (Shadashtak)
    // 2-12 positions: 2 and 12
    // 5-9 positions: 5 and 9
    // 6-8 positions: 6 and 8
    const isBad = [2, 12, 5, 9, 6, 8].includes(pos);

    let score = 7;
    let relName = `${pos}-axis`;
    if ([2, 12].includes(pos)) relName = "Dwirdwadash (2-12)";
    if ([6, 8].includes(pos)) relName = "Shadashtak (6-8)";
    if ([5, 9].includes(pos)) relName = "Navpancham (5-9)";

    let description = `Position: ${relName}`;

    if (isBad) {
        // Check Exceptions: Same Lord (Kuja-Kuja, Shukra-Shukra etc) or Friendly Lords
        const bLord = RASHI_LORDS[boyRashi];
        const gLord = RASHI_LORDS[girlRashi];

        // Exception 1: Same Lord
        if (bLord === gLord) {
            // E.g. Aries-Scorpio (1-8 relation, but both Mars)
            // E.g. Taurus-Libra (2-7 relation? No 2-7 is 6-8 distance. 1:Taurus(2), 2:Gemini(3)... 8:Sagittarius(9)? No.
            // Aries(1) - Scorpio(8) -> Distance is 8. (1,2,3,4,5,6,7,8). Relation is 6-8.
            // Both Mars. Exception applies.
            score = 7;
            description += ` (Exception: Same Lord ${bLord})`;
        } else {
            // Check Graha Maitri (simple Friend check)
            // If Lords are mutual friends, Bhakoot dosha is reduced/cancelled in some traditions.
            // However, strict Ashtakoot gives 0. 
            // We will stick to Same Lord exception which is universally accepted.
            // Some texts accept Friendly lords for 6-8/2-12.

            // For now, strict 0 unless Same Lord.
            score = 0;
            description += " (Bhakoot Dosha)";
        }
    }

    return {
        name: "Bhakoot",
        score,
        maxScore: 7,
        description,
        area: "Love/Happiness"
    };
}

// --- 8. Nadi (8 Points) ---
export function calculateNadi(boyNak: number, girlNak: number, boyRashi?: number, girlRashi?: number): KootaResult {
    const bNadi = NAKSHATRA_NADI[boyNak];
    const gNadi = NAKSHATRA_NADI[girlNak];

    let score = 8;
    let description = `Boy:${NADI_NAMES[bNadi]} - Girl:${NADI_NAMES[gNadi]}`;

    if (bNadi === gNadi) {
        score = 0;
        description += " (Nadi Dosha)";

        // Exceptions
        // 1. Same Rashi, Different Nakshatra (e.g. Krittika vs Rohini in Taurus)
        if (boyRashi !== undefined && girlRashi !== undefined) {
            if (boyRashi === girlRashi && boyNak !== girlNak) {
                score = 8;
                description += " (Exception: Same Rashi, Diff Nakshatra)";
            }
        }

        // 2. Different Rashi, Same Nakshatra (Not possible usually? Nakshatra spans max 2 rashis. 
        // If same Nakshatra, same Pada? No.)
        // Same Nakshatra is technically bad irrespective unless Charan is different.
        // We really need Charan (Pada) for full exceptions. 
        // Since we don't have Charan here easily without re-calc, we'll implement the Rashi-based exception first.
    }

    return {
        name: "Nadi",
        score,
        maxScore: 8,
        description,
        area: "Health/Genes"
    };
}
