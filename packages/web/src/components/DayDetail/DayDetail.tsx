import React, { useMemo, useState } from 'react';
import {
    tithiNames,
    nakshatraNames,
    yogaNames,
    getSankrantiForDate,
    getPanchak,
    getAyanamsa
} from '@ishubhamx/panchangam-js';
import type { DayDetailProps } from '../../types';
import { PanchangTimeline } from './PanchangTimeline';
import { SunriseTimeline } from './SunriseTimeline';
import { PanchangCard } from './PanchangCard';
import { InauspiciousTimings } from './InauspiciousTimings';
import { HoraCard } from './HoraCard';
import { UpcomingFestivals } from './UpcomingFestivals';
import { PlanetaryPositions } from './PlanetaryPositions';
import { SankrantiPanchakInfo } from './SankrantiPanchakInfo';
import { FestivalSection } from './FestivalSection';
import { MoonPhase } from '../MoonPhase';
import { MuhurtaTimeline } from '../MuhurtaTimeline';
import { ShoolaCompass } from '../features/Shoola';
import { TarabalamWheel } from '../features/Tarabalam';
import { ChandrashtamaAlert } from '../features/Chandrashtama';
import { BirthDataModal, loadBirthData } from '../BirthDataModal';
import { trackBirthDataModal } from '../../utils/analytics';
import { formatTime } from '../../utils/colors';
import { getTimezoneOffset } from '../../utils/timezone';
import { getFestivalIcon } from '../../utils/festivalIcons';
import './DayDetail.css';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// UI Mappings for Ritu (Seasons)
const RITU_DETAILS: Record<string, { english: string, emoji: string }> = {
    "Vasant": { english: "Spring", emoji: "🌸" },
    "Grishma": { english: "Summer", emoji: "☀️" },
    "Varsha": { english: "Monsoon", emoji: "🌧️" },
    "Sharad": { english: "Autumn", emoji: "🍂" },
    "Hemant": { english: "Pre-Winter", emoji: "❄️" },
    "Shishir": { english: "Winter", emoji: "⛄" }
};

const AYANA_EMOJIS: Record<string, string> = {
    "Uttarayana": "⬆️",
    "Dakshinayana": "⬇️"
};

interface BirthData {
    birthRashi: number;
    birthNakshatra: number;
}

/**
 * DayDetail - Detailed view for a selected day
 * UX: Hero section, sunrise timeline, Panchang cards grid
 */
export const DayDetail: React.FC<DayDetailProps> = ({ date, panchang, timezone, monthData }) => {
    // Birth data state for personalized Vedic features
    const [birthData, setBirthData] = useState<BirthData | null>(() => {
        const saved = loadBirthData();
        return saved ? { birthRashi: saved.birthRashi, birthNakshatra: saved.birthNakshatra } : null;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate Sankranti and Panchak for the selected date
    const { sankranti, panchakInfo } = useMemo(() => {
        if (!panchang) return { sankranti: null, panchakInfo: null };

        const timezoneOffset = getTimezoneOffset(timezone, date);
        const ayanamsa = getAyanamsa(date);

        // Check for Sankranti on this day
        const sankrantiResult = getSankrantiForDate(date, ayanamsa, timezoneOffset);

        // Check for Panchak based on current Nakshatra
        const panchakResult = getPanchak(panchang.nakshatra);

        return {
            sankranti: sankrantiResult,
            panchakInfo: panchakResult
        };
    }, [date, panchang, timezone]);

    if (!panchang) {
        return (
            <div className="day-detail loading">
                <div className="skeleton hero-skeleton"></div>
                <div className="skeleton timeline-skeleton"></div>
                <div className="panchang-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton card-skeleton"></div>
                    ))}
                </div>
            </div>
        );
    }

    const weekday = WEEKDAYS[date.getDay()];
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    const tithiName = tithiNames[panchang.tithi] || `Tithi ${panchang.tithi}`;
    const nakshatraName = nakshatraNames[panchang.nakshatra] || `Nakshatra ${panchang.nakshatra}`;
    const yogaName = yogaNames[panchang.yoga] || `Yoga ${panchang.yoga}`;
    const karanaName = panchang.karana || '-';

    const festivals = panchang.festivals || [];

    // Derived Vedic Data from Library
    const rituName = panchang.ritu || "Vasant";
    const ayanaName = panchang.ayana || "Uttarayana";

    const ritu = {
        name: rituName,
        ...RITU_DETAILS[rituName] || { english: "", emoji: "✨" }
    };
    const ayana = {
        name: ayanaName,
        emoji: AYANA_EMOJIS[ayanaName] || "↕️"
    };

    return (
        <div className="day-detail">
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-top-row">
                    <div className="hero-left-content">
                        {/* Primary: Tithi — show multi-tithi only when a tithi is "hidden" (3+ tithis in one day) */}
                        <div className="tithi-main">
                            {(() => {
                                // Last tithi carries to next sunrise, exclude it from this day
                                const allTithis = panchang.tithis || [];
                                const dayTithis = allTithis.length > 1
                                    ? allTithis.slice(0, allTithis.length - 1)
                                    : allTithis;
                                // Show multi-tithi view only when 2+ tithis belong to this day
                                if (dayTithis.length >= 2) {
                                    return (
                                        <div className="multi-tithi-container">
                                            {dayTithis.map((t: any, idx: number) => {
                                                const isUdaya = t.index === panchang.tithi;
                                                const isHidden = idx > 0;
                                                return (
                                                    <div key={idx} className={`tithi-row ${isUdaya ? 'is-udaya' : ''} ${isHidden ? 'is-hidden-tithi' : ''}`}>
                                                        <span className="tithi-name-text">{t.name}</span>
                                                        {t.endTime && (
                                                            <span className="tithi-end-time">
                                                                {idx === 0
                                                                    ? ` upto ${formatTime(new Date(t.endTime), timezone)}`
                                                                    : ` ${formatTime(new Date(t.startTime), timezone)} – ${formatTime(new Date(t.endTime), timezone)}`
                                                                }
                                                            </span>
                                                        )}
                                                        {isHidden && <span className="hidden-tithi-badge">kshaya tithi</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return tithiName;
                            })()}
                        </div>

                        {/* Secondary: Date & Weekday */}
                        <div className="date-secondary">
                            <span className="weekday-badge">{weekday}</span>
                            <span className="date-text">{month} {day}, {year}</span>
                        </div>

                        {festivals.length > 0 && (
                            <div className="festivals-list">
                                {festivals.slice(0, 3).map((festival: any, i: number) => {
                                    const name = typeof festival === 'string' ? festival : festival.name;
                                    const icon = getFestivalIcon(name);
                                    const category = (typeof festival === 'object' && festival.category) || 'minor';
                                    return (
                                        <span key={i} className={`festival-tag festival-tag--${category}`}>
                                            <span className="festival-icon-small">{icon}</span> {name}
                                        </span>
                                    );
                                })}
                                {festivals.length > 3 && (
                                    <span className="festival-tag festival-tag--more">
                                        +{festivals.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hero-right-content">
                        <div className="moon-phase-wrapper">
                            <MoonPhase tithi={panchang.tithi} paksha={panchang.paksha} />
                            <div className="paksha-label">{panchang.paksha} Paksha</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="hero-stats-grid">
                    <div className="stat-item">
                        <span className="stat-icon">⭐</span>
                        <div className="stat-content">
                            <span className="stat-label">Nakshatra</span>
                            <span className="stat-value">{nakshatraName}</span>
                        </div>
                    </div>
                    {/* NEW: Moon Rashi */}
                    {panchang.moonRashi && (
                        <div className="stat-item">
                            <span className="stat-icon">🌙</span>
                            <div className="stat-content">
                                <span className="stat-label">Moon Sign</span>
                                <span className="stat-value">{panchang.moonRashi.name}</span>
                            </div>
                        </div>
                    )}
                    <div className="stat-item">
                        <span className="stat-icon">🧠</span>
                        <div className="stat-content">
                            <span className="stat-label">Yoga</span>
                            <span className="stat-value">{yogaName}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🌅</span>
                        <div className="stat-content">
                            <span className="stat-label">Sunrise</span>
                            <span className="stat-value">{formatTime(panchang.sunrise, timezone)}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">🌇</span>
                        <div className="stat-content">
                            <span className="stat-label">Sunset</span>
                            <span className="stat-value">{formatTime(panchang.sunset, timezone)}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-footer">
                    <div className="info-pill">
                        <span className="label">Masa</span>
                        <span className="value">{panchang.masa?.name} {panchang.masa?.isAdhika ? '(Adhika)' : ''}</span>
                    </div>
                    {/* NEW: Ritu */}
                    <div className="info-pill">
                        <span className="label">Ritu</span>
                        <span className="value">{ritu.emoji} {ritu.name}</span>
                    </div>
                    {/* NEW: Ayana */}
                    <div className="info-pill">
                        <span className="label">Ayana</span>
                        <span className="value">{ayana.emoji} {ayana.name}</span>
                    </div>
                    {panchang.samvat && (
                        <div className="info-pill">
                            <span className="label">Samvat</span>
                            <span className="value">{panchang.samvat.vikram}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Festival Section - Detailed cards for all festivals */}
            {festivals.length > 0 && (
                <FestivalSection festivals={festivals} />
            )}

            {/* Sankranti & Panchak Alerts */}
            <SankrantiPanchakInfo
                sankranti={sankranti}
                panchak={panchakInfo}
                timezone={timezone}
            />

            {/* Combined Timelines Section */}
            <div className="timelines-section">
                {/* Sun & Moon Timeline */}
                <div className="timeline-section glass-card">
                    <SunriseTimeline
                        sunrise={panchang.sunrise}
                        sunset={panchang.sunset}
                        moonrise={panchang.moonrise}
                        moonset={panchang.moonset}
                        tithi={panchang.tithi}
                        paksha={panchang.paksha}
                        currentTime={new Date()}
                        timezone={timezone}
                    />
                </div>

                <MuhurtaTimeline
                    rahuKalam={panchang.rahuKalamStart && panchang.rahuKalamEnd ? {
                        start: panchang.rahuKalamStart,
                        end: panchang.rahuKalamEnd
                    } : null}
                    yamaganda={panchang.yamagandaKalam}
                    gulika={panchang.gulikaKalam}
                    abhijit={panchang.abhijitMuhurta}
                    brahmaMuhurta={panchang.brahmaMuhurta}
                    sunrise={panchang.sunrise}
                    sunset={panchang.sunset}
                    timezone={timezone}
                />

                {/* Panchang Timeline - Detailed Transitions */}
                <div className="timeline-section glass-card">
                    <PanchangTimeline panchang={panchang} timezone={timezone} />
                </div>
            </div>

            {/* Panchang Cards Grid */}
            <div className="panchang-grid">
                <PanchangCard
                    title="Tithi"
                    value={tithiName}
                    subtitle={panchang.tithiEndTime ? `Ends at ${formatTime(panchang.tithiEndTime, timezone)}` : undefined}
                    icon="🌙"
                    accentColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    details={
                        panchang.paksha && (
                            <div>
                                <p><strong>Paksha:</strong> {panchang.paksha}</p>
                                {panchang.tithiStartTime && (
                                    <p><strong>Started:</strong> {formatTime(panchang.tithiStartTime, timezone)}</p>
                                )}
                            </div>
                        )
                    }
                />

                <PanchangCard
                    title="Nakshatra"
                    value={nakshatraName}
                    subtitle={panchang.nakshatraEndTime ? `Ends at ${formatTime(panchang.nakshatraEndTime, timezone)}` : undefined}
                    icon="⭐"
                    accentColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    details={
                        panchang.nakshatraPada && (
                            <div>
                                <p><strong>Pada:</strong> {panchang.nakshatraPada}/4</p>
                                {panchang.moonRashi && (
                                    <p><strong>Moon Rashi:</strong> {panchang.moonRashi.name}</p>
                                )}
                            </div>
                        )
                    }
                />

                <PanchangCard
                    title="Yoga"
                    value={yogaName}
                    subtitle={panchang.yogaEndTime ? `Ends at ${formatTime(panchang.yogaEndTime, timezone)}` : undefined}
                    icon="🔄"
                    accentColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                />

                <PanchangCard
                    title="Karana"
                    value={karanaName}
                    icon="📊"
                    accentColor="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                />
            </div>

            {/* Two Column Layout for Additional Features */}
            <div className="features-grid">
                <div className="features-column">
                    {/* Inauspicious Timings */}
                    <InauspiciousTimings
                        rahuKalam={panchang.rahuKalamStart && panchang.rahuKalamEnd ? {
                            start: panchang.rahuKalamStart,
                            end: panchang.rahuKalamEnd
                        } : null}
                        yamaganda={panchang.yamagandaKalam}
                        gulika={panchang.gulikaKalam}
                        durMuhurta={panchang.durMuhurta}
                        timezone={timezone}
                    />

                    {/* Hora (Planetary Hour) */}
                    <HoraCard
                        currentHora={panchang.currentHora}
                        sunrise={panchang.sunrise}
                        sunset={panchang.sunset}
                    />
                </div>

                <div className="features-column">
                    {/* Upcoming Festivals */}
                    {monthData && (
                        <UpcomingFestivals
                            monthData={monthData}
                            selectedDate={date}
                        />
                    )}

                    {/* Disha Shoola - Direction Dosha */}
                    <ShoolaCompass vara={panchang.vara} />
                </div>
            </div>

            {/* Vedic Features - Tarabalam & Chandrashtama */}
            <div className="vedic-features-grid">
                {birthData ? (
                    <>
                        {/* Tarabalam - Nakshatra Strength */}
                        <TarabalamWheel
                            birthNakshatra={birthData.birthNakshatra}
                            currentNakshatra={panchang.nakshatra}
                        />

                        {/* Chandrashtama - Moon 8th House */}
                        {panchang.moonRashi && (
                            <ChandrashtamaAlert
                                birthRashi={birthData.birthRashi}
                                currentMoonRashi={panchang.moonRashi.index}
                            />
                        )}
                    </>
                ) : (
                    <div className="birth-data-prompt">
                        <div className="prompt-icon">🌙</div>
                        <p>Set your birth data to see personalized Tarabalam & Chandrashtama</p>
                        <button
                            className="set-birth-btn"
                            onClick={() => { setIsModalOpen(true); trackBirthDataModal('open'); }}
                        >
                            Set Birth Data
                        </button>
                    </div>
                )}

                {/* Settings button when birth data exists */}
                {birthData && (
                    <button
                        className="edit-birth-btn"
                        onClick={() => { setIsModalOpen(true); trackBirthDataModal('open'); }}
                        title="Edit birth data"
                    >
                        ⚙️ Edit Birth Data
                    </button>
                )}
            </div>

            {/* Planetary Positions - Full Width */}
            {panchang.planetaryPositions && (
                <PlanetaryPositions positions={panchang.planetaryPositions} />
            )}

            {/* Birth Data Modal */}
            <BirthDataModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); trackBirthDataModal('close'); }}
                onSave={(data) => setBirthData({ birthRashi: data.birthRashi, birthNakshatra: data.birthNakshatra })}
                initialData={null}
            />
        </div>
    );
};
