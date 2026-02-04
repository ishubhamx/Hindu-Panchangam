import React from 'react';
import './MoonPhase.css';

interface MoonPhaseProps {
    tithi: number;
    paksha: string;
    size?: number;
    showLabel?: boolean;
    animate?: boolean;
}

/**
 * MoonPhase - Beautiful animated moon phase visualization
 * Uses SVG to render accurate lunar phase based on tithi and paksha
 */
export const MoonPhase: React.FC<MoonPhaseProps> = ({
    tithi,
    paksha: _paksha, // kept for API compatibility, but tithi index is used directly
    size = 80,
    showLabel = true,
    animate = true,
}) => {
    // Calculate illumination percentage
    // Tithi 0-14: Shukla Paksha (waxing) - 0=Prathama (new moon), 14=Purnima (full moon)
    // Tithi 15-29: Krishna Paksha (waning) - 15=Prathama (day after full), 29=Amavasya (new moon)
    let illumination: number;
    let isWaxing: boolean;

    // Use tithi index directly (0-29) rather than paksha string
    if (tithi <= 14) {
        // Shukla Paksha (waxing): tithi 0 = ~0% lit, tithi 14 = 100% lit
        illumination = (tithi + 1) / 15; // Ranges from ~0.07 to 1.0
        isWaxing = true;
    } else {
        // Krishna Paksha (waning): tithi 15 = ~100% lit, tithi 29 = ~0% lit
        const krishnaTithi = tithi - 15; // 0-14 within Krishna
        illumination = (14 - krishnaTithi) / 14; // Ranges from 1.0 to ~0.07
        isWaxing = false;
    }

    illumination = Math.max(0, Math.min(1, illumination));

    // Calculate the inner ellipse rx for the terminator
    const r = size / 2 - 4; // Moon radius with padding
    const rx = Math.abs(r * (2 * illumination - 1));

    // Build the illuminated path
    let path = '';
    if (isWaxing) {
        // Right side illuminated (growing from right)
        path = `M 0 -${r} A ${r} ${r} 0 0 1 0 ${r}`;
        const innerSweep = illumination > 0.5 ? 1 : 0;
        path += ` A ${rx} ${r} 0 0 ${innerSweep} 0 -${r}`;
    } else {
        // Left side illuminated (shrinking from right)
        path = `M 0 -${r} A ${r} ${r} 0 0 0 0 ${r}`;
        const innerSweep = illumination > 0.5 ? 0 : 1;
        path += ` A ${rx} ${r} 0 0 ${innerSweep} 0 -${r}`;
    }

    // Phase name based on tithi (0-29 index)
    const getPhaseName = () => {
        if (tithi === 14) return 'Purnima';           // Full moon
        if (tithi === 29 || tithi === 0) return 'Amavasya'; // New moon
        if (illumination < 0.25) return isWaxing ? 'Waxing Crescent' : 'Waning Crescent';
        if (illumination < 0.5) return isWaxing ? 'First Quarter' : 'Last Quarter';
        if (illumination < 0.75) return isWaxing ? 'Waxing Gibbous' : 'Waning Gibbous';
        return isWaxing ? 'Near Full' : 'Near Full';
    };

    return (
        <div className={`moon-phase-container ${animate ? 'animate' : ''}`}>
            <div className="moon-glow" style={{ width: size + 30, height: size + 30 }} />
            <svg
                width={size}
                height={size}
                viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
                className="moon-svg"
            >
                {/* Moon surface with craters */}
                <defs>
                    <radialGradient id="moonSurface" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="#FFFDE7" />
                        <stop offset="50%" stopColor="#F5F5DC" />
                        <stop offset="100%" stopColor="#E8E4C9" />
                    </radialGradient>
                    <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="craterShadow">
                        <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="#00000033" />
                    </filter>
                </defs>

                {/* Dark side of the moon */}
                <circle r={r} fill="#1a1a24" className="moon-dark" />

                {/* Illuminated part */}
                <path d={path} fill="url(#moonSurface)" filter="url(#moonGlow)" className="moon-lit" />

                {/* Subtle crater marks on illuminated part */}
                <g className="moon-craters" opacity="0.3">
                    <circle cx={r * 0.2} cy={-r * 0.3} r={r * 0.08} fill="#D4D0B8" />
                    <circle cx={r * 0.4} cy={r * 0.2} r={r * 0.06} fill="#D4D0B8" />
                    <circle cx={-r * 0.1} cy={r * 0.4} r={r * 0.07} fill="#D4D0B8" />
                    <circle cx={r * 0.3} cy={-r * 0.5} r={r * 0.05} fill="#D4D0B8" />
                </g>
            </svg>

            {showLabel && (
                <div className="moon-phase-label">
                    <span className="phase-name">{getPhaseName()}</span>
                    <span className="illumination">{Math.round(illumination * 100)}% illuminated</span>
                </div>
            )}
        </div>
    );
};
