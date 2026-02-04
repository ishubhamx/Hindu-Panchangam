import React from 'react';
import { formatTime } from '../../utils/colors';
import './InauspiciousTimings.css';

interface TimePeriod {
    start: Date | null;
    end: Date | null;
}

interface InauspiciousTimingsProps {
    rahuKalam?: TimePeriod | null;
    yamaganda?: TimePeriod | null;
    gulika?: TimePeriod | null;
    durMuhurta?: TimePeriod[] | null;
    timezone: string;
    currentTime?: Date;
}

/**
 * InauspiciousTimings - Shows Rahu Kaal, Yamaganda, Gulika timings
 * UX: Clear warning display with time ranges
 */
export const InauspiciousTimings: React.FC<InauspiciousTimingsProps> = ({
    rahuKalam,
    yamaganda,
    gulika,
    durMuhurta,
    timezone,
    currentTime = new Date()
}) => {
    const isCurrentlyActive = (period: TimePeriod | null | undefined): boolean => {
        if (!period?.start || !period?.end) return false;
        return currentTime >= period.start && currentTime <= period.end;
    };

    const formatPeriod = (period: TimePeriod | null | undefined): string => {
        if (!period?.start || !period?.end) return 'N/A';
        return `${formatTime(period.start, timezone)} - ${formatTime(period.end, timezone)}`;
    };

    const timings = [
        {
            name: 'Rahu Kaal',
            icon: '⚫',
            period: rahuKalam,
            description: 'Avoid starting new ventures',
            color: '#e74c3c'
        },
        {
            name: 'Yamaganda',
            icon: '💀',
            period: yamaganda,
            description: 'Inauspicious for travel',
            color: '#9b59b6'
        },
        {
            name: 'Gulika',
            icon: '🌑',
            period: gulika,
            description: 'Avoid important decisions',
            color: '#34495e'
        }
    ];

    return (
        <div className="inauspicious-timings">
            <div className="timings-header">
                <span className="timings-icon">⚠️</span>
                <h3 className="timings-title">Inauspicious Periods</h3>
            </div>

            <div className="timings-list">
                {timings.map((timing, index) => (
                    <div 
                        key={index}
                        className={`timing-item ${isCurrentlyActive(timing.period) ? 'active' : ''}`}
                        style={{ '--timing-color': timing.color } as React.CSSProperties}
                    >
                        <div className="timing-left">
                            <span className="timing-icon">{timing.icon}</span>
                            <div className="timing-info">
                                <span className="timing-name">{timing.name}</span>
                                <span className="timing-desc">{timing.description}</span>
                            </div>
                        </div>
                        <div className="timing-right">
                            <span className="timing-time">{formatPeriod(timing.period)}</span>
                            {isCurrentlyActive(timing.period) && (
                                <span className="timing-active-badge">Now</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {durMuhurta && durMuhurta.length > 0 && (
                <div className="dur-muhurta-section">
                    <div className="dur-muhurta-label">Dur Muhurta</div>
                    <div className="dur-muhurta-times">
                        {durMuhurta.map((period, index) => (
                            <span key={index} className="dur-muhurta-time">
                                {formatPeriod(period)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
