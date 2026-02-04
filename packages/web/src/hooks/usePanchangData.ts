import { useState, useEffect } from 'react';
import { Observer, getPanchangam, getSunrise } from '@panchangam/core';
import type { Location } from '../types';
import { getTimezoneOffset } from '../utils/timezone';

/**
 * Hook to fetch Panchang data for a single date
 * Calculates at sunrise time for accurate Panchang day
 */
export function usePanchangData(date: Date, location: Location) {
    const [panchang, setPanchang] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Create observer for the location
                const observer = new Observer(location.lat, location.lon, location.elevation);

                // Get timezone offset in minutes
                const timezoneOffset = getTimezoneOffset(location.timezone, date);

                // Get sunrise for this date
                const sunrise = getSunrise(date, observer);

                // Calculate Panchang at sunrise (following traditional rules)
                const panchangamData = sunrise
                    ? getPanchangam(sunrise, observer, { timezoneOffset })
                    : getPanchangam(date, observer, { timezoneOffset });

                setPanchang(panchangamData);
            } catch (err) {
                setError(err as Error);
                console.error('Error fetching Panchang data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [date, location]);

    return { panchang, loading, error };
}
