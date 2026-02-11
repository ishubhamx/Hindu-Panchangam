import { Kundli } from "../kundli/types";
import { MatchResult, DoshaResult, KootaResult } from "./types";
import {
    calculateVarna, calculateVashya, calculateTara, calculateYoni,
    calculateGrahaMaitri, calculateGana, calculateBhakoot, calculateNadi
} from "./kootas";
import { nakshatraNames } from "../core/constants";

/**
 * Checks for Mangal Dosha (Mars defect).
 * Rule: Mars in 1, 4, 7, 8, 12 from Lagna.
 * South India also checks from Moon and Venus, but North usually stresses Lagna.
 * We will return boolean based on Lagna.
 */
/**
 * Checks for Mangal Dosha (Mars defect) with exceptions.
 * Logic:
 * 1. Check Mars position from Lagna, Moon, and Venus.
 * 2. Standard Houses: 1, 4, 7, 8, 12. (Some traditions include 2).
 * 3. Exceptions: Mars in Own Sign (Aries, Scorpio), Exalted (Capricorn), or specific house/sign combos.
 */
export function checkMangalDosha(kundli: Kundli): DoshaResult {
    // Helper to get house position from a reference point (1-based)
    const getPos = (planetLon: number, refLon: number) => {
        let diff = Math.floor(planetLon / 30) - Math.floor(refLon / 30);
        if (diff < 0) diff += 12;
        return diff + 1;
    };

    const marsLon = kundli.planets["Mars"].longitude;
    const lagnaLon = kundli.ascendant.longitude;
    const moonLon = kundli.planets["Moon"].longitude;
    const venusLon = kundli.planets["Venus"].longitude;

    // Positions (1-based relative house)
    const posLagna = getPos(marsLon, lagnaLon);
    const posMoon = getPos(marsLon, moonLon);
    const posVenus = getPos(marsLon, venusLon);

    // Standard Dosha Houses (North India usually 1, 4, 7, 8, 12; South often adds 2)
    // We will track 1, 2, 4, 7, 8, 12 but treat Lagna matches as primary.
    const doshaHouses = [1, 2, 4, 7, 8, 12];

    const isLagnaDosha = doshaHouses.includes(posLagna);
    const isMoonDosha = doshaHouses.includes(posMoon);
    const isVenusDosha = doshaHouses.includes(posVenus);

    // If no dosha in any reference, return early
    if (!isLagnaDosha && !isMoonDosha && !isVenusDosha) {
        return { hasDosha: false, isHigh: false, description: "No Mangal Dosha" };
    }

    // Check Exceptions (Cancellation)
    // 1. Mars in Own Signs (Aries=0, Scorpio=7)
    // 2. Mars Exalted (Capricorn=9)
    // 3. Specific cancellations can be added here (e.g. Mars in Leo in 8th)
    const marsRashi = Math.floor(marsLon / 30);
    const isOwnOrExalted = [0, 7, 9].includes(marsRashi);

    let descParts = [];
    if (isLagnaDosha) descParts.push(`Lagna(H${posLagna})`);
    if (isMoonDosha) descParts.push(`Moon(H${posMoon})`);
    if (isVenusDosha) descParts.push(`Venus(H${posVenus})`);

    const descriptionBase = `Present in: ${descParts.join(', ')}`;

    if (isOwnOrExalted) {
        return {
            hasDosha: false,
            isHigh: false,
            description: `Cancelled: ${descriptionBase} - Mars is Own/Exalted`
        };
    }

    // High severity if present from Lagna.
    // Moderate/Low if only from Moon/Venus.
    const isHigh = isLagnaDosha;

    return {
        hasDosha: true,
        isHigh,
        description: descriptionBase
    };
}

/**
 * Calculates the complete Ashtakoot Guna Milan score.
 */
export function matchKundli(boy: Kundli, girl: Kundli): MatchResult {
    // 1. Get Nakshatra and Rashi indices
    const getNakIndex = (lon: number) => Math.floor(lon / (360 / 27));
    const getRashiIndex = (lon: number) => Math.floor(lon / 30);

    const bMoon = boy.planets["Moon"].longitude;
    const gMoon = girl.planets["Moon"].longitude;

    const bNak = getNakIndex(bMoon);
    const gNak = getNakIndex(gMoon);

    const bRashi = getRashiIndex(bMoon);
    const gRashi = getRashiIndex(gMoon);

    // 2. Calculate Kootas
    const kootas: KootaResult[] = [
        calculateVarna(bRashi, gRashi),
        calculateVashya(bRashi, gRashi),
        calculateTara(bNak, gNak),
        calculateYoni(bNak, gNak),
        calculateGrahaMaitri(bRashi, gRashi),
        calculateGana(bNak, gNak),
        calculateBhakoot(bRashi, gRashi),
        calculateNadi(bNak, gNak, bRashi, gRashi) // Updated signature
    ];

    const totalScore = kootas.reduce((sum, k) => sum + k.score, 0);

    // 3. Dosha Check
    const boyDosha = checkMangalDosha(boy);
    const girlDosha = checkMangalDosha(girl);

    // 4. Verdict
    let verdict = "Not Recommended";
    // Standard rule: > 18 is passable.
    // Mangal Dosha check:
    // If one has Dosha (uncancelled) and other doesn't -> distinct mismatch.
    // If both have Dosha -> Match (cancellation).
    // If neither -> Match.

    if (totalScore >= 18) {
        if (boyDosha.hasDosha && girlDosha.hasDosha) {
            verdict = "Good (Both Manglik)";
        } else if (!boyDosha.hasDosha && !girlDosha.hasDosha) {
            verdict = "Good to Proceed";
        } else {
            // One is Manglik, one is not
            verdict = "Mismatch (Manglik Mismatch)";
            // Check subjective severity?
            // If total score is high (>25), some astrologers proceed with remedies.
            if (totalScore > 25) verdict += " - Consult Astrologer (High Score)";
        }
    } else {
        verdict = "Low Score (<18)";
    }

    return {
        ashtakoot: {
            totalScore,
            kootas
        },
        dosha: {
            boy: boyDosha,
            girl: girlDosha
        },
        verdict
    };
}
