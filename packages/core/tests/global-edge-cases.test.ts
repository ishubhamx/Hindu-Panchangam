import { Observer } from "astronomy-engine";
import { getPanchangam } from "../src";

describe("Global Edge Cases Test Suite (500+ Scenarios)", () => {

    // Helper to generate edge cases
    // We want scenarios where:
    // 1. Solar Lag is HIGH (e.g. Western China, Western Europe in summer, Western India).
    // 2. Solar Lead is HIGH (e.g. Eastern parts of timezones).
    // 3. Time is very close to midnight (00:01, 00:05, 01:00, 23:00, 23:55).

    const EDGE_LOCATIONS = [
        { name: "Lhasa (UTC+8, 91E)", lat: 29.65, lon: 91.17, offset: 480 }, // Solar lag ~2h
        { name: "Seattle (UTC-8, 122W)", lat: 47.6, lon: -122.33, offset: -480 }, // Solar lag ~15m
        { name: "Mumbai (UTC+5:30, 72E)", lat: 19.07, lon: 72.87, offset: 330 }, // Solar lag ~40m
        { name: "Madrid (UTC+1, 3W)", lat: 40.41, lon: -3.7, offset: 60 }, // Solar lag ~1h 15m
        { name: "Urumqi (UTC+8, 87E)", lat: 43.82, lon: 87.61, offset: 480 }, // EXTREME Solar lag ~2h 15m
        { name: "Baker Island (UTC-12, 176W)", lat: 0.19, lon: -176.48, offset: -720 },
        { name: "Kiritimati (UTC+14, 157W)", lat: 1.87, lon: -157.4, offset: 840 },
        { name: "Paris (UTC+1, 2E)", lat: 48.85, lon: 2.35, offset: 60 },
        { name: "London (UTC, 0W)", lat: 51.5, lon: -0.12, offset: 0 },
        { name: "Tokyo (UTC+9, 139E)", lat: 35.67, lon: 139.65, offset: 540 }
    ];

    const TEST_TIMES: { h: number, m: number }[] = [];
    // Generate minutes from 00:00 to 02:00 (120 mins)
    for (let m = 0; m <= 120; m += 5) TEST_TIMES.push({ h: 0, m: m }); // 00:00 - 02:00
    // Generate minutes from 22:00 to 24:00 (120 mins)
    for (let m = 0; m <= 120; m += 5) TEST_TIMES.push({ h: 22, m: m }); // 22:00 - 24:00

    // Total Cases = 10 Locations * (24 + 24) Times = 480 scenarios.
    // Let's add more granularity to hit 500+.
    // Add 10 more random "Extreme Lag" locations.
    for (let i = 0; i < 10; i++) {
        const lon = 75 + Math.random() * 20; // 75E to 95E (Western China / Central Asia)
        EDGE_LOCATIONS.push({
            name: `Random Extreme Lag ${i}`,
            lat: 30 + Math.random() * 20,
            lon: lon,
            offset: 480 // Force UTC+8
        });
    }

    // Now Total Locations = 20.
    // Times = ~50 points.
    // Total = 1000 scenarios.

    EDGE_LOCATIONS.forEach(loc => {
        TEST_TIMES.forEach(time => {
            test(`${loc.name} @ ${String(time.h).padStart(2, '0')}:${String(time.m).padStart(2, '0')} Local`, () => {
                const observer = new Observer(loc.lat, loc.lon, 0);

                // Set Local Time Jan 15
                // Handle 24:xx etc if needed, but loop uses 22.. so max is 22h + 120m ~ 24h.
                // Simple construct:
                const baseLocalMs = Date.UTC(2026, 0, 15, time.h, time.m, 0);
                const inputUtcMs = baseLocalMs - (loc.offset * 60 * 1000);
                const date = new Date(inputUtcMs);

                const result = getPanchangam(date, observer, { timezoneOffset: loc.offset });
                const sunrise = result.sunrise;

                if (!sunrise) return;

                // EXPECTATION:
                // If Time < 12:00 (Morning) => Sunrise > Input.
                // If Time > 12:00 (Evening) => Sunrise < Input.

                // Note: The loop generates 22h + 120m which reaches into Jan 16 00:00.
                // Wait, Date.UTC(2026, 0, 15, 22, 120) = Jan 16 00:00.
                // If input "Local Day" rolls over to Jan 16, then Panchangam SHOULD calculate for Jan 16!
                // So Sunrise > Input (Jan 16 00:00 < Jan 16 07:00).

                // So the logic is consistent:
                // Sunrise should verify Day Consistency.
                // If Input Local Day is Jan 15, Sunrise Day is Jan 15.
                // If Input Local Day is Jan 16, Sunrise Day is Jan 16.

                // Let's check the date of the returned sunrise vs expected local date.
                const expectedLocalMs = date.getTime() + (loc.offset * 60 * 1000);
                const expectedLocalDate = new Date(expectedLocalMs);
                const expectedDay = expectedLocalDate.getUTCDate(); // 15 or 16

                const actualSunriseLocalMs = sunrise.getTime() + (loc.offset * 60 * 1000);
                const actualSunriseDate = new Date(actualSunriseLocalMs);
                const actualDay = actualSunriseDate.getUTCDate();

                // Expect days to match
                expect(actualDay).toBe(expectedDay);

                // Also the greater/less checks for sanity
                const hourValue = expectedLocalDate.getUTCHours() + expectedLocalDate.getUTCMinutes() / 60;
                if (hourValue < 12) {
                    expect(sunrise.getTime()).toBeGreaterThan(date.getTime());
                } else {
                    expect(sunrise.getTime()).toBeLessThan(date.getTime());
                }
            });
        });
    });
});
