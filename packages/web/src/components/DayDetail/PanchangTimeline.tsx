import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import './PanchangTimeline.css';

interface TimelineSegment {
    name: string;
    startTime: Date;
    endTime: Date;
    isPrimary: boolean;
}

interface TooltipData {
    name: string;
    startTime: string;
    endTime: string;
    duration: string;
    isPrimary: boolean;
    x: number;
    y: number;
}

interface TimelineRow {
    label: string;
    icon: string;
    segments: TimelineSegment[];
}

interface PanchangTimelineProps {
    panchang: any;
    timezone: string;
}

const WEEKDAY_SANSKRIT: Record<number, string> = {
    0: 'Ravivara',
    1: 'Somavara',
    2: 'Mangalavara',
    3: 'Budhavara',
    4: 'Guruvara',
    5: 'Shukravara',
    6: 'Shanivara',
};

const ROW_CONFIG = [
    { key: 'tithi', label: 'Tithi', icon: '🌙' },
    { key: 'nakshatra', label: 'Nakshatra', icon: '⭐' },
    { key: 'yoga', label: 'Yoga', icon: '☯️' },
    { key: 'karana', label: 'Karana', icon: '◐' },
];

export const PanchangTimeline: React.FC<PanchangTimelineProps> = ({ panchang, timezone }) => {
    const { sunrise, sunset } = panchang;
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const nextSunrise = useMemo(() => {
        if (!sunrise) return null;
        const next = new Date(sunrise);
        next.setDate(next.getDate() + 1);
        return next;
    }, [sunrise]);

    const formatTime = (date: Date | null): string => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: timezone,
            hourCycle: 'h23'
        });
    };

    const getPosition = (time: Date): number => {
        if (!sunrise || !nextSunrise) return 0;
        const totalMs = nextSunrise.getTime() - sunrise.getTime();
        const elapsedMs = time.getTime() - sunrise.getTime();
        return Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
    };

    const isPrimarySegment = (startTime: Date, endTime: Date): boolean => {
        if (!sunrise) return false;
        const sunriseTime = sunrise.getTime();
        return startTime.getTime() <= sunriseTime && endTime.getTime() > sunriseTime;
    };

    const rows = useMemo<TimelineRow[]>(() => {
        if (!sunrise || !nextSunrise) return [];

        const buildSegments = (transitions: any[]): TimelineSegment[] => {
            if (!transitions || transitions.length === 0) {
                return [];
            }
            return transitions.map((t: any) => {
                const startTime = new Date(t.startTime);
                const endTime = new Date(t.endTime);
                return {
                    name: t.name,
                    startTime,
                    endTime,
                    isPrimary: isPrimarySegment(startTime, endTime),
                };
            });
        };

        return ROW_CONFIG.map(config => ({
            label: config.label,
            icon: config.icon,
            segments: buildSegments(
                panchang[`${config.key}Transitions`] || panchang[`${config.key}s`]
            ),
        }));
    }, [panchang, sunrise, nextSunrise]);

    const hourMarkers = useMemo(() => {
        if (!sunrise || !nextSunrise) return [];
        const markers: Array<{ hour: number; position: number; isNoon: boolean }> = [];

        const firstHour = new Date(sunrise);
        firstHour.setMinutes(0, 0, 0);
        if (firstHour <= sunrise) {
            firstHour.setHours(firstHour.getHours() + 1);
        }

        let currentHour = new Date(firstHour);
        while (currentHour < nextSunrise) {
            const hour = currentHour.getHours();
            markers.push({
                hour,
                position: getPosition(currentHour),
                isNoon: hour === 12,
            });
            currentHour = new Date(currentHour.getTime() + 60 * 60 * 1000);
        }

        return markers;
    }, [sunrise, nextSunrise]);

    const currentTimePosition = useMemo(() => {
        const now = new Date();
        if (!sunrise || !nextSunrise) return null;
        if (now < sunrise || now > nextSunrise) return null;
        return getPosition(now);
    }, [sunrise, nextSunrise]);

    const sunsetPosition = useMemo(() => {
        if (!sunset || !sunrise || !nextSunrise) return null;
        return getPosition(sunset);
    }, [sunset, sunrise, nextSunrise]);

    const formatDuration = (start: Date, end: Date): string => {
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const handleSegmentHover = (
        e: React.MouseEvent,
        segment: TimelineSegment
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            name: segment.name,
            startTime: formatTime(segment.startTime),
            endTime: formatTime(segment.endTime),
            duration: formatDuration(segment.startTime, segment.endTime),
            isPrimary: segment.isPrimary,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
        });
    };

    const handleSegmentLeave = () => {
        setTooltip(null);
    };

    if (!sunrise || !nextSunrise) {
        return null;
    }

    const weekday = new Date(sunrise).getDay();
    const currentTimeStr = formatTime(new Date());

    return (
        <div className="panchang-timeline">
            <div className="timeline-header">
                <div className="header-left">
                    <span className="timeline-icon">📊</span>
                    <h3 className="timeline-title">Panchang Timeline</h3>
                </div>
                <div className="timeline-legend">
                    <span className="legend-item primary">
                        <span className="legend-star">★</span>
                        <span>At Sunrise</span>
                    </span>
                </div>
            </div>

            <div className="timeline-wrapper">
                {/* Labels Column */}
                <div className="labels-column">
                    <div className="label-spacer"></div>
                    {rows.map((row) => (
                        <div key={row.label} className="row-label">
                            <span className="row-icon">{row.icon}</span>
                            <span className="row-text">{row.label}</span>
                        </div>
                    ))}
                    <div className="row-label weekday-label">
                        <span className="row-icon">📆</span>
                        <span className="row-text">Weekday</span>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="timeline-content">
                    {/* Time Scale */}
                    <div className="time-scale">
                        <div className="timeline-baseline"></div>

                        {/* Sunrise */}
                        <div className="sun-marker sunrise-marker" style={{ left: '0%' }}>
                            <div className="sun-icon-wrapper sunrise-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 16v4" />
                                    <path d="M8 20h8" />
                                </svg>
                            </div>
                            <span className="sun-time">{formatTime(sunrise)}</span>
                        </div>

                        {/* Hour markers */}
                        {hourMarkers.map((marker, i) => (
                            <div
                                key={i}
                                className={`hour-marker ${marker.isNoon ? 'noon' : ''}`}
                                style={{ left: `${marker.position}%` }}
                            >
                                <span className="hour-tick"></span>
                                <span className="hour-label">{marker.hour}</span>
                            </div>
                        ))}

                        {/* Sunset */}
                        {sunsetPosition !== null && (
                            <div className="sun-marker sunset-marker" style={{ left: `${sunsetPosition}%` }}>
                                <div className="sun-icon-wrapper sunset-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 16v4" />
                                        <path d="M8 20h8" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Next Sunrise */}
                        <div className="sun-marker sunrise-marker" style={{ left: '100%' }}>
                            <div className="sun-icon-wrapper sunrise-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 16v4" />
                                    <path d="M8 20h8" />
                                </svg>
                            </div>
                            <span className="sun-time">{formatTime(nextSunrise)}</span>
                        </div>
                    </div>

                    {/* Timeline Rows */}
                    {rows.map((row, rowIndex) => (
                        <div key={row.label} className="timeline-row">
                            <div className="row-track">
                                {row.segments.map((segment, segIndex) => {
                                    const startPos = getPosition(segment.startTime);
                                    const endPos = getPosition(segment.endTime);
                                    const width = endPos - startPos;

                                    if (width <= 0) return null;

                                    const showTransition = segIndex > 0 && startPos > 2 && startPos < 98;

                                    return (
                                        <div
                                            key={segIndex}
                                            className={`segment segment-${rowIndex} ${segment.isPrimary ? 'primary' : 'secondary'}`}
                                            style={{
                                                left: `${startPos}%`,
                                                width: `${width}%`,
                                            }}
                                            onMouseEnter={(e) => handleSegmentHover(e, segment)}
                                            onMouseLeave={handleSegmentLeave}
                                        >
                                            {segment.isPrimary && (
                                                <span className="primary-badge">★</span>
                                            )}
                                            <span className="segment-name">{segment.name}</span>
                                            {showTransition && (
                                                <div className="transition-marker">
                                                    <span className="transition-time">
                                                        {formatTime(segment.startTime)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Weekday Row */}
                    <div className="timeline-row weekday-row">
                        <div className="row-track">
                            <div className="segment segment-weekday" style={{ left: '0%', width: '100%' }}>
                                <span className="segment-name">{WEEKDAY_SANSKRIT[weekday]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Time Indicator */}
                    {currentTimePosition !== null && (
                        <div
                            className="current-time-indicator"
                            style={{ left: `${currentTimePosition}%` }}
                        >
                            <div className="current-time-label">{currentTimeStr}</div>
                            <div className="current-time-dot"></div>
                            <div className="current-time-line"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltip - Portal to body to avoid stacking context issues */}
            {tooltip && createPortal(
                <div
                    className="segment-tooltip"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                    }}
                >
                    <div className="tooltip-header">
                        {tooltip.isPrimary && <span className="tooltip-star">★</span>}
                        <span className="tooltip-name">{tooltip.name}</span>
                    </div>
                    <div className="tooltip-times">
                        <span className="tooltip-range">{tooltip.startTime} → {tooltip.endTime}</span>
                        <span className="tooltip-duration">{tooltip.duration}</span>
                    </div>
                    {tooltip.isPrimary && (
                        <div className="tooltip-primary-note">Active at Sunrise</div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};
