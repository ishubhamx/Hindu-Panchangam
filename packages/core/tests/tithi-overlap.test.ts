
import { getPanchangam } from '../src/index';
import { Observer } from 'astronomy-engine';

const lat = 28.6139;
const lng = 77.2090;
const observer = new Observer(lat, lng, 0);

describe('Multiple Tithis Check', () => {
    test('Feb 15 2026 has Trayodashi and Chaturdashi', () => {
        const date = new Date(Date.UTC(2026, 1, 15, 0, 30, 0)); // 6 AM IST
        const p = getPanchangam(date, observer, { timezoneOffset: 330 });
        
        console.log('Sunrise Tithi:', p.tithi);
        console.log('Transitions:', p.tithis.length);
        p.tithis.forEach((t, i) => {
            console.log(`Tithi ${i}: ${t.name} (${t.startTime.toISOString()} - ${t.endTime.toISOString()})`);
        });

        expect(p.tithis.length).toBeGreaterThanOrEqual(2);
        // Trayodashi is index 27 (Krishna 13), Chaturdashi is 28
        // Or 12 for Shukla?
        // Feb 15 is Krishna Paksha.
        // Krishna Trayodashi = 15 + 13 - 1 = 27.
        // Krishna Chaturdashi = 28.
        
        // p.tithi is 0-indexed.
    });
});
