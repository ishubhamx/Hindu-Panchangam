import React, { useState } from 'react';
import type { PanchangCardProps } from '../../types';
import './PanchangCard.css';

/**
 * PanchangCard - Reusable card for Panchang elements
 * UX: Glassmorphism card with expand/collapse for details
 */
export const PanchangCard: React.FC<PanchangCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    details,
    accentColor = 'var(--color-accent-primary)',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`panchang-card ${isExpanded ? 'expanded' : ''}`}
            style={{ '--accent-color': accentColor } as React.CSSProperties}
            onClick={() => details && setIsExpanded(!isExpanded)}
        >
            <div className="card-header">
                {icon && <div className="card-icon">{icon}</div>}
                <h4 className="card-title">{title}</h4>
            </div>

            <div className="card-body">
                <div className="card-value">{value}</div>
                {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>

            {details && (
                <>
                    <button className="expand-button" onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}>
                        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    <div className={`card-details ${isExpanded ? 'visible' : ''}`}>
                        {details}
                    </div>
                </>
            )}
        </div>
    );
};
