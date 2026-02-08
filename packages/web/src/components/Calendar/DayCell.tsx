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
    // Determine Paksha (Shukla/Krishna)
    const paksha = panchang.paksha || (tithiIndex < 15 ? 'Shukla' : 'Krishna');
    
    // Construct display name: "Name Paksha" (e.g., "Dwitiya Krishna")
    // Amavasya & Purnima are usually standalone
    const isSpecialTithi = tithiName === 'Amavasya' || tithiName === 'Purnima';
    const fullTithiDisplayName = isSpecialTithi ? tithiName : `${tithiName} ${paksha}`;

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

    // Tithi Number for corner display
    const tithiDisplayNum = (tithiIndex % 15) + 1;
    const isShukla = tithiIndex < 15;

    // Detect hidden tithis: if 3+ tithis in one day, the middle one(s) are skipped on the calendar
    // Last tithi in transitions carries over to next day's sunrise, so exclude it
    const tithiTransitions = panchang.tithis || panchang.tithiTransitions || [];
    const thisDayTithis = tithiTransitions.length > 1
        ? tithiTransitions.slice(0, tithiTransitions.length - 1)
        : tithiTransitions;
    const hasHiddenTithi = thisDayTithis.length >= 2;
    const hiddenTithis = hasHiddenTithi
        ? thisDayTithis.slice(1)
        : [];

    // All tithi numbers that actually belong to this day for corner display
    const allTithiNums = thisDayTithis.length > 0
        ? thisDayTithis.map((t: any) => (t.index % 15) + 1)
        : [tithiDisplayNum];
    // Deduplicate while preserving order
    const uniqueTithiNums = allTithiNums.filter((v: number, i: number, a: number[]) => a.indexOf(v) === i);

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

            {/* Tithi name and Paksha */}
            <div className="tithi-name" title={fullTithiDisplayName}>
                {fullTithiDisplayName}
            </div>

            {/* Hidden tithi indicator — tithi that starts & ends within this day */}
            {hasHiddenTithi && hiddenTithis.map((ht: any, i: number) => (
                <div key={i} className="hidden-tithi-indicator">
                    <span className="hidden-tithi-name">+ {ht.name}</span>
                </div>
            ))}

            {/* Tithi Corner Number(s) — show all active tithis */}
            <div className={`tithi-corner-num ${isShukla ? 'shukla' : 'krishna'} ${hasHiddenTithi ? 'has-multi' : ''}`}>
                {hasHiddenTithi ? (
                    <span className="tithi-nums-stack">
                        {uniqueTithiNums.map((n: number, i: number) => (
                            <span key={i} className={`tithi-num-item ${i > 0 && i < uniqueTithiNums.length - 1 ? 'is-hidden-num' : ''}`}>
                                {i > 0 && <span className="tithi-num-sep">·</span>}
                                {n}
                            </span>
                        ))}
                    </span>
                ) : (
                    tithiDisplayNum
                )}
            </div>

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
