import React from 'react';
import { tithiNames } from '@ishubhamx/panchangam-js';
import type { DayCellProps } from '../../types';
import './DayCell.css';

import { getMoonIcon } from '../../utils/tithiUtils';
import { getFestivalIcon } from '../../utils/festivalIcons';
import { getCategoryColor } from '../../utils/festivalColors';

// Get day type for styling
const getDayType = (date: Date): 'sunday' | 'saturday' | 'weekday' => {
    const day = date.getDay();
    if (day === 0) return 'sunday';
    if (day === 6) return 'saturday';
    return 'weekday';
};

/**
 * DayCell - Individual day in the month calendar
 * UX: Modern card with moon phase, tithi, nakshatra, festival names & category dots
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

    // Helper to get festival info
    const getFestivalInfo = (fests: any[]): { name: string; category: string }[] => {
        return fests.map(f => ({
            name: typeof f === 'string' ? f : f.name,
            category: (typeof f === 'object' && f.category) || 'minor',
        }));
    };

    const festivalInfo = getFestivalInfo(festivals);
    const hasMajor = festivalInfo.some(f => f.category === 'major');

    // Special days (using 0-29 indexing)
    const isAmavasya = tithiIndex === 29 || tithiName.toLowerCase().includes('amavasya');
    const isPurnima = tithiIndex === 14 || tithiName.toLowerCase().includes('purnima');
    const isEkadashi = tithiIndex === 10 || tithiIndex === 25;

    // Determine CSS classes
    const classes = [
        'day-cell',
        `day-${dayType}`,
        isToday && 'is-today',
        isSelected && 'is-selected',
        hasFestival && 'has-festival',
        hasMajor && 'has-major-festival',
        isAmavasya && 'is-amavasya',
        isPurnima && 'is-purnima',
        isEkadashi && 'is-ekadashi',
    ].filter(Boolean).join(' ');

    // Show max 2 festival names in the cell
    const displayFestivals = festivalInfo.slice(0, 2);
    const extraCount = festivalInfo.length - 2;

    return (
        <button className={classes} onClick={onClick} aria-label={`${date.toDateString()}, ${tithiName}`}>
            {/* Top row: moon icon + date */}
            <div className="cell-top">
                <span className="moon-icon">{moonIcon}</span>
                <span className="date-number">{dayNumber}</span>
            </div>

            {/* Tithi name */}
            <div className="tithi-name">{tithiName}</div>

            {/* Festival names (visible on larger screens) */}
            {hasFestival && (
                <div className="cell-festivals">
                    {displayFestivals.map((f, i) => (
                        <div key={i} className="cell-festival-row">
                            <span
                                className="cell-festival-dot"
                                style={{ background: getCategoryColor(f.category) }}
                            />
                            <span className="cell-festival-name">{f.name}</span>
                        </div>
                    ))}
                    {extraCount > 0 && (
                        <span className="cell-festival-more">+{extraCount} more</span>
                    )}
                </div>
            )}

            {/* Festival badge (icon, visible on mobile when text hidden) */}
            {hasFestival && (
                <div className="festival-badge" title={festivalInfo.map(f => f.name).join(', ')}>
                    <span className="festival-icon">{getFestivalIcon(festivalInfo[0].name)}</span>
                    {festivals.length > 1 && <span className="festival-count">+{festivals.length - 1}</span>}
                </div>
            )}

            {/* Category dots row */}
            {hasFestival && festivalInfo.length > 1 && (
                <div className="cell-category-dots">
                    {festivalInfo.slice(0, 4).map((f, i) => (
                        <span
                            key={i}
                            className="cat-dot"
                            style={{ background: getCategoryColor(f.category) }}
                            title={f.name}
                        />
                    ))}
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
