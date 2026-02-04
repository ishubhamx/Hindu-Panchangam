import React from 'react';
import type { SunriseTimelineProps } from '../../types';
import './SunriseArc.css';

/**
 * SunriseArc - Apple Weather-inspired arc visualization
 * UX: Semicircular arc showing sun's path from sunrise to sunset
 */
export const SunriseArc: React.FC<SunriseTimelineProps> = ({
    sunrise,
    sunset,
    currentTime,
    timezone,
}) => {
    if (!sunrise || !sunset) {
        return <div className="sunrise-arc">Calculating...</div>;
    }

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone,
        }).format(date);
    };

    // Calculate sun position along arc (0 = sunrise, 1 = sunset)
    const now = currentTime.getTime();
    const sunriseTime = sunrise.getTime();
    const sunsetTime = sunset.getTime();
    const daylightDuration = sunsetTime - sunriseTime;

    let sunPosition = 0;
    if (now < sunriseTime) {
        sunPosition = 0; // Before sunrise
    } else if (now > sunsetTime) {
        sunPosition = 1; // After sunset
    } else {
        sunPosition = (now - sunriseTime) / daylightDuration;
    }

    // Calculate sun position along the arc (180 degree semicircle)
    const angle = sunPosition * 180;
    const radians = (angle * Math.PI) / 180;

    // Arc parameters (viewBox coordinates)
    const centerX = 200;
    const centerY = 180;
    const radius = 140;

    const sunX = centerX - radius * Math.cos(radians);
    const sunY = centerY - radius * Math.sin(radians);

    // Calculate daylight hours
    const hours = Math.floor(daylightDuration / (1000 * 60 * 60));
    const minutes = Math.floor((daylightDuration % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="sunrise-arc apple-style">
            <div className="arc-header">
                <span className="arc-title">Daily Cycle</span>
                <span className="arc-subtitle">Apple Weather Style</span>
            </div>

            <svg className="sun-arc-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                {/* Background arc (night/inactive) */}
                <path
                    className="arc-background"
                    d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                    fill="none"
                    strokeWidth="12"
                />

                {/* Active daylight arc */}
                <path
                    className="arc-daylight"
                    d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
                    fill="none"
                    strokeWidth="12"
                    strokeDasharray={`${sunPosition * Math.PI * radius} ${Math.PI * radius}`}
                />

                {/* Sunrise marker */}
                <g className="marker sunrise-arc-marker">
                    <circle
                        cx={centerX - radius}
                        cy={centerY}
                        r="8"
                        className="marker-dot sunrise-dot"
                    />
                    <text x={centerX - radius} y={centerY + 25} className="marker-time">
                        {formatTime(sunrise)}
                    </text>
                </g>

                {/* Sunset marker */}
                <g className="marker sunset-arc-marker">
                    <circle
                        cx={centerX + radius}
                        cy={centerY}
                        r="8"
                        className="marker-dot sunset-dot"
                    />
                    <text x={centerX + radius} y={centerY + 25} className="marker-time">
                        {formatTime(sunset)}
                    </text>
                </g>

                {/* Current sun position indicator */}
                {now >= sunriseTime && now <= sunsetTime && (
                    <g className="sun-indicator">
                        {/* Glow effect */}
                        <circle
                            cx={sunX}
                            cy={sunY}
                            r="16"
                            className="sun-glow"
                        />
                        {/* Sun icon */}
                        <circle
                            cx={sunX}
                            cy={sunY}
                            r="10"
                            className="sun-core"
                        />
                        {/* Vertical line to arc */}
                        <line
                            x1={sunX}
                            y1={sunY}
                            x2={sunX}
                            y2={centerY}
                            className="sun-line"
                            strokeDasharray="2,2"
                        />
                    </g>
                )}

                {/* Horizon line */}
                <line
                    x1={centerX - radius - 20}
                    y1={centerY}
                    x2={centerX + radius + 20}
                    y2={centerY}
                    className="horizon-line"
                    strokeDasharray="4,4"
                />
            </svg>

            <div className="timeline-info">
                <div className="time-point sunrise-point">
                    <div className="icon">☀️</div>
                    <div className="label">Sunrise</div>
                    <div className="time">{formatTime(sunrise)}</div>
                </div>

                <div className="daylight-duration">
                    <div className="duration-value">{hours}h {minutes}m</div>
                    <div className="duration-label">Daylight</div>
                </div>

                <div className="time-point sunset-point">
                    <div className="icon">🌙</div>
                    <div className="label">Sunset</div>
                    <div className="time">{formatTime(sunset)}</div>
                </div>
            </div>
        </div>
    );
};
