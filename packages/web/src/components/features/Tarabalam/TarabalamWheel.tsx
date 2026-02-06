/**
 * Tarabalam Wheel Component
 * Visualizes the 9 Taras and current Nakshatra strength
 */

import React from 'react';
import { getTarabalam } from '@ishubhamx/panchangam-js';
import './TarabalamWheel.css';

interface TarabalamWheelProps {
    birthNakshatra: number;    // Birth Nakshatra index (0-26)
    currentNakshatra: number;  // Current day's Nakshatra index (0-26)
}

// Tara information
const TARAS = [
    { num: 1, name: 'Janma', good: false },
    { num: 2, name: 'Sampat', good: true },
    { num: 3, name: 'Vipat', good: false },
    { num: 4, name: 'Kshema', good: true },
    { num: 5, name: 'Pratyak', good: false },
    { num: 6, name: 'Sadhana', good: true },
    { num: 7, name: 'Naidhana', good: false },
    { num: 8, name: 'Mitra', good: true },
    { num: 9, name: 'Ati Mitra', good: true },
];

export const TarabalamWheel: React.FC<TarabalamWheelProps> = ({
    birthNakshatra,
    currentNakshatra,
}) => {
    const tara = getTarabalam(birthNakshatra, currentNakshatra);

    return (
        <div className="tarabalam-card">
            <div className="tarabalam-header">
                <h3>
                    <span>⭐</span> Tarabalam
                </h3>
                <span className={`tara-badge ${tara.isAuspicious ? 'auspicious' : 'inauspicious'}`}>
                    {tara.taraName}
                </span>
            </div>

            <div className="tara-wheel-container">
                <div className="tara-wheel">
                    {TARAS.map((t) => (
                        <div
                            key={t.num}
                            className={`tara-segment ${t.good ? 'good' : 'bad'} ${t.num === tara.taraNumber ? 'current' : ''
                                }`}
                            title={`${t.name} - ${t.good ? 'Auspicious' : 'Inauspicious'}`}
                        >
                            <span className="tara-number">{t.num}</span>
                            <span className="tara-name">{t.name}</span>
                        </div>
                    ))}

                    <div className="wheel-center">
                        <span className="wheel-center-label">Tara</span>
                        <span className="wheel-center-value">{tara.taraNumber}</span>
                    </div>
                </div>
            </div>

            <div className="tarabalam-info">
                <p className="tara-description">{tara.description}</p>

                <div className="tara-nakshatras">
                    <div className="nakshatra-info">
                        <div className="nakshatra-label">Birth Nakshatra</div>
                        <div className="nakshatra-value">{tara.birthNakshatraName}</div>
                    </div>
                    <div className="nakshatra-info">
                        <div className="nakshatra-label">Today's Nakshatra</div>
                        <div className="nakshatra-value">{tara.currentNakshatraName}</div>
                    </div>
                </div>
            </div>

            <div className="tara-legend">
                <div className="legend-item">
                    <span className="legend-dot good"></span>
                    <span>Auspicious</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot bad"></span>
                    <span>Inauspicious</span>
                </div>
            </div>
        </div>
    );
};

export default TarabalamWheel;
