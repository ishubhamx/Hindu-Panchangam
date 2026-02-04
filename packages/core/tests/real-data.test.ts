import { getPanchangam, nakshatraNames, yogaNames, tithiNames, karanaNames } from '../src/index';
import { Observer } from 'astronomy-engine';

const BANGALORE = new Observer(12.9716, 77.5946, 920);

// Data from Drik Panchang (Verified via bulk-verify)
const TEST_CASES = [
    {
        date: '2025-10-01T00:00:00+05:30', // Oct 1, 2025
        expected: {
            tithi: 'Navami',
            nakshatra: 'Purva Ashadha',
            yoga: 'Atiganda',
            karana: 'Balava',
            vara: 'Budhawara'
        }
    },
    {
        date: '2025-10-07T00:00:00+05:30', // Oct 7, 2025 (Purnima)
        expected: {
            tithi: 'Purnima',
            nakshatra: 'Revati',
            yoga: 'Dhruva',
            karana: 'Bava', // Drik says Bava
            vara: 'Mangalawara'
        }
    },
    {
        date: '2025-10-21T00:00:00+05:30', // Oct 21, 2025 (Amavasya)
        expected: {
            tithi: 'Amavasya',
            nakshatra: 'Chitra',
            yoga: 'Vishkambha',
            karana: 'Nagava',
            vara: 'Mangalawara'
        }
    }
];

describe('Real Data Regression Tests', () => {
    TEST_CASES.forEach(({ date, expected }) => {
        test(`matches Drik Panchang for ${date}`, () => {
            // Fix Timezone Issue: Validating for the "Civil Day" implied by the string
            // "2025-10-01T00:00+05:30" implies we want to test Oct 1.
            // In UTC, this instant is Sept 30. If we just use setHours(12), it might stay on Sept 30 in CI.
            // We explicit construct UTC Noon for the target date to ensure we test THAT day.
            const datePart = date.split('T')[0]; // 2025-10-01
            let dt = new Date(`${datePart}T12:00:00Z`);

            const pInit = getPanchangam(dt, BANGALORE);

            // Now query specifically at Sunrise to match Drik's "Day Panchang" convention
            // (Values displayed are usually the ones active at Sunrise)
            // Add 1 minute to be safely into the day/sunrise moment
            if (pInit.sunrise) {
                dt = new Date(pInit.sunrise.getTime() + 1000); // 1 second after sunrise
            }

            const p = getPanchangam(dt, BANGALORE);

            const tithiName = tithiNames[p.tithi];
            const nakshatraName = nakshatraNames[p.nakshatra];
            const yogaName = yogaNames[p.yoga];
            const karanaName = p.karana;

            // Vara check
            const days = ['Raviwara', 'Somawara', 'Mangalawara', 'Budhawara', 'Guruwara', 'Shukrawara', 'Shaniwara'];
            const varaName = days[p.vara];

            // Note: Our calculations vs Drik might differ slightly on boundary times,
            // but for noon on these clear days, they should match.

            // Using synonyms for robustness if needed, but trying exact first
            expect(tithiName).toBe(expected.tithi);
            expect(nakshatraName).toBe(expected.nakshatra);

            // Handle Yoga synonyms/variants
            if (expected.yoga === 'Vishkambha' && yogaName === 'Vishkumbha') {
                expect(yogaName).toBe('Vishkumbha');
            } else {
                expect(yogaName).toBe(expected.yoga);
            }

            // Handle Karana synonyms
            // Drik uses "Nagava", we use "Naga"
            if (expected.karana === 'Nagava' && karanaName === 'Naga') {
                expect(karanaName).toBe('Naga');
            } else {
                expect(karanaName).toBe(expected.karana);
            }

            expect(varaName).toBe(expected.vara);
        });
    });
});
