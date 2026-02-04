import React, { useMemo } from 'react';
import type { MonthData, DayData } from '../../types';
import './UpcomingFestivals.css';

interface UpcomingFestivalsProps {
    monthData: MonthData | null;
    selectedDate: Date;
}

interface FestivalInfo {
    name: string;
    date: Date;
    daysAway: number;
}

const FESTIVAL_ICONS: Record<string, string> = {
    'Diwali': '🪔',
    'Holi': '🎨',
    'Dussehra': '🏹',
    'Navratri': '🔱',
    'Ganesh Chaturthi': '🐘',
    'Raksha Bandhan': '🎀',
    'Krishna Janmashtami': '🍯',
    'Ram Navami': '🏹',
    'Maha Shivaratri': '🔱',
    'Pongal': '🍚',
    'Makar Sankranti': '🪁',
    'Ekadashi': '🌙',
    'Purnima': '🌕',
    'Amavasya': '🌑',
    'Sankashti': '🐘',
    'Pradosh': '🔱',
    'Chaturthi': '🐘',
};

function getFestivalIcon(festivalName: string): string {
    for (const [key, icon] of Object.entries(FESTIVAL_ICONS)) {
        if (festivalName.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return '🎉';
}

/**
 * UpcomingFestivals - Shows upcoming festivals from current month
 */
export const UpcomingFestivals: React.FC<UpcomingFestivalsProps> = ({
    monthData,
}) => {
    const upcomingFestivals = useMemo(() => {
        if (!monthData?.days) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const festivals: FestivalInfo[] = [];

        monthData.days.forEach((day: DayData) => {
            if (day.panchang?.festivals && day.panchang.festivals.length > 0) {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                
                // Only include today and future festivals
                if (dayDate >= today) {
                    const daysAway = Math.ceil((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    day.panchang.festivals.forEach((festival: string) => {
                        festivals.push({
                            name: festival,
                            date: dayDate,
                            daysAway
                        });
                    });
                }
            }
        });

        // Sort by date and limit to 8
        return festivals.sort((a, b) => a.daysAway - b.daysAway).slice(0, 8);
    }, [monthData]);

    if (upcomingFestivals.length === 0) {
        return null;
    }

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short' 
        });
    };

    const getDaysAwayText = (days: number): string => {
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    return (
        <div className="upcoming-festivals">
            <div className="festivals-header">
                <span className="festivals-header-icon">🎊</span>
                <h3 className="festivals-title">Upcoming Festivals</h3>
            </div>

            <div className="festivals-list">
                {upcomingFestivals.map((festival, index) => (
                    <div 
                        key={`${festival.name}-${index}`}
                        className={`festival-item ${festival.daysAway === 0 ? 'today' : ''}`}
                    >
                        <span className="festival-icon">{getFestivalIcon(festival.name)}</span>
                        <div className="festival-info">
                            <span className="festival-name">{festival.name}</span>
                            <span className="festival-date">{formatDate(festival.date)}</span>
                        </div>
                        <span className={`festival-countdown ${festival.daysAway === 0 ? 'today' : ''}`}>
                            {getDaysAwayText(festival.daysAway)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
