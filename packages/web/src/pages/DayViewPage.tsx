import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addDays, subDays, format, isValid, parseISO } from 'date-fns';
import { DayDetail } from '../components/DayDetail/DayDetail';
import { useMonthData } from '../hooks/useMonthData';
import { useOutletContext } from 'react-router-dom';
import type { Location } from '../types';
import { trackEvent } from '../utils/analytics';

export const DayViewPage = () => {
    const { dateStr } = useParams<{ dateStr: string }>();
    const navigate = useNavigate();
    const { location } = useOutletContext<{ location: Location }>();

    // Parse date from URL or default to Today
    const selectedDate = useMemo(() => {
        if (dateStr) {
            const parsed = parseISO(dateStr);
            if (isValid(parsed)) return parsed;
        }
        return new Date(); // Default to today
    }, [dateStr]);

    // Derived state for data fetching
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    // Fetch month data (we use the hook to get cached data, 
    // though for a single day we could optimize this in future)
    const { monthData, loading } = useMonthData(currentYear, currentMonth, location);

    // Get specific panchang for the day
    const selectedPanchang = useMemo(() => {
        if (!selectedDate || monthData.length === 0) return null;

        return monthData.find(d =>
            d.date.getDate() === selectedDate.getDate() &&
            d.date.getMonth() === selectedDate.getMonth() &&
            d.date.getFullYear() === selectedDate.getFullYear()
        )?.panchang || null;
    }, [selectedDate, monthData]);

    // Navigation Handlers
    const handlePrevDay = () => {
        const newDate = subDays(selectedDate, 1);
        trackEvent('Day View', 'Navigate', 'Previous Day');
        navigate(`/date/${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleNextDay = () => {
        const newDate = addDays(selectedDate, 1);
        trackEvent('Day View', 'Navigate', 'Next Day');
        navigate(`/date/${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            trackEvent('Day View', 'Date Picker', e.target.value);
            navigate(`/date/${e.target.value}`);
        }
    };

    return (
        <div className="day-view-page">
            <div className="view-controls">
                <div className="day-navigation">
                    <button className="nav-button" onClick={handlePrevDay} aria-label="Previous Day">
                        ←
                    </button>
                    <div className="date-picker-wrapper">
                        <input
                            type="date"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={handleDateChange}
                            className="date-input"
                        />
                    </div>
                    <button className="nav-button" onClick={handleNextDay} aria-label="Next Day">
                        →
                    </button>
                </div>
            </div>

            <div className="day-view-container">
                {selectedPanchang ? (
                    <DayDetail
                        date={selectedDate}
                        panchang={selectedPanchang}
                        timezone={location.timezone}
                        monthData={{ days: monthData, year: currentYear, month: currentMonth }}
                    />
                ) : (
                    <div className="loading-state">
                        {loading ? 'Loading Panchang...' : 'No data available'}
                    </div>
                )}
            </div>
        </div>
    );
};
