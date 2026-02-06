import React, { useMemo, useState, useEffect } from 'react';
import type { SunriseTimelineProps } from '../../types';
import './SunriseTimeline.css';

/**
 * SunriseTimeline - Beautiful celestial visualization
 * Shows sun and moon paths with accurate positioning
 */
export const SunriseTimeline: React.FC<SunriseTimelineProps> = ({
    sunrise,
    sunset,
    moonrise,
    moonset,
    tithi,
    paksha,
    currentTime: initialTime,
    timezone,
}) => {
    // Real-time clock update
    const [currentTime, setCurrentTime] = useState(initialTime || new Date());

    useEffect(() => {
        // Update every minute for real-time tracking
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        // Also update immediately when component mounts
        setCurrentTime(new Date());

        return () => clearInterval(interval);
    }, []);

    // Constants for SVG
    const WIDTH = 800;
    const HEIGHT = 280;
    const PADDING = 60;
    const HORIZON_Y = 180;
    const MAX_ALTITUDE = 120; // Max height above horizon

    const formatTime = (date: Date | undefined | null): string => {
        if (!date) return '--:--';
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: timezone,
            }).format(date);
        } catch {
            return '--:--';
        }
    };

    // Get minutes from midnight for a date in the target timezone
    const getMinutesFromMidnight = (date: Date): number => {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
                timeZone: timezone,
            });
            const parts = formatter.formatToParts(date);
            const hourPart = parts.find(p => p.type === 'hour');
            const minutePart = parts.find(p => p.type === 'minute');
            const hour = parseInt(hourPart?.value || '0', 10);
            const minute = parseInt(minutePart?.value || '0', 10);
            return hour * 60 + minute;
        } catch (e) {
            console.error('Error converting time to timezone:', e);
            return date.getHours() * 60 + date.getMinutes();
        }
    };

    // Get current time in the target timezone as minutes from midnight
    const getCurrentMinutesInTimezone = (): number => {
        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23', // Use 0-23 hour format
                timeZone: timezone,
            });
            const parts = formatter.formatToParts(now);
            const hourPart = parts.find(p => p.type === 'hour');
            const minutePart = parts.find(p => p.type === 'minute');
            const hour = parseInt(hourPart?.value || '0', 10);
            const minute = parseInt(minutePart?.value || '0', 10);
            return hour * 60 + minute;
        } catch (e) {
            console.error('Error getting timezone time:', e);
            return new Date().getHours() * 60 + new Date().getMinutes();
        }
    };

    const minutesToX = (minutes: number): number => {
        return PADDING + (minutes / (24 * 60)) * (WIDTH - 2 * PADDING);
    };

    // Calculate sun path using sine curve (astronomical approximation)
    const sunData = useMemo(() => {
        if (!sunrise || !sunset) {
            console.log('SunriseTimeline: sunrise or sunset is null', { sunrise, sunset });
            return null;
        }

        try {
            const sunriseMin = getMinutesFromMidnight(sunrise);
            const sunsetMin = getMinutesFromMidnight(sunset);

            console.log('SunriseTimeline: calculated minutes', {
                sunriseMin,
                sunsetMin,
                sunrise: sunrise.toString(),
                sunset: sunset.toString(),
                timezone
            });

            // Safety check for invalid times
            if (sunsetMin <= sunriseMin) {
                console.warn('SunriseTimeline: Invalid sun times - sunset before or equal to sunrise', { sunriseMin, sunsetMin });
                return null;
            }

            const noonMin = (sunriseMin + sunsetMin) / 2;
            const dayDuration = sunsetMin - sunriseMin;

            // Generate smooth path points
            const points: { x: number; y: number }[] = [];

            for (let min = sunriseMin; min <= sunsetMin; min += 2) {
                const x = minutesToX(min);
                // Sine curve for sun altitude
                const progress = (min - sunriseMin) / dayDuration;
                const altitude = Math.sin(progress * Math.PI) * MAX_ALTITUDE;
                const y = HORIZON_Y - altitude;
                points.push({ x, y });
            }

            if (points.length === 0) return null;

            // Create smooth path
            let pathD = `M ${points[0].x} ${HORIZON_Y}`;
            pathD += ` L ${points[0].x} ${points[0].y}`;

            for (let i = 1; i < points.length; i++) {
                pathD += ` L ${points[i].x} ${points[i].y}`;
            }
            pathD += ` L ${points[points.length - 1].x} ${HORIZON_Y}`;

            // Current sun position - always show on timeline
            const currentMin = getCurrentMinutesInTimezone();
            let sunX = minutesToX(currentMin);
            let sunY = HORIZON_Y;
            let isDay = false;

            if (currentMin >= sunriseMin && currentMin <= sunsetMin) {
                // Daytime - sun is above horizon on the arc
                isDay = true;
                const progress = (currentMin - sunriseMin) / dayDuration;
                const altitude = Math.sin(progress * Math.PI) * MAX_ALTITUDE;
                sunY = HORIZON_Y - altitude;
            } else {
                // Nighttime - show sun below horizon
                sunY = HORIZON_Y + 30;
            }

            return {
                pathD,
                sunriseX: minutesToX(sunriseMin),
                sunsetX: minutesToX(sunsetMin),
                noonX: minutesToX(noonMin),
                sunX,
                sunY,
                isDay,
                sunriseTime: formatTime(sunrise),
                sunsetTime: formatTime(sunset),
            };
        } catch (error) {
            console.error('Error calculating sun data:', error);
            return null;
        }
    }, [sunrise, sunset, currentTime, timezone]);

    // Calculate moon path - Robust handling for missing rise/set
    const moonData = useMemo(() => {
        // If BOTH are missing, return null
        if (!moonrise && !moonset) return null;

        try {
            // Helper: default to boundaries if event is missing
            // If moonrise missing -> implies rose yesterday, visible from start of day
            const moonriseMin = moonrise ? getMinutesFromMidnight(moonrise) : 0;

            // If moonset missing -> implies sets tomorrow, visible until end of day
            const moonsetMin = moonset ? getMinutesFromMidnight(moonset) : 24 * 60;

            const currentMin = getCurrentMinutesInTimezone();

            // Determine if moon arc wraps around midnight
            // Note: If we defaulted to 0 or 24*60, wrapsAround logic handles it naturally?
            // Case 1: Rise=12:00, Set=Missing(24:00). wraps=false. Correct.
            // Case 2: Rise=Missing(0), Set=12:00. wraps=false (12<0 is false). Correct.
            // Case 3: Rise=18:00, Set=06:00. wraps=true. Correct.
            const wrapsAround = moonsetMin < moonriseMin;

            // Calculate total duration of moon visibility
            // If specific events are missing, duration might be approx, but visually consistent
            const totalDuration = wrapsAround
                ? (24 * 60 - moonriseMin) + moonsetMin
                : moonsetMin - moonriseMin;

            // Safety check
            if (totalDuration <= 0) return null;

            // Helper to get moon altitude at a given minute
            const getMoonAltitude = (min: number): number => {
                let elapsed: number;

                if (wrapsAround) {
                    if (min >= moonriseMin) {
                        elapsed = min - moonriseMin;
                    } else if (min <= moonsetMin) {
                        elapsed = (24 * 60 - moonriseMin) + min;
                    } else {
                        return -1; // Moon not visible
                    }
                } else {
                    if (min >= moonriseMin && min <= moonsetMin) {
                        elapsed = min - moonriseMin;
                    } else {
                        return -1; // Moon not visible
                    }
                }

                const progress = elapsed / totalDuration;
                return Math.sin(progress * Math.PI) * (MAX_ALTITUDE - 15);
            };

            // Check if moon is visible at current time
            const isMoonUp = (min: number): boolean => {
                if (wrapsAround) {
                    return min >= moonriseMin || min <= moonsetMin;
                }
                return min >= moonriseMin && min <= moonsetMin;
            };

            // Generate moon path segments
            const paths: string[] = [];

            if (wrapsAround) {
                // Segment 1: moonrise to midnight
                const seg1Points: { x: number; y: number }[] = [];
                for (let min = moonriseMin; min < 24 * 60; min += 2) {
                    const alt = getMoonAltitude(min);
                    if (alt >= 0) {
                        seg1Points.push({ x: minutesToX(min), y: HORIZON_Y - alt });
                    }
                }

                if (seg1Points.length > 0) {
                    let d = `M ${minutesToX(moonriseMin)} ${HORIZON_Y}`;
                    for (const pt of seg1Points) {
                        d += ` L ${pt.x} ${pt.y}`;
                    }
                    // Connect to right edge
                    const lastAlt = getMoonAltitude(24 * 60 - 1);
                    if (lastAlt >= 0) {
                        d += ` L ${minutesToX(24 * 60 - 1)} ${HORIZON_Y - lastAlt}`;
                    }
                    paths.push(d);
                }

                // Segment 2: midnight to moonset
                const seg2Points: { x: number; y: number }[] = [];
                for (let min = 0; min <= moonsetMin; min += 2) {
                    const alt = getMoonAltitude(min);
                    if (alt >= 0) {
                        seg2Points.push({ x: minutesToX(min), y: HORIZON_Y - alt });
                    }
                }

                if (seg2Points.length > 0) {
                    // Start from left edge continuing the arc
                    const firstAlt = getMoonAltitude(0);
                    let d = firstAlt >= 0
                        ? `M ${minutesToX(0)} ${HORIZON_Y - firstAlt}`
                        : `M ${seg2Points[0].x} ${seg2Points[0].y}`;
                    for (const pt of seg2Points) {
                        d += ` L ${pt.x} ${pt.y}`;
                    }
                    d += ` L ${minutesToX(moonsetMin)} ${HORIZON_Y}`;
                    paths.push(d);
                }
            } else {
                // Simple case: moonrise to moonset same day
                const points: { x: number; y: number }[] = [];
                for (let min = moonriseMin; min <= moonsetMin; min += 2) {
                    const alt = getMoonAltitude(min);
                    if (alt >= 0) {
                        points.push({ x: minutesToX(min), y: HORIZON_Y - alt });
                    }
                }

                if (points.length > 0) {
                    let d = `M ${minutesToX(moonriseMin)} ${HORIZON_Y}`;
                    for (const pt of points) {
                        d += ` L ${pt.x} ${pt.y}`;
                    }
                    d += ` L ${minutesToX(moonsetMin)} ${HORIZON_Y}`;
                    paths.push(d);
                }
            }

            // Current moon position
            let moonX = minutesToX(currentMin);
            let moonY = HORIZON_Y;
            let isMoonVisible = false;

            if (isMoonUp(currentMin)) {
                isMoonVisible = true;
                const alt = getMoonAltitude(currentMin);
                if (alt >= 0) {
                    moonY = HORIZON_Y - alt;
                }
            }

            return {
                paths,
                moonriseX: minutesToX(moonriseMin),
                moonsetX: minutesToX(moonsetMin),
                moonX,
                moonY,
                isMoonVisible,
                moonriseTime: formatTime(moonrise),
                moonsetTime: formatTime(moonset),
            };
        } catch (error) {
            console.error('Error calculating moon data:', error);
            return null;
        }
    }, [moonrise, moonset, currentTime, timezone]);

    // Moon phase calculation
    const getMoonPhase = () => {
        if (!tithi || !paksha) return 0.5;
        if (paksha === 'Shukla') {
            return tithi / 15; // 0 to 1 (new to full)
        } else {
            return 1 - (tithi / 15); // 1 to 0 (full to new)
        }
    };

    const moonPhase = getMoonPhase();

    // Time markers
    const timeMarkers = [0, 3, 6, 9, 12, 15, 18, 21].map(hour => ({
        x: minutesToX(hour * 60),
        label: hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour < 12 ? `${hour}AM` : `${hour - 12}PM`,
    }));

    // Current time position in the selected timezone
    const currentMinutesInTZ = getCurrentMinutesInTimezone();
    const currentX = minutesToX(currentMinutesInTZ);

    if (!sunrise || !sunset) {
        return (
            <div className="sunrise-timeline-container loading">
                <div className="loading-text">✨ Calculating celestial paths...</div>
            </div>
        );
    }

    // Format current time in selected timezone
    const currentTimeInTZ = (() => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: timezone,
            }).format(new Date());
        } catch {
            return formatTime(new Date());
        }
    })();

    return (
        <div className="sunrise-timeline-container">
            <div className="timeline-header">
                <div className="header-left">
                    <span className="timeline-icon">🌅</span>
                    <span className="timeline-title">Sun & Moon Timeline</span>
                </div>
                <div className="header-right">
                    <span className="current-time-badge">
                        🕐 {currentTimeInTZ}
                    </span>
                </div>
            </div>

            <div className="timeline-graph-wrapper">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="timeline-svg" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        {/* Sun gradient */}
                        <linearGradient id="sunGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255, 200, 50, 0.6)" />
                            <stop offset="100%" stopColor="rgba(255, 150, 0, 0.1)" />
                        </linearGradient>

                        {/* Moon gradient */}
                        <linearGradient id="moonGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(200, 200, 255, 0.4)" />
                            <stop offset="100%" stopColor="rgba(150, 150, 200, 0.05)" />
                        </linearGradient>

                        {/* Sun glow filter */}
                        <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Moon glow filter */}
                        <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Day sky gradient */}
                        <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(135, 206, 250, 0.15)" />
                            <stop offset="100%" stopColor="rgba(25, 25, 50, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Background - Night sky */}
                    <rect x="0" y="0" width={WIDTH} height={HORIZON_Y} fill="url(#skyGradient)" />

                    {/* Stars (decorative) */}
                    {[...Array(20)].map((_, i) => (
                        <circle
                            key={i}
                            cx={PADDING + Math.random() * (WIDTH - 2 * PADDING)}
                            cy={20 + Math.random() * 80}
                            r={Math.random() * 1.5 + 0.5}
                            fill="white"
                            opacity={0.3 + Math.random() * 0.4}
                            className="star"
                        />
                    ))}

                    {/* Horizon line */}
                    <line
                        x1={PADDING}
                        y1={HORIZON_Y}
                        x2={WIDTH - PADDING}
                        y2={HORIZON_Y}
                        className="horizon-line"
                    />

                    {/* Ground gradient */}
                    <rect
                        x={PADDING}
                        y={HORIZON_Y}
                        width={WIDTH - 2 * PADDING}
                        height={HEIGHT - HORIZON_Y - 40}
                        fill="rgba(40, 60, 40, 0.3)"
                        rx="4"
                    />

                    {/* Sun path fill */}
                    {sunData && (
                        <path
                            d={sunData.pathD}
                            fill="url(#sunGradient)"
                            className="sun-path-fill"
                        />
                    )}

                    {/* Sun path stroke */}
                    {sunData && (
                        <path
                            d={sunData.pathD.split(' L ').slice(1, -1).map((p, i) => (i === 0 ? 'M ' : 'L ') + p).join(' ')}
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="sun-path-stroke"
                        />
                    )}

                    {/* Moon paths */}
                    {moonData?.paths.map((d, i) => (
                        <g key={i}>
                            <path d={d} fill="url(#moonGradient)" className="moon-path-fill" />
                            <path
                                d={d}
                                fill="none"
                                stroke="rgba(200, 200, 255, 0.8)"
                                strokeWidth="2"
                                strokeDasharray="8 4"
                                className="moon-path-stroke"
                            />
                        </g>
                    ))}

                    {/* Time grid lines */}
                    {timeMarkers.map((marker, i) => (
                        <g key={i}>
                            <line
                                x1={marker.x}
                                y1={HORIZON_Y - MAX_ALTITUDE - 10}
                                x2={marker.x}
                                y2={HORIZON_Y + 5}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="2 4"
                            />
                            <text
                                x={marker.x}
                                y={HORIZON_Y + 25}
                                textAnchor="middle"
                                className="time-grid-label"
                            >
                                {marker.label}
                            </text>
                        </g>
                    ))}

                    {/* Current time indicator */}
                    <line
                        x1={currentX}
                        y1={20}
                        x2={currentX}
                        y2={HORIZON_Y + 10}
                        className="current-time-line"
                    />

                    {/* Sunrise marker */}
                    {sunData && (
                        <g className="event-marker sunrise-marker">
                            <line
                                x1={sunData.sunriseX}
                                y1={HORIZON_Y - 10}
                                x2={sunData.sunriseX}
                                y2={HORIZON_Y + 45}
                                stroke="#FF9933"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                            />
                            <circle cx={sunData.sunriseX} cy={HORIZON_Y} r="6" fill="#FF9933" />
                            <text x={sunData.sunriseX} y={HORIZON_Y + 60} textAnchor="middle" className="event-label">
                                🌅 {sunData.sunriseTime}
                            </text>
                        </g>
                    )}

                    {/* Sunset marker */}
                    {sunData && (
                        <g className="event-marker sunset-marker">
                            <line
                                x1={sunData.sunsetX}
                                y1={HORIZON_Y - 10}
                                x2={sunData.sunsetX}
                                y2={HORIZON_Y + 45}
                                stroke="#E65C00"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                            />
                            <circle cx={sunData.sunsetX} cy={HORIZON_Y} r="6" fill="#E65C00" />
                            <text x={sunData.sunsetX} y={HORIZON_Y + 60} textAnchor="middle" className="event-label">
                                🌇 {sunData.sunsetTime}
                            </text>
                        </g>
                    )}

                    {/* Moonrise marker */}
                    {moonData && moonrise && (
                        <g className="event-marker moonrise-marker">
                            <circle cx={moonData.moonriseX} cy={HORIZON_Y} r="5" fill="#9090FF" />
                            <text x={moonData.moonriseX} y={HORIZON_Y + 78} textAnchor="middle" className="event-label moon-label">
                                🌙↑ {moonData.moonriseTime}
                            </text>
                        </g>
                    )}

                    {/* Moonset marker */}
                    {moonData && moonset && (
                        <g className="event-marker moonset-marker">
                            <circle cx={moonData.moonsetX} cy={HORIZON_Y} r="5" fill="#7070CC" />
                            <text x={moonData.moonsetX} y={HORIZON_Y + 78} textAnchor="middle" className="event-label moon-label">
                                🌙↓ {moonData.moonsetTime}
                            </text>
                        </g>
                    )}

                    {/* Sun icon at current position */}
                    {sunData && (
                        <g transform={`translate(${sunData.sunX}, ${sunData.sunY})`} filter="url(#sunGlow)" className="sun-icon">
                            <circle r="20" fill={sunData.isDay ? "rgba(255, 200, 50, 0.3)" : "rgba(255, 200, 50, 0.1)"} className="sun-outer-glow" />
                            <circle r="14" fill={sunData.isDay ? "rgba(255, 180, 0, 0.5)" : "rgba(255, 180, 0, 0.2)"} />
                            <circle r="10" fill={sunData.isDay ? "#FFD700" : "#AA9030"} />
                            <text y="4" textAnchor="middle" fontSize="14" className="celestial-emoji">{sunData.isDay ? '☀️' : '🌅'}</text>
                        </g>
                    )}

                    {/* Moon icon at current position */}
                    {moonData && (
                        <g
                            transform={`translate(${moonData.moonX}, ${moonData.isMoonVisible ? moonData.moonY : HORIZON_Y + 25})`}
                            filter="url(#moonGlow)"
                            className="moon-icon"
                            opacity={moonData.isMoonVisible ? 1 : 0.4}
                        >
                            <circle r="16" fill="rgba(200, 200, 255, 0.2)" />
                            <circle r="12" fill="#E8E8F0" />
                            {/* Moon phase overlay */}
                            <clipPath id="moonClip">
                                <circle r="12" />
                            </clipPath>
                            <rect
                                x={-12 + 24 * moonPhase}
                                y="-12"
                                width="24"
                                height="24"
                                fill="rgba(30, 30, 50, 0.8)"
                                clipPath="url(#moonClip)"
                            />
                            {/* Moon texture */}
                            <circle r="2" cx="-4" cy="-3" fill="rgba(150, 150, 170, 0.3)" />
                            <circle r="1.5" cx="3" cy="2" fill="rgba(150, 150, 170, 0.3)" />
                            <circle r="1" cx="-2" cy="4" fill="rgba(150, 150, 170, 0.3)" />
                        </g>
                    )}
                </svg>
            </div>

            {/* Legend */}
            <div className="timeline-legend">
                <div className="legend-item sun-legend">
                    <span className="legend-line sun-line"></span>
                    <span>Sun Path</span>
                </div>
                <div className="legend-item moon-legend">
                    <span className="legend-line moon-line"></span>
                    <span>Moon Path</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot current-dot"></span>
                    <span>Current Time</span>
                </div>
            </div>
        </div>
    );
};
