import React from 'react';
import './HoraCard.css';

interface HoraCardProps {
    currentHora?: string;
    sunrise?: Date | null;
    sunset?: Date | null;
}

const HORA_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
const HORA_ICONS: Record<string, string> = {
    Sun: '☀️',
    Moon: '🌙',
    Mars: '♂️',
    Mercury: '☿️',
    Jupiter: '♃',
    Venus: '♀️',
    Saturn: '♄'
};

const HORA_COLORS: Record<string, string> = {
    Sun: '#FFD700',
    Moon: '#C0C0C0',
    Mars: '#FF4500',
    Mercury: '#32CD32',
    Jupiter: '#FFD700',
    Venus: '#FF69B4',
    Saturn: '#4169E1'
};

const HORA_QUALITIES: Record<string, { quality: string; goodFor: string }> = {
    Sun: { quality: 'Auspicious', goodFor: 'Government work, authority matters' },
    Moon: { quality: 'Auspicious', goodFor: 'Travel, new ventures, creativity' },
    Mars: { quality: 'Mixed', goodFor: 'Courage, competition, property' },
    Mercury: { quality: 'Auspicious', goodFor: 'Business, education, communication' },
    Jupiter: { quality: 'Most Auspicious', goodFor: 'Religious activities, learning' },
    Venus: { quality: 'Auspicious', goodFor: 'Marriage, arts, entertainment' },
    Saturn: { quality: 'Inauspicious', goodFor: 'Avoid new beginnings' }
};

/**
 * HoraCard - Displays current planetary hour
 */
export const HoraCard: React.FC<HoraCardProps> = ({ currentHora }) => {
    if (!currentHora) return null;

    const hora = HORA_QUALITIES[currentHora] || { quality: 'Unknown', goodFor: '' };
    const icon = HORA_ICONS[currentHora] || '⭐';
    const color = HORA_COLORS[currentHora] || '#ffc670';

    // Get current hour index and upcoming horas
    const currentIndex = HORA_ORDER.indexOf(currentHora);
    const upcomingHoras = [];
    for (let i = 1; i <= 3; i++) {
        const nextIndex = (currentIndex + i) % HORA_ORDER.length;
        upcomingHoras.push(HORA_ORDER[nextIndex]);
    }

    return (
        <div className="hora-card">
            <div className="hora-header">
                <span className="hora-header-icon">⏰</span>
                <h3 className="hora-title">Planetary Hour (Hora)</h3>
            </div>

            <div className="current-hora" style={{ '--hora-color': color } as React.CSSProperties}>
                <span className="hora-icon">{icon}</span>
                <div className="hora-info">
                    <span className="hora-name">{currentHora} Hora</span>
                    <span className={`hora-quality ${hora.quality.toLowerCase().replace(' ', '-')}`}>
                        {hora.quality}
                    </span>
                </div>
            </div>

            <p className="hora-description">{hora.goodFor}</p>

            <div className="upcoming-horas">
                <span className="upcoming-label">Next:</span>
                {upcomingHoras.map((h, i) => (
                    <span 
                        key={i} 
                        className="upcoming-hora"
                        style={{ '--hora-color': HORA_COLORS[h] } as React.CSSProperties}
                    >
                        {HORA_ICONS[h]} {h}
                    </span>
                ))}
            </div>
        </div>
    );
};
