import React from 'react';
import { tithiNames } from '@ishubhamx/panchangam-js';
import type { DayCellProps } from '../../types';
import './DayCell.css';

import { getMoonIcon } from '../../utils/tithiUtils';
import { getFestivalIcon } from '../../utils/festivalIcons';

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

    // Helper to get festival names
    const getFestivalNames = (fests: any[]): string[] => {
        return fests.map(f => typeof f === 'string' ? f : f.name);
    };

    const festivalNames = getFestivalNames(festivals);

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
                <div className="festival-badge" title={festivalNames.join(', ')}>
                    <span className="festival-icon">{getFestivalIcon(festivalNames[0])}</span>
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
