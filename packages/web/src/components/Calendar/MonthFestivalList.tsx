import React, { useMemo, useState } from 'react';
import type { DayData } from '../../types';
import { getFestivalIcon } from '../../utils/festivalIcons';
import { getCategoryColor, getCategoryLabel } from '../../utils/festivalColors';
import './MonthFestivalList.css';

interface MonthFestivalListProps {
    monthData: DayData[];
    onDateSelect: (date: Date) => void;
}

interface FestivalEntry {
    name: string;
    category: string;
    date: Date;
    day: number;
    dayName: string;
    isFastingDay?: boolean;
    description?: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type FilterCategory = 'all' | 'major' | 'ekadashi' | 'pradosham' | 'vrat' | 'jayanti';

/**
 * MonthFestivalList - Lists all festivals/observances for the month
 * Shown below the calendar grid on the Month View
 */
export const MonthFestivalList: React.FC<MonthFestivalListProps> = ({ monthData, onDateSelect }) => {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

    const allFestivals = useMemo(() => {
        const festivals: FestivalEntry[] = [];

        monthData.forEach((dayData) => {
            const fests = dayData.panchang?.festivals || [];
            fests.forEach((f: any) => {
                const name = typeof f === 'string' ? f : f.name;
                const category = (typeof f === 'object' && f.category) || 'minor';
                festivals.push({
                    name,
                    category,
                    date: dayData.date,
                    day: dayData.date.getDate(),
                    dayName: DAY_NAMES[dayData.date.getDay()],
                    isFastingDay: typeof f === 'object' ? f.isFastingDay : false,
                    description: typeof f === 'object' ? f.description : undefined,
                });
            });
        });

        // Sort by date
        return festivals.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [monthData]);

    // Available categories for filter
    const categories = useMemo(() => {
        const cats = new Set(allFestivals.map(f => f.category));
        return Array.from(cats);
    }, [allFestivals]);

    // Filtered festivals
    const filteredFestivals = useMemo(() => {
        if (activeFilter === 'all') return allFestivals;
        return allFestivals.filter(f => f.category === activeFilter);
    }, [allFestivals, activeFilter]);

    if (allFestivals.length === 0) {
        return null;
    }

    // Count by category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allFestivals.forEach(f => {
            counts[f.category] = (counts[f.category] || 0) + 1;
        });
        return counts;
    }, [allFestivals]);

    const filterButtons: { key: FilterCategory; label: string }[] = [
        { key: 'all', label: `All (${allFestivals.length})` },
        ...categories
            .sort((a, b) => {
                const order = ['major', 'ekadashi', 'pradosham', 'vrat', 'jayanti', 'minor', 'solar'];
                return order.indexOf(a) - order.indexOf(b);
            })
            .map(cat => ({
                key: cat as FilterCategory,
                label: `${getCategoryLabel(cat)} (${categoryCounts[cat]})`,
            })),
    ];

    return (
        <div className="month-festival-list">
            <div className="mfl-header">
                <div className="mfl-title-row">
                    <span className="mfl-icon">📅</span>
                    <h3 className="mfl-title">This Month's Festivals</h3>
                    <span className="mfl-total">{allFestivals.length}</span>
                </div>
            </div>

            {/* Category filters */}
            <div className="mfl-filters">
                {filterButtons.map(btn => (
                    <button
                        key={btn.key}
                        className={`mfl-filter-btn ${activeFilter === btn.key ? 'active' : ''}`}
                        onClick={() => setActiveFilter(btn.key)}
                        style={
                            activeFilter === btn.key && btn.key !== 'all'
                                ? { borderColor: getCategoryColor(btn.key), color: getCategoryColor(btn.key) }
                                : undefined
                        }
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Festival list */}
            <div className="mfl-list">
                {filteredFestivals.map((festival, index) => (
                    <button
                        key={`${festival.name}-${festival.day}-${index}`}
                        className="mfl-item"
                        onClick={() => onDateSelect(festival.date)}
                    >
                        <div
                            className="mfl-item-accent"
                            style={{ background: getCategoryColor(festival.category) }}
                        />
                        <div className="mfl-item-date">
                            <span className="mfl-date-num">{festival.day}</span>
                            <span className="mfl-date-month">{MONTH_NAMES_SHORT[festival.date.getMonth()]}</span>
                            <span className="mfl-date-day">{festival.dayName}</span>
                        </div>
                        <span className="mfl-item-icon">{getFestivalIcon(festival.name)}</span>
                        <div className="mfl-item-info">
                            <span className="mfl-item-name">{festival.name}</span>
                            <span
                                className="mfl-item-category"
                                style={{ color: getCategoryColor(festival.category) }}
                            >
                                {getCategoryLabel(festival.category)}
                                {festival.isFastingDay && ' · 🙏 Fast'}
                            </span>
                        </div>
                        <span className="mfl-item-arrow">→</span>
                    </button>
                ))}
            </div>

            {filteredFestivals.length === 0 && (
                <div className="mfl-empty">
                    No {getCategoryLabel(activeFilter).toLowerCase()} festivals this month
                </div>
            )}
        </div>
    );
};
