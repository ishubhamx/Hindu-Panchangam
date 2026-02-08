
import { getPanchangam } from '../src/index';
import { Observer } from 'astronomy-engine';
import { tithiNames } from '../src/core/constants';

const lat = 28.6139;
const lng = 77.2090;
const observer = new Observer(lat, lng, 0);

describe('Jan 6 2026 Tithi Check', () => {
    test('Check Tithi details', () => {
        // Jan 6, 2026, 6:00 AM IST
        const date = new Date(Date.UTC(2026, 0, 6, 0, 30, 0)); 
        const p = getPanchangam(date, observer, { timezoneOffset: 330 });
        
        console.log(`Date: ${date.toDateString()}`);
        console.log(`Sunrise Tithi Index: ${p.tithi}`);
        console.log(`Sunrise Tithi Name: ${tithiNames[p.tithi]}`);
        console.log(`Paksha: ${p.paksha}`);
        
        console.log('--- Transitions ---');
        if (p.tithis && p.tithis.length > 0) {
            p.tithis.forEach(t => {
                console.log(`${t.name} (${t.index}) ends at ${t.endTime.toISOString()}`);
            });
        } else {
            console.log('No transitions found (Tithi prevails all day)');
        }
    });
});
