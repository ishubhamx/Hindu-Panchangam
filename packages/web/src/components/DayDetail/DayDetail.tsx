import React from 'react';
import { tithiNames, nakshatraNames, yogaNames } from '@ishubhamx/panchangam-js';
import type { DayDetailProps } from '../../types';
import { SunriseTimeline } from './SunriseTimeline';
import { PanchangCard } from './PanchangCard';
import { InauspiciousTimings } from './InauspiciousTimings';
import { HoraCard } from './HoraCard';
import { UpcomingFestivals } from './UpcomingFestivals';
import { PlanetaryPositions } from './PlanetaryPositions';
import { MoonPhase } from '../MoonPhase';
import { MuhurtaTimeline } from '../MuhurtaTimeline';
import { formatTime } from '../../utils/colors';
import './DayDetail.css';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * DayDetail - Detailed view for a selected day
 * UX: Hero section, sunrise timeline, Panchang cards grid
 */
export const DayDetail: React.FC<DayDetailProps> = ({ date, panchang, timezone, monthData }) => {
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

    return (
        <div className="day-detail">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="date-display">
                        <div className="weekday">{weekday}</div>
                        <div className="date-main">
                            {month} {day}, {year}
                        </div>
                        {festivals.length > 0 && (
                            <div className="festivals-list">
                                {festivals.map((festival: string, i: number) => (
                                    <span key={i} className="festival-tag">{festival}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="moon-phase-container">
                        <MoonPhase tithi={panchang.tithi} paksha={panchang.paksha} />
                        <div className="tithi-display">{tithiName}</div>
                    </div>
                </div>

                <div className="samvat-info">
                    {panchang.samvat && (
                        <>
                            <span className="samvat-item">Vikram Samvat {panchang.samvat.vikram}</span>
                            <span className="samvat-separator">•</span>
                            <span className="samvat-item">Shaka Samvat {panchang.samvat.shaka}</span>
                        </>
                    )}
                </div>

                <div className="masa-paksha">
                    {panchang.masa && (
                        <span className="masa">{panchang.masa.name} {panchang.masa.isAdhika ? '(Adhika)' : ''}</span>
                    )}
                    {panchang.paksha && (
                        <>
                            <span className="separator">•</span>
                            <span className="paksha">{panchang.paksha} Paksha</span>
                        </>
                    )}
                </div>
            </div>

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

                {/* Muhurta Timeline - Auspicious Periods */}
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
                </div>
            </div>

            {/* Planetary Positions - Full Width */}
            {panchang.planetaryPositions && (
                <PlanetaryPositions positions={panchang.planetaryPositions} />
            )}
        </div>
    );
};
