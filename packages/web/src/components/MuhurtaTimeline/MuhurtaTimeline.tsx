import React from 'react';
import './MuhurtaTimeline.css';

interface MuhurtaPeriod {
    name: string;
    start: Date | null;
    end: Date | null;
    type: 'good' | 'bad' | 'neutral';
    icon?: string;
}

interface MuhurtaTimelineProps {
    sunrise: Date | null;
    sunset: Date | null;
    rahuKalam?: { start: Date; end: Date } | null;
    yamaganda?: { start: Date; end: Date } | null;
    gulika?: { start: Date; end: Date } | null;
    abhijit?: { start: Date; end: Date } | null;
    brahmaMuhurta?: { start: Date; end: Date } | null;
    timezone: string;
}

/**
 * MuhurtaTimeline - Beautiful visualization of auspicious/inauspicious periods
 */
export const MuhurtaTimeline: React.FC<MuhurtaTimelineProps> = ({
    sunrise,
    sunset,
    rahuKalam,
    yamaganda,
    gulika,
    abhijit,
    brahmaMuhurta,
    timezone,
}) => {
    if (!sunrise || !sunset) {
        return <div className="muhurta-timeline loading">Calculating muhurtas...</div>;
    }

    const formatTime = (date: Date | null) => {
        if (!date) return '--:--';
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone,
        }).format(date);
    };

    const muhurtas: MuhurtaPeriod[] = [
        {
            name: 'Brahma Muhurta',
            start: brahmaMuhurta?.start || null,
            end: brahmaMuhurta?.end || null,
            type: 'good',
            icon: '🌅',
        },
        {
            name: 'Abhijit Muhurta',
            start: abhijit?.start || null,
            end: abhijit?.end || null,
            type: 'good',
            icon: '✨',
        },
        {
            name: 'Rahu Kalam',
            start: rahuKalam?.start || null,
            end: rahuKalam?.end || null,
            type: 'bad',
            icon: '🚫',
        },
        {
            name: 'Yamaganda',
            start: yamaganda?.start || null,
            end: yamaganda?.end || null,
            type: 'bad',
            icon: '⚠️',
        },
        {
            name: 'Gulika Kalam',
            start: gulika?.start || null,
            end: gulika?.end || null,
            type: 'bad',
            icon: '🔻',
        },
    ];

    // Calculate position on timeline (0-100%)
    const getPosition = (date: Date | null) => {
        if (!date || !sunrise || !sunset) return 0;
        
        // Use a wider window: 4 AM to 10 PM
        const dayStart = new Date(sunrise);
        dayStart.setHours(4, 0, 0, 0);
        const dayEnd = new Date(sunset);
        dayEnd.setHours(22, 0, 0, 0);
        
        const totalMs = dayEnd.getTime() - dayStart.getTime();
        const posMs = date.getTime() - dayStart.getTime();
        return Math.max(0, Math.min(100, (posMs / totalMs) * 100));
    };

    const getWidth = (start: Date | null, end: Date | null) => {
        if (!start || !end) return 0;
        return getPosition(end) - getPosition(start);
    };

    return (
        <div className="muhurta-timeline">
            <h4 className="muhurta-title">
                <span className="icon">⏰</span>
                Auspicious & Inauspicious Periods
            </h4>

            <div className="muhurta-list">
                {muhurtas.map((muhurta, index) => (
                    <div
                        key={muhurta.name}
                        className={`muhurta-item ${muhurta.type}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="muhurta-header">
                            <span className="muhurta-icon">{muhurta.icon}</span>
                            <span className="muhurta-name">{muhurta.name}</span>
                            <span className={`muhurta-badge ${muhurta.type}`}>
                                {muhurta.type === 'good' ? 'Auspicious' : 'Avoid'}
                            </span>
                        </div>
                        <div className="muhurta-time">
                            {muhurta.start && muhurta.end ? (
                                <>
                                    <span className="time-start">{formatTime(muhurta.start)}</span>
                                    <span className="time-separator">→</span>
                                    <span className="time-end">{formatTime(muhurta.end)}</span>
                                </>
                            ) : (
                                <span className="time-na">Not applicable today</span>
                            )}
                        </div>
                        {muhurta.start && muhurta.end && (
                            <div className="muhurta-bar-container">
                                <div
                                    className={`muhurta-bar ${muhurta.type}`}
                                    style={{
                                        left: `${getPosition(muhurta.start)}%`,
                                        width: `${getWidth(muhurta.start, muhurta.end)}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="sunrise-sunset-row">
                <div className="sun-time sunrise">
                    <span className="sun-icon">🌅</span>
                    <div className="sun-info">
                        <span className="sun-label">Sunrise</span>
                        <span className="sun-value">{formatTime(sunrise)}</span>
                    </div>
                </div>
                <div className="sun-time sunset">
                    <div className="sun-info">
                        <span className="sun-label">Sunset</span>
                        <span className="sun-value">{formatTime(sunset)}</span>
                    </div>
                    <span className="sun-icon">🌇</span>
                </div>
            </div>
        </div>
    );
};
