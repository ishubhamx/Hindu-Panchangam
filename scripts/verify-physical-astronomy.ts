
import { getPanchangam } from '../src/core/panchangam';
import { Observer } from 'astronomy-engine';

async function verifyPhysical() {
    // New Delhi
    const observer = new Observer(28.6139, 77.2090, 0);
    const date = new Date('2025-01-06T12:00:00+05:30');

    const panchangam = await getPanchangam(date, observer);

    // Benchmarks (from TimeAndDate / Google search)
    // Jan 6 2025
    const benchmarks = {
        sunrise: { h: 7, m: 14 },
        sunset: { h: 17, m: 39 },
        moonrise: { h: 11, m: 35 },
        moonset: { h: 0, m: 20 } // Jan 7
    };

    console.log("Verifying Physical Astronomy for Jan 6, 2025 (New Delhi)...");

    // Check Sunrise
    if (panchangam.sunrise) {
        const h = panchangam.sunrise.getHours();
        const m = panchangam.sunrise.getMinutes();
        const diff = Math.abs((h * 60 + m) - (benchmarks.sunrise.h * 60 + benchmarks.sunrise.m));
        console.log(`Sunrise: Lib ${h}:${m} vs BM ${benchmarks.sunrise.h}:${benchmarks.sunrise.m} (Diff: ${diff}m)`);
    } else {
        console.error("Sunrise missing");
    }

    // Check Sunset
    if (panchangam.sunset) {
        const h = panchangam.sunset.getHours();
        const m = panchangam.sunset.getMinutes();
        const diff = Math.abs((h * 60 + m) - (benchmarks.sunset.h * 60 + benchmarks.sunset.m));
        console.log(`Sunset: Lib ${h}:${m} vs BM ${benchmarks.sunset.h}:${benchmarks.sunset.m} (Diff: ${diff}m)`);
    } else {
        console.error("Sunset missing");
    }

    // Check Moonrise
    if (panchangam.moonrise) {
        const h = panchangam.moonrise.getHours();
        const m = panchangam.moonrise.getMinutes();
        const diff = Math.abs((h * 60 + m) - (benchmarks.moonrise.h * 60 + benchmarks.moonrise.m));
        console.log(`Moonrise: Lib ${h}:${m} vs BM ${benchmarks.moonrise.h}:${benchmarks.moonrise.m} (Diff: ${diff}m)`);
    } else {
        console.error("Moonrise missing");
    }

    // Check Moonset
    if (panchangam.moonset) {
        const h = panchangam.moonset.getHours();
        const m = panchangam.moonset.getMinutes();
        // Handle next day logic if needed, but here simple comparison might suffice if we align dates
        // Lib returns Date object. If it's Jan 7 00:20, and BM is 00:20.
        // If lib is on Jan 6 (unlikely for 00:20), we'd see huge diff.

        let bmMinutes = benchmarks.moonset.h * 60 + benchmarks.moonset.m;
        // Adjust for next day if benchmark is 00:20
        // If lib result is also Jan 7, hours are 0..23.

        const diff = Math.abs((h * 60 + m) - bmMinutes);
        console.log(`Moonset: Lib ${h}:${m} vs BM ${benchmarks.moonset.h}:${benchmarks.moonset.m} (Diff: ${diff}m)`);
    } else {
        console.error("Moonset missing");
    }
}

verifyPhysical().catch(console.error);
