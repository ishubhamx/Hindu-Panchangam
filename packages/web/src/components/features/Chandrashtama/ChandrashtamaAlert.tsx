/**
 * Chandrashtama Alert Component
 * Displays warning when Moon transits 8th house from birth Rashi
 */

import React from 'react';
import { getChandrashtama } from '@ishubhamx/panchangam-js';
import './ChandrashtamaAlert.css';

interface ChandrashtamaAlertProps {
    birthRashi: number;        // Birth Moon Rashi index (0-11)
    currentMoonRashi: number;  // Current transiting Moon Rashi (0-11)
}

export const ChandrashtamaAlert: React.FC<ChandrashtamaAlertProps> = ({
    birthRashi,
    currentMoonRashi,
}) => {
    const info = getChandrashtama(birthRashi, currentMoonRashi);

    return (
        <div className={`chandrashtama-alert ${info.isActive ? 'active' : 'inactive'}`}>
            <div className="chandrashtama-header">
                <div className="chandrashtama-title">
                    <span className="chandrashtama-icon">
                        {info.isActive ? '⚠️' : '✨'}
                    </span>
                    <h3>Chandrashtama</h3>
                </div>
                <span className={`status-badge ${info.isActive ? 'danger' : 'safe'}`}>
                    {info.isActive ? 'Active' : 'Clear'}
                </span>
            </div>

            <div className="chandrashtama-content">
                <div className="rashi-flow">
                    <div className="rashi-box">
                        <span className="rashi-label">Birth</span>
                        <span className="rashi-name">{info.birthRashiName}</span>
                    </div>
                    <div className="rashi-arrow">
                        <span className="arrow-icon">→</span>
                    </div>
                    <div className={`rashi-box ${info.isActive ? 'highlight' : ''}`}>
                        <span className="rashi-label">8th House</span>
                        <span className="rashi-name">{info.chandrashtamaRashiName}</span>
                    </div>
                    <div className="rashi-arrow">
                        <span className="arrow-icon">{info.isActive ? '=' : '≠'}</span>
                    </div>
                    <div className={`rashi-box current-moon ${info.isActive ? 'highlight' : ''}`}>
                        <span className="rashi-label">Moon</span>
                        <span className="rashi-name">{info.currentMoonRashiName}</span>
                    </div>
                </div>

                <div className="chandrashtama-message">
                    {info.isActive ? (
                        <>
                            <strong>⚡ Moon is in your 8th house today.</strong>
                            <p style={{ marginTop: '8px' }}>
                                This ~2.5 day period may bring mental stress or minor obstacles.
                                Best to avoid major decisions and important activities.
                            </p>
                            <div className="chandrashtama-advice">
                                <div className="advice-title">Recommendations:</div>
                                <ul className="advice-list">
                                    <li>Postpone important meetings or travels</li>
                                    <li>Avoid signing contracts</li>
                                    <li>Focus on routine tasks</li>
                                    <li>Practice patience and mindfulness</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <strong>✓ No Chandrashtama today.</strong>
                            <p style={{ marginTop: '8px' }}>
                                Moon is not in your 8th house. This is a favorable time
                                for important activities and decisions.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChandrashtamaAlert;
