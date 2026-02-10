import React, { useMemo } from 'react';
import { DayCell } from './DayCell';
import type { MonthCalendarProps } from '../../types';
import { isToday } from '../../utils/colors';
import './MonthCalendar.css';

const WEEKDAY_LABELS = [
    { short: 'Sun', full: 'Sunday', icon: '☀️' },
    { short: 'Mon', full: 'Monday', icon: '🌙' },
    { short: 'Tue', full: 'Tuesday', icon: '♂️' },
    { short: 'Wed', full: 'Wednesday', icon: '☿️' },
    { short: 'Thu', full: 'Thursday', icon: '♃' },
    { short: 'Fri', full: 'Friday', icon: '♀️' },
    { short: 'Sat', full: 'Saturday', icon: '♄' },
];

// Hindu month names (approximate mapping)
const HINDU_MONTHS = [
    'Pausha', 'Magha', 'Phalguna', 'Chaitra', 'Vaishakha', 'Jyeshtha',
    'Ashadha', 'Shravana', 'Bhadrapada', 'Ashvina', 'Kartika', 'Margashirsha'
];

/**
 * MonthCalendar - Modern month grid with Hindu calendar details
 * Features: Moon phases, nakshatras, festival indicators, special day highlighting
 */
export const MonthCalendar: React.FC<MonthCalendarProps> = ({
    year,
    month,
    location,
    selectedDate,
    onDateSelect,
    monthData,
    loading,
    onPrevMonth,
    onNextMonth,
    onMonthChange,
}) => {
    // Calculate grid layout
    const firstDay = new Date(year, month, 1).getDay();
    const emptyCells = Array.from({ length: firstDay }, (_, i) => i);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate trailing empty cells for a complete grid
    const totalCells = emptyCells.length + daysInMonth;
    const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const trailingEmptyCells = Array.from({ length: trailingCells }, (_, i) => i);

    // Get Hindu month name from the first panchang data
    const hinduMonth = useMemo(() => {
        if (monthData.length > 0 && monthData[0].panchang?.hinduMonth) {
            return monthData[0].panchang.hinduMonth;
        }
        return HINDU_MONTHS[month];
    }, [monthData, month]);

    // Count festivals in the month
    const festivalCount = useMemo(() => {
        return monthData.reduce((count, day) => {
            return count + (day.panchang?.festivals?.length || 0);
        }, 0);
    }, [monthData]);

    // Handle Month Picker Change (using date input for better UI consistency)
    const handleMonthPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const date = new Date(e.target.value);
            // Input date is typically YYYY-MM-DD
            onMonthChange(date.getFullYear(), date.getMonth());
        }
    };

    // Format current year-month-01 for input value
    const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

    if (loading) {
        return (
            <div className="month-calendar loading">
                <div className="month-header">
                    {/* Skeleton for navigation */}
                    <div className="month-nav-skeleton"></div>
                </div>
                {/* ... (existing loading skeleton) ... */}
                <div className="weekday-headers">
                    {WEEKDAY_LABELS.map(day => (
                        <div key={day.short} className="weekday-label">
                            <span className="weekday-icon">{day.icon}</span>
                            <span className="weekday-text">{day.short}</span>
                        </div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {Array.from({ length: 35 }, (_, i) => (
                        <div key={i} className="skeleton day-cell-skeleton"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="month-calendar">
            {/* Header with Navigation looking exactly like Day View */}
            <div className="month-header-container">


                <div className="month-meta-info"  >
                    <span className="hindu-month-name">{hinduMonth} Masa</span>
                    <div className="month-controls-wrapper">
                        <button className="nav-button" onClick={onPrevMonth} aria-label="Previous month">
                            ←
                        </button>

                        <div className="date-picker-wrapper">
                            <input
                                type="date"
                                value={currentMonthStr}
                                onChange={handleMonthPickerChange}
                                className="date-input"
                                style={{ textAlign: 'center' }}
                            />
                        </div>

                        <button className="nav-button" onClick={onNextMonth} aria-label="Next month">
                            →
                        </button>
                    </div>
                    {festivalCount > 0 && (
                        <div className="festival-summary">
                            <span className="festival-icon">🎉</span>
                            <span className="festival-text">{festivalCount} festival{festivalCount > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekday headers with planetary icons */}
            <div className="weekday-headers">
                {WEEKDAY_LABELS.map((day, index) => (
                    <div
                        key={day.short}
                        className={`weekday-label ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}
                        title={day.full}
                    >
                        <span className="weekday-icon">{day.icon}</span>
                        <span className="weekday-text">{day.short}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid">
                {/* Leading empty cells */}
                {emptyCells.map(i => (
                    <div key={`empty-start-${i}`} className="day-cell empty"></div>
                ))}

                {/* Day cells */}
                {monthData.map((dayData) => {
                    const dateStr = dayData.date.toISOString();
                    const isTodayDate = isToday(dayData.date);
                    const isSelectedDate = selectedDate?.toDateString() === dayData.date.toDateString();

                    return (
                        <DayCell
                            key={dateStr}
                            date={dayData.date}
                            panchang={dayData.panchang}
                            isToday={isTodayDate}
                            isSelected={isSelectedDate}
                            onClick={() => onDateSelect(dayData.date)}
                            timezone={location.timezone}
                        />
                    );
                })}

                {/* Trailing empty cells */}
                {trailingEmptyCells.map(i => (
                    <div key={`empty-end-${i}`} className="day-cell empty trailing"></div>
                ))}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-color purnima"></span>
                    <span className="legend-text">Purnima</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color amavasya"></span>
                    <span className="legend-text">Amavasya</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color ekadashi"></span>
                    <span className="legend-text">Ekadashi</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color major-festival"></span>
                    <span className="legend-text">Major Festival</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color festival"></span>
                    <span className="legend-text">Observance</span>
                </div>
            </div>
        </div>
    );
};
