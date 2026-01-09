
import { Body, Observer, SearchRiseSet, SearchAltitude } from 'astronomy-engine';

const observer = new Observer(28.6139, 77.2090, 0); // New Delhi
const date = new Date('2025-01-06T00:00:00+05:30');

console.log("Debugging Moonrise for Jan 6, 2025 (New Delhi)");
console.log("Observer:", observer);

// Default
const t1 = SearchRiseSet(Body.Moon, observer, 1, date, 1);
if (t1) console.log("Default SearchRiseSet:", t1.date.toLocaleString());

// Search for specific altitude
// Moon radius ~0.25 deg. Refraction ~0.56 deg.
// Upper limb rise = Center reaches -0.833 deg approx.
// Center rise = Center reaches -0.56 deg approx.
// Let's try finding when center reaches specific altitudes.

function findCrossing(alt: number, name: string) {
    // SearchAltitude(body, observer, direction, date, limitDays, altitudeLimit)
    // direction +1 = rising
    const t = SearchAltitude(Body.Moon, observer, 1, date, 1, alt);
    if (t) console.log(`Center reaches ${alt}° (${name}):`, t.date.toLocaleString());
}

findCrossing(0, "Geometric Horizon");
findCrossing(-0.5667, "Refraction (Center Rise)");
findCrossing(-0.8333, "Refraction + Radius (Upper Limb Rise)");
findCrossing(-0.5667 + 0.26, "Refraction - Radius (Lower Limb Rise?)");

