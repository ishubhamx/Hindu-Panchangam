/**
 * Shoola Compass Component
 * Visualizes Disha Shoola (direction-based travel dosha) with a compass UI
 */

import React from 'react';
import { getDishaShoola } from '@ishubhamx/panchangam-js';
import './ShoolaCompass.css';

interface ShoolaCompassProps {
    vara: number; // Day of week (0 = Sunday, 6 = Saturday)
}

// Direction symbols
const DIRECTION_SYMBOLS: Record<string, string> = {
    North: '↑',
    South: '↓',
    East: '→',
    West: '←',
};

export const ShoolaCompass: React.FC<ShoolaCompassProps> = ({ vara }) => {
    const shoola = getDishaShoola(vara);
    const directions = ['North', 'South', 'East', 'West'];

    const getDirectionClass = (direction: string): string => {
        const base = `direction ${direction.toLowerCase()}`;
        return direction === shoola.inauspiciousDirection
            ? `${base} danger`
            : `${base} safe`;
    };

    return (
        <div className="shoola-card">
            <div className="shoola-header">
                <h3>🧭 Disha Shoola</h3>
                <span className="day-badge">{shoola.varaName}</span>
            </div>

            <div className="compass-container">
                <div className="compass">
                    <div className="compass-ring" />

                    {directions.map(dir => (
                        <div key={dir} className={getDirectionClass(dir)}>
                            <span className="direction-label">
                                {DIRECTION_SYMBOLS[dir]}
                            </span>
                            <span className="direction-name">{dir}</span>
                        </div>
                    ))}

                    {/* Danger line pointing to inauspicious direction */}
                    <div className={`danger-line ${shoola.inauspiciousDirection.toLowerCase()}`} />

                    <div className="compass-center" />
                </div>
            </div>

            <div className="shoola-footer">
                <div className="shoola-warning">
                    <span className="shoola-warning-icon">⚠️</span>
                    <span>
                        Avoid travel towards <strong>{shoola.inauspiciousDirection}</strong> today
                    </span>
                </div>

                <div className="safe-directions">
                    {shoola.safeDirections.map(dir => (
                        <span key={dir} className="safe-badge">
                            ✓ {dir}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShoolaCompass;
