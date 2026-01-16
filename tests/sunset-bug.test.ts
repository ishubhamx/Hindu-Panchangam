import { Observer } from "astronomy-engine";
import { getSunrise, getSunset, getMoonrise, getMoonset } from "../src/core/calculations";

// Seattle (West Longitude)
const START_LAT = 47.69532310051329;
const START_LON = -122.106849899019; // ~ -8h
const seattleObserver = new Observer(START_LAT, START_LON, 0);

// Fiji (East Longitude +12)
const FIJI_LAT = -17.7134;
const FIJI_LON = 178.0650; // ~ +12h
const fijiObserver = new Observer(FIJI_LAT, FIJI_LON, 0);

describe("Sunrise/Sunset Calculation (Timezone Bug Fix)", () => {

    // Test Case 1: Seattle Sunset (The reported bug)
    // Jan 11 10:44 AM PST -> Should be Jan 11 evening.
    // Previously returned Jan 10 evening.
    test("Seattle Sunset: Should return sunset on the SAME civil day", () => {
        // Jan 11 10:44 PST = Jan 11 18:44 UTC
        const date = new Date("2026-01-11T18:44:44.000Z");

        const sunset = getSunset(date, seattleObserver);

        expect(sunset).toBeDefined();
        if (!sunset) return;

        // Seattle Sunset is approx 16:38 PST -> Jan 12 00:38 UTC
        // The previous bug returned Jan 11 00:37 UTC (Jan 10 16:37 PST)

        // Check if sunset is AFTER the input date (since input is 10am and sunset is evening)
        expect(sunset.getTime()).toBeGreaterThan(date.getTime());

        // Also check strictly if it falls on Jan 11 local time (approx)
        // 00:38 UTC on Jan 12 = 16:38 PST on Jan 11.
        // We can just assert that it is within 12 hours forward of input.
        const diffHours = (sunset.getTime() - date.getTime()) / (1000 * 3600);
        expect(diffHours).toBeLessThan(12); // Should be ~6 hours later
        expect(diffHours).toBeGreaterThan(0);
    });

    // Test Case 2: Seattle Sunrise
    test("Seattle Sunrise: Should return sunrise on the SAME civil day", () => {
        // Jan 11 10:44 PST. Sunrise was earlier that morning (~07:54 PST)
        const date = new Date("2026-01-11T18:44:44.000Z");

        const sunrise = getSunrise(date, seattleObserver);

        expect(sunrise).toBeDefined();
        if (!sunrise) return;

        // Sunrise should be BEFORE the input time (10:44 AM)
        expect(sunrise.getTime()).toBeLessThan(date.getTime());

        // Should be within 24h
        const diffHours = (date.getTime() - sunrise.getTime()) / (1000 * 3600);
        expect(diffHours).toBeLessThan(24);
    });

    // Test Case 3: Fiji Sunrise (Extreme East)
    // Jan 11 12:00 Fiji Time (+12) = Jan 11 00:00 UTC.
    // Sunrise expected ~ 05:42 Fiji Time (Jan 11) = Jan 10 17:42 UTC.
    // Previously might return Jan 11 17:42 UTC (Jan 12 Fiji).
    test("Fiji Sunrise: Should return sunrise on Jan 11 Local", () => {
        const date = new Date("2026-01-11T00:00:00.000Z"); // Jan 11 Noon Fiji

        const sunrise = getSunrise(date, fijiObserver);

        expect(sunrise).toBeDefined();
        if (!sunrise) return;

        // Expected Sunrise: Jan 10 ~17:42 UTC
        // Input: Jan 11 00:00 UTC
        // Sunrise should be BEFORE input.
        expect(sunrise.getTime()).toBeLessThan(date.getTime());
    });

    // Test Case 4: Fiji Sunset
    test("Fiji Sunset: Should return sunset on Jan 11 Local", () => {
        const date = new Date("2026-01-11T00:00:00.000Z"); // Jan 11 Noon Fiji

        const sunset = getSunset(date, fijiObserver);

        expect(sunset).toBeDefined();
        if (!sunset) return;

        // Expected Sunset: Jan 11 ~06:00 UTC
        // Input: Jan 11 00:00 UTC
        // Sunset should be AFTER input.
        expect(sunset.getTime()).toBeGreaterThan(date.getTime());
    });
});
