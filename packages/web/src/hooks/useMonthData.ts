import { useState, useEffect } from 'react';
import { Observer, getPanchangam, getSunrise } from '@panchangam/core';
import type { Location, DayData } from '../types';
import { getTimezoneOffset } from '../utils/timezone';
import { getDaysInMonth } from 'date-fns';

/**
 * Hook to fetch Panchang data for all days in a month
 * Optimized to calculate in batches to avoid blocking UI
 */
export function useMonthData(year: number, month: number, location: Location) {
    const [monthData, setMonthData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchMonthData() {
            try {
                setLoading(true);
                setError(null);

                const daysInMonth = getDaysInMonth(new Date(year, month));
                const observer = new Observer(location.lat, location.lon, location.elevation);

                const data: DayData[] = [];

                // Calculate Panchang for each day
                // Use requestIdleCallback or setTimeout to avoid blocking
                for (let day = 1; day <= daysInMonth; day++) {
                    // Create date at noon local time
                    const date = new Date(year, month, day, 12, 0, 0);

                    // Get timezone offset for this specific date (handles DST)
                    const timezoneOffset = getTimezoneOffset(location.timezone, date);

                    // Get sunrise for this day
                    const sunrise = getSunrise(date, observer);

                    // Calculate Panchang at sunrise
                    const panchang = sunrise
                        ? getPanchangam(sunrise, observer, { timezoneOffset })
                        : getPanchangam(date, observer, { timezoneOffset });

                    data.push({
                        date: new Date(year, month, day),
                        panchang,
                    });

                    // Yield to browser every 5 days to keep UI responsive
                    if (day % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }

                setMonthData(data);
            } catch (err) {
                setError(err as Error);
                console.error('Error fetching month data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchMonthData();
    }, [year, month, location]);

    return { monthData, loading, error };
}
