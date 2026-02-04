import React from 'react';
import './PlanetaryPositions.css';

interface PlanetPosition {
    longitude: number;
    rashi: number;
    rashiName: string;
    degree: number;
    isRetrograde: boolean;
    speed: number;
    dignity: 'exalted' | 'debilitated' | 'own' | 'neutral';
}

interface PlanetaryPositionsProps {
    positions?: {
        sun: PlanetPosition;
        moon: PlanetPosition;
        mars: PlanetPosition;
        mercury: PlanetPosition;
        jupiter: PlanetPosition;
        venus: PlanetPosition;
        saturn: PlanetPosition;
        rahu: PlanetPosition;
        ketu: PlanetPosition;
    };
}

const PLANET_INFO: Record<string, { icon: string; name: string; sanskritName: string }> = {
    sun: { icon: '☀️', name: 'Sun', sanskritName: 'Surya' },
    moon: { icon: '🌙', name: 'Moon', sanskritName: 'Chandra' },
    mars: { icon: '🔴', name: 'Mars', sanskritName: 'Mangal' },
    mercury: { icon: '🟢', name: 'Mercury', sanskritName: 'Budha' },
    jupiter: { icon: '🟡', name: 'Jupiter', sanskritName: 'Guru' },
    venus: { icon: '💗', name: 'Venus', sanskritName: 'Shukra' },
    saturn: { icon: '🔵', name: 'Saturn', sanskritName: 'Shani' },
    rahu: { icon: '⬛', name: 'Rahu', sanskritName: 'Rahu' },
    ketu: { icon: '🟤', name: 'Ketu', sanskritName: 'Ketu' }
};

const RASHI_ICONS: Record<string, string> = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓',
    'Mesha': '♈',
    'Vrishabha': '♉',
    'Mithuna': '♊',
    'Karka': '♋',
    'Simha': '♌',
    'Kanya': '♍',
    'Tula': '♎',
    'Vrishchika': '♏',
    'Dhanu': '♐',
    'Makara': '♑',
    'Kumbha': '♒',
    'Meena': '♓'
};

/**
 * PlanetaryPositions - Displays all planet positions in zodiac
 */
export const PlanetaryPositions: React.FC<PlanetaryPositionsProps> = ({ positions }) => {
    if (!positions) return null;

    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    return (
        <div className="planetary-positions">
            <div className="positions-header">
                <span className="positions-icon">🪐</span>
                <h3 className="positions-title">Planetary Positions (Graha Sthiti)</h3>
            </div>

            <div className="positions-grid">
                {planets.map(planet => {
                    const pos = positions[planet as keyof typeof positions];
                    const info = PLANET_INFO[planet];
                    if (!pos) return null;

                    return (
                        <div key={planet} className={`planet-card ${pos.dignity}`}>
                            <div className="planet-header">
                                <span className="planet-icon">{info.icon}</span>
                                <div className="planet-names">
                                    <span className="planet-name">{info.name}</span>
                                    <span className="planet-sanskrit">{info.sanskritName}</span>
                                </div>
                            </div>

                            <div className="planet-position">
                                <span className="rashi-icon">{RASHI_ICONS[pos.rashiName] || '⭐'}</span>
                                <span className="rashi-name">{pos.rashiName}</span>
                            </div>

                            <div className="planet-details">
                                <span className="planet-degree">{pos.degree?.toFixed(1)}°</span>
                                {pos.isRetrograde && (
                                    <span className="retrograde-badge" title="Retrograde">ℛ</span>
                                )}
                            </div>

                            {pos.dignity !== 'neutral' && (
                                <span className={`dignity-badge ${pos.dignity}`}>
                                    {pos.dignity}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
