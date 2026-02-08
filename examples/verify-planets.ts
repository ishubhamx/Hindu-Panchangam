
import { getPanchangam } from '../packages/core/src/index';
import { Observer } from "astronomy-engine";

async function verifyPlanets() {
    const date = new Date('2025-06-22T12:00:00+05:30'); // Drik Reference
    const observer = new Observer(12.9716, 77.5946, 920); // Bangalore

    const p = getPanchangam(date, observer);
    const planets = p.planetaryPositions;

    console.log("=== Planetary Positions (22 June 2025) ===");
    const keys: (keyof typeof planets)[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    keys.forEach(k => {
        const planet = planets[k];
        const status = planet.isRetrograde ? "Retrograde ⏪" : "Direct ⏩";
        const dignityIcon = planet.dignity === 'exalted' ? '👑' : planet.dignity === 'debilitated' ? '⬇️' : planet.dignity === 'own' ? '🏠' : '😐';
        console.log(`${k.padEnd(8)}: ${planet.rashiName.padEnd(10)} ${planet.degree.toFixed(2)}°  (${status}, speed: ${planet.speed.toFixed(4)}) - ${dignityIcon} ${planet.dignity.toUpperCase()}`);
    });

    console.log("\nRahu Longitude:", planets.rahu.longitude.toFixed(2));
    console.log("Ketu Longitude:", planets.ketu.longitude.toFixed(2));
}

verifyPlanets();
