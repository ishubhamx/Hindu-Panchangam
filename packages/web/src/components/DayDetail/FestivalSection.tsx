import React from 'react';
import { getFestivalIcon } from '../../utils/festivalIcons';
import { getCategoryColor, getCategoryLabel, getCategoryIcon } from '../../utils/festivalColors';
import './FestivalSection.css';

interface Festival {
    name: string;
    type?: string;
    category?: string;
    description?: string;
    observances?: string[];
    regional?: string[];
    isFastingDay?: boolean;
    tithi?: number;
    paksha?: string;
    masa?: string;
    spanDays?: number;
}

interface FestivalSectionProps {
    festivals: Festival[];
}

/**
 * FestivalSection - Beautiful festival cards for Day View
 * Shows detailed festival info with category colors, icons, descriptions
 */
export const FestivalSection: React.FC<FestivalSectionProps> = ({ festivals }) => {
    if (!festivals || festivals.length === 0) return null;

    // Separate major vs other festivals
    const majorFestivals = festivals.filter(f => f.category === 'major');
    const otherFestivals = festivals.filter(f => f.category !== 'major');

    return (
        <div className="festival-section">
            <div className="festival-section-header">
                <div className="festival-section-title-row">
                    <span className="festival-section-icon">🪔</span>
                    <h3 className="festival-section-title">
                        {festivals.length === 1 ? 'Festival' : 'Festivals & Observances'}
                    </h3>
                    <span className="festival-section-count">{festivals.length}</span>
                </div>
            </div>

            <div className="festival-cards-container">
                {/* Major festivals get hero treatment */}
                {majorFestivals.map((festival, index) => (
                    <FestivalHeroCard key={`major-${index}`} festival={festival} />
                ))}

                {/* Other festivals in a grid */}
                {otherFestivals.length > 0 && (
                    <div className="festival-cards-grid">
                        {otherFestivals.map((festival, index) => (
                            <FestivalCard key={`other-${index}`} festival={festival} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Hero card for major festivals with full-width gradient
 */
const FestivalHeroCard: React.FC<{ festival: Festival }> = ({ festival }) => {
    const name = typeof festival === 'string' ? festival : festival.name;
    const icon = getFestivalIcon(name);
    const category = festival.category || 'minor';
    const catColor = getCategoryColor(category);
    const catLabel = getCategoryLabel(category);
    const catIcon = getCategoryIcon(category);

    return (
        <div
            className="festival-hero-card"
            style={{ '--cat-color': catColor, '--cat-glow': `${catColor}40` } as React.CSSProperties}
        >
            <div className="festival-hero-glow" />
            <div className="festival-hero-content">
                <div className="festival-hero-icon-wrapper">
                    <span className="festival-hero-icon">{icon}</span>
                </div>
                <div className="festival-hero-info">
                    <h4 className="festival-hero-name">{name}</h4>
                    {festival.description && (
                        <p className="festival-hero-description">{festival.description}</p>
                    )}
                    <div className="festival-hero-meta">
                        <span className="festival-category-badge major">
                            {catIcon} {catLabel}
                        </span>
                        {festival.isFastingDay && (
                            <span className="festival-fasting-badge">
                                🙏 Fasting Day
                            </span>
                        )}
                        {festival.paksha && festival.masa && (
                            <span className="festival-tithi-badge">
                                {festival.paksha} · {festival.masa}
                            </span>
                        )}
                    </div>
                    {festival.observances && festival.observances.length > 0 && (
                        <div className="festival-observances">
                            {festival.observances.map((obs, i) => (
                                <span key={i} className="observance-tag">✦ {obs}</span>
                            ))}
                        </div>
                    )}
                    {festival.regional && festival.regional.length > 0 && (
                        <div className="festival-regional">
                            <span className="regional-label">Regions:</span>
                            {festival.regional.map((reg, i) => (
                                <span key={i} className="regional-tag">{reg}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Compact card for minor festivals / observances
 */
const FestivalCard: React.FC<{ festival: Festival }> = ({ festival }) => {
    const name = typeof festival === 'string' ? festival : festival.name;
    const icon = getFestivalIcon(name);
    const category = festival.category || 'minor';
    const catColor = getCategoryColor(category);
    const catLabel = getCategoryLabel(category);
    const catIcon = getCategoryIcon(category);

    return (
        <div
            className="festival-card"
            style={{ '--cat-color': catColor } as React.CSSProperties}
        >
            <div className="festival-card-accent" />
            <div className="festival-card-content">
                <div className="festival-card-top">
                    <span className="festival-card-icon">{icon}</span>
                    <div className="festival-card-info">
                        <span className="festival-card-name">{name}</span>
                        <span className="festival-category-tag" style={{ color: catColor }}>
                            {catIcon} {catLabel}
                        </span>
                    </div>
                </div>
                {festival.description && (
                    <p className="festival-card-desc">{festival.description}</p>
                )}
                <div className="festival-card-badges">
                    {festival.isFastingDay && (
                        <span className="badge-fasting">🙏 Fast</span>
                    )}
                    {festival.paksha && (
                        <span className="badge-paksha">{festival.paksha}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
