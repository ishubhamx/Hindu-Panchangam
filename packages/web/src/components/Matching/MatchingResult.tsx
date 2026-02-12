import React, { useEffect, useState } from 'react';
import type { MatchResult } from '@ishubhamx/panchangam-js';
import type { ProfileData } from './MatchingInputForm';
import './MatchingResult.css';

interface MatchingResultProps {
    result: MatchResult;
    profiles: { boy: ProfileData; girl: ProfileData };
    onReset: () => void;
}

export const MatchingResult: React.FC<MatchingResultProps> = ({ result, profiles, onReset }) => {
    const { ashtakoot, dosha, verdict } = result;
    const [animatedScore, setAnimatedScore] = useState(0);

    if (!profiles || !profiles.boy || !profiles.girl) {
        return null;
    }

    // Simple animation for the score
    useEffect(() => {
        const target = ashtakoot.totalScore;
        const duration = 1500;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setAnimatedScore(target);
                clearInterval(timer);
            } else {
                setAnimatedScore(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [ashtakoot.totalScore]);

    // Calculate stroke dashoffset for the SVG circle (circumference approx 283 for r=45)
    // 2 * PI * 45 ≈ 282.7
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(animatedScore / 36, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    const getScoreColor = (score: number) => {
        if (score < 18) return 'var(--color-error, #EF4444)';
        if (score < 25) return 'var(--color-warning, #F59E0B)';
        return 'var(--color-success, #10B981)';
    };

    return (
        <div className="result-container">
            <div className="result-hero">
                <div className="gauge-wrapper">
                    <svg width="200" height="200" viewBox="0 0 120 120" className="gauge-svg">
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="var(--glass-border, rgba(255,255,255,0.2))"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={getScoreColor(animatedScore)}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                        />
                    </svg>
                    <div className="score-display">
                        <span className="current-score">
                            {Number.isInteger(animatedScore) ? animatedScore : animatedScore.toFixed(1)}
                        </span>
                        <span className="total-score">/ 36</span>
                    </div>
                </div>

                <div className="verdict-container">
                    <h2 className="verdict-title" style={{ color: getScoreColor(ashtakoot.totalScore) }}>
                        {verdict.split('-')[0]}
                    </h2>
                    <p className="verdict-desc">{verdict.split('-')[1] || 'Overall Compatibility'}</p>
                </div>
            </div>

            <div className="dosha-section cards-row">
                <div className={`dosha-card ${dosha.boy.hasDosha ? 'bad' : 'good'}`}>
                    <div className="card-icon">{dosha.boy.hasDosha ? '⚠️' : '✅'}</div>
                    <div className="card-content">
                        <h3>{profiles.boy.name}</h3>
                        <p className="profile-meta">{profiles.boy.date} • {profiles.boy.time}</p>
                        <p className="dosha-status">{dosha.boy.hasDosha ? 'Manglik' : 'Non-Manglik'}</p>
                        <small>{dosha.boy.description}</small>
                    </div>
                </div>
                <div className={`dosha-card ${dosha.girl.hasDosha ? 'bad' : 'good'}`}>
                    <div className="card-icon">{dosha.girl.hasDosha ? '⚠️' : '✅'}</div>
                    <div className="card-content">
                        <h3>{profiles.girl.name}</h3>
                        <p className="profile-meta">{profiles.girl.date} • {profiles.girl.time}</p>
                        <p className="dosha-status">{dosha.girl.hasDosha ? 'Manglik' : 'Non-Manglik'}</p>
                        <small>{dosha.girl.description}</small>
                    </div>
                </div>
            </div>

            <div className="koota-grid">
                {ashtakoot.kootas.map((k, i) => (
                    <div key={i} className="koota-card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="koota-top">
                            <h4>{k.name}</h4>
                            <span className={`pill ${k.score === k.maxScore ? 'full' : k.score === 0 ? 'zero' : 'mid'}`}>
                                {k.score}/{k.maxScore}
                            </span>
                        </div>
                        <div className="koota-area">{k.area}</div>
                        <p className="koota-desc">{k.description}</p>
                    </div>
                ))}
            </div>

            <button className="calculate-btn" onClick={onReset} style={{ marginTop: '2rem' }}>
                Check Another Match
            </button>
        </div>
    );
};
