import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MonthCalendar } from '../components/Calendar/MonthCalendar';
import { MonthFestivalList } from '../components/Calendar/MonthFestivalList';
import { useMonthData } from '../hooks/useMonthData';
import { useOutletContext } from 'react-router-dom';
import type { Location } from '../types';
import { format } from 'date-fns';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthViewPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { location } = useOutletContext<{ location: Location }>();

    // Get year/month from URL params or default to Today
    const today = new Date();

    // State for navigation (independent of selected date)
    const [currentYear, setCurrentYear] = useState(() => {
        const y = searchParams.get('year');
        return y ? parseInt(y) : today.getFullYear();
    });

    const [currentMonth, setCurrentMonth] = useState(() => {
        const m = searchParams.get('month');
        return m ? parseInt(m) : today.getMonth();
    });

    // Sync URL when state changes
    useEffect(() => {
        setSearchParams({
            year: currentYear.toString(),
            month: currentMonth.toString()
        }, { replace: true });
    }, [currentYear, currentMonth, setSearchParams]);

    const { monthData, loading } = useMonthData(currentYear, currentMonth, location);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleDateSelect = (date: Date) => {
        // Navigate to Day View when a date is clicked
        navigate(`/date/${format(date, 'yyyy-MM-dd')}`);
    };

    return (
        <div className="month-view-page">
            <div className="view-controls">
                <div className="month-controls-wrapper">
                    <button className="nav-button" onClick={handlePrevMonth} aria-label="Previous month">
                        ←
                    </button>
                    <div className="month-year-display">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </div>
                    <button className="nav-button" onClick={handleNextMonth} aria-label="Next month">
                        →
                    </button>
                </div>
            </div>

            <div className="month-calendar-container">
                <MonthCalendar
                    year={currentYear}
                    month={currentMonth}
                    location={location}
                    selectedDate={null} // No specific selection in month view overview
                    onDateSelect={handleDateSelect}
                    monthData={monthData}
                    loading={loading}
                />
            </div>

            {/* Festival list for the month */}
            {!loading && monthData.length > 0 && (
                <div className="month-festivals-container">
                    <MonthFestivalList
                        monthData={monthData}
                        onDateSelect={handleDateSelect}
                    />
                </div>
            )}
        </div>
    );
};
