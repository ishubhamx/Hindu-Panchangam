import { getPanchangam, Observer, tithiNames, nakshatraNames } from '../packages/core/src/index';

// 1. Setup - Bangalore
const observer = new Observer(12.9716, 77.5946, 920);
const now = new Date();

// 2. Get Panchangam
const p = getPanchangam(now, observer);

// Calculate Next Sunrise for comparison
const nextDay = new Date(now);
nextDay.setDate(now.getDate() + 1);
const nextSunrise = getPanchangam(nextDay, observer).sunrise;

// 3. Helper to format duration
const duration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
};

console.log(`\n--- Tithi Timeline (${now.toDateString()}) ---`);
console.log(`Current Time:   ${now.toLocaleTimeString()}`);
console.log(`Current Tithi:  ${tithiNames[p.tithi]}`);

if (p.tithiStartTime && p.tithiEndTime) {
    console.log(`\nActive Span for ${tithiNames[p.tithi]}:`);
    console.log(`  Starts:       ${p.tithiStartTime.toLocaleString()} (Maybe yesterday)`);
    console.log(`  Ends:         ${p.tithiEndTime.toLocaleString()}`);
    console.log(`  Total Length: ${duration(p.tithiStartTime, p.tithiEndTime)}`);
}

console.log('\nTransitions happening today (Sunrise to next Sunrise):');
if (p.tithiTransitions.length === 0) {
    console.log("  No Tithi changes today (Standard day).");
} else {
    p.tithiTransitions.forEach(t => {
        // Check if this transition is actually just the day ending
        const isClamped = nextSunrise && Math.abs(t.endTime.getTime() - nextSunrise.getTime()) < 1000 * 60; // 1 min diff

        if (isClamped) {
            console.log(`  ➡ ${t.name} continues... (Day ends at ${t.endTime.toLocaleTimeString()})`);
            if (p.tithiEndTime) {
                console.log(`     (Actual End Time: ${p.tithiEndTime.toLocaleString()})`);
            }
        } else {
            console.log(`  ❌ ${t.name} ends at ${t.endTime.toLocaleTimeString()}`);
            console.log(`  ✅ Next Tithi begins immediately.`);
        }
    });
}

console.log(`\n--- Nakshatra Timeline ---`);
console.log(`Current Nakshatra: ${nakshatraNames[p.nakshatra]}`);
if (p.nakshatraStartTime && p.nakshatraEndTime) {
    console.log(`  Starts:       ${p.nakshatraStartTime.toLocaleString()}`);
    console.log(`  Ends:         ${p.nakshatraEndTime.toLocaleString()}`);
}
