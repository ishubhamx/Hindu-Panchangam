import React from 'react';
import { tithiNames } from '@panchangam/core';
import type { DayCellProps } from '../../types';
import './DayCell.css';

// Moon phase icons based on tithi (0-29 index)
// Shukla: 0-14 (0=Prathama to 14=Purnima)
// Krishna: 15-29 (15=Prathama to 29=Amavasya)
const getMoonIcon = (tithi: number): string => {
    // Shukla Paksha (waxing moon, index 0-14)
    if (tithi <= 14) {
        if (tithi <= 2) return '🌑';  // New moon / early crescent
        if (tithi <= 5) return '🌒';  // Waxing crescent
        if (tithi <= 8) return '🌓';  // First quarter
        if (tithi <= 11) return '🌔'; // Waxing gibbous
        return '🌕';                   // Full moon (12-14)
    }
    // Krishna Paksha (waning moon, index 15-29)
    else {
        const krishnaTithi = tithi - 15; // 0-14 within Krishna
        if (krishnaTithi <= 2) return '🌕';  // Just after full moon
        if (krishnaTithi <= 5) return '🌖';  // Waning gibbous
        if (krishnaTithi <= 8) return '🌗';  // Last quarter
        if (krishnaTithi <= 11) return '🌘'; // Waning crescent
        return '🌑';                          // New moon (12-14)
    }
};

// Get day type for styling
const getDayType = (date: Date): 'sunday' | 'saturday' | 'weekday' => {
    const day = date.getDay();
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekday';
};

/**
 * DayCell - Individual day in the month calendar
 * UX: Modern card with moon phase, tithi, nakshatra, and festival indicators
 */
export const DayCell: React.FC<DayCellProps> = ({
    date,
    panchang,
    isToday,
    isSelected,
    onClick,
}) => {
    if (!panchang) return null;

    const dayNumber = date.getDate();
    const dayType = getDayType(date);
    const tithiIndex = panchang.tithi;
    const tithiName = tithiNames[tithiIndex] || '';
    const moonIcon = getMoonIcon(tithiIndex);
    const festivals = panchang.festivals || [];
    const hasFestival = festivals.length > 0;

    // Special days (using 0-29 indexing)
    const isAmavasya = tithiIndex === 29 || tithiName.toLowerCase().includes('amavasya');
    const isPurnima = tithiIndex === 14 || tithiName.toLowerCase().includes('purnima');
    const isEkadashi = tithiIndex === 10 || tithiIndex === 25; // Shukla Ekadashi=10, Krishna Ekadashi=25

    // Determine CSS classes
    const classes = [
        'day-cell',
        `day-${dayType}`,
        isToday && 'is-today',
        isSelected && 'is-selected',
        hasFestival && 'has-festival',
        isAmavasya && 'is-amavasya',
        isPurnima && 'is-purnima',
        isEkadashi && 'is-ekadashi',
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} onClick={onClick} aria-label={`${date.toDateString()}, ${tithiName}`}>
            {/* Moon phase icon */}
            <div className="cell-top">
                <span className="moon-icon">{moonIcon}</span>
            </div>

            {/* Center: Date number */}
            <div className="date-number">{dayNumber}</div>

            {/* Bottom: Tithi name */}
            <div className="tithi-name">{tithiName}</div>

            {/* Festival indicator */}
            {hasFestival && (
                <div className="festival-badge" title={festivals.join(', ')}>
                    <span className="festival-icon">🎉</span>
                    {festivals.length > 1 && <span className="festival-count">+{festivals.length - 1}</span>}
                </div>
            )}

            {/* Today indicator ring */}
            {isToday && <div className="today-ring"></div>}

            {/* Special day indicators */}
            {isPurnima && <div className="special-glow purnima-glow"></div>}
            {isAmavasya && <div className="special-glow amavasya-glow"></div>}
        </button>
    );
};
