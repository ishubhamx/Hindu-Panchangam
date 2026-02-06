import React from 'react';
import './SankrantiPanchakInfo.css';

interface SankrantiInfo {
    rashi: number;
    rashiName: string;
    name: string;
    exactTime: Date;
    punyaKalam: { start: Date; end: Date } | null;
}

interface PanchakInfo {
    isPanchak: boolean;
    nakshatra: number;
    nakshatraName: string;
    type: string;
    description: string;
}

interface SankrantiPanchakInfoProps {
    sankranti: SankrantiInfo | null;
    panchak: PanchakInfo | null;
    timezone: string;
}

const formatTime = (date: Date, timezone: string): string => {
    return date.toLocaleTimeString('en-IN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * SankrantiPanchakInfo - Displays Sankranti and Panchak information
 * Shows as prominent alerts when these special conditions are active
 */
export const SankrantiPanchakInfo: React.FC<SankrantiPanchakInfoProps> = ({
    sankranti,
    panchak,
    timezone
}) => {
    if (!sankranti && (!panchak || !panchak.isPanchak)) {
        return null;
    }

    return (
        <div className="sankranti-panchak-container">
            {/* Sankranti Alert */}
            {sankranti && (
                <div className="info-card sankranti-card">
                    <div className="card-header">
                        <span className="card-icon">☀️</span>
                        <h3 className="card-title">{sankranti.name}</h3>
                    </div>
                    <div className="card-content">
                        <p className="primary-info">
                            Sun enters <strong>{sankranti.rashiName}</strong>
                        </p>
                        <p className="time-info">
                            <span className="label">Exact Time:</span>
                            <span className="value">{formatTime(sankranti.exactTime, timezone)}</span>
                        </p>
                        {sankranti.punyaKalam && (
                            <div className="punya-kalam">
                                <span className="label">🌟 Punya Kalam:</span>
                                <span className="value">
                                    {formatTime(sankranti.punyaKalam.start, timezone)} - {formatTime(sankranti.punyaKalam.end, timezone)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Panchak Alert */}
            {panchak && panchak.isPanchak && (
                <div className="info-card panchak-card">
                    <div className="card-header">
                        <span className="card-icon">⚠️</span>
                        <h3 className="card-title">{panchak.type}</h3>
                    </div>
                    <div className="card-content">
                        <p className="primary-info">
                            Moon in <strong>{panchak.nakshatraName}</strong>
                        </p>
                        <p className="description">
                            {panchak.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
