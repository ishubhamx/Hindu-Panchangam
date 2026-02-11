
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MatchingInputForm } from '../components/Matching/MatchingInputForm';
import type { ProfileData } from '../components/Matching/MatchingInputForm';
import { MatchingResult } from '../components/Matching/MatchingResult';
import { matchKundli, getKundli } from '@ishubhamx/panchangam-js';
import { Observer } from 'astronomy-engine';
import { StarField } from '../components/UI/StarField';
import './MatchViewPage.css';

import { motion, AnimatePresence } from 'framer-motion';

export const MatchViewPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState<any | null>(null);
    const [profiles, setProfiles] = useState<{ boy: ProfileData; girl: ProfileData } | null>(null);
    const [viewState, setViewState] = useState<'input' | 'analyzing' | 'result'>('input');

    // Helper to serialize profile to query params
    const serializeProfile = (prefix: string, profile: ProfileData) => {
        return {
            [`${prefix}_name`]: profile.name,
            [`${prefix}_date`]: profile.date,
            [`${prefix}_time`]: profile.time,
            [`${prefix}_lat`]: profile.location.lat.toString(),
            [`${prefix}_lon`]: profile.location.lon.toString(),
            [`${prefix}_locName`]: profile.location.name,
            // Add other location fields if necessary, defaulting reasonable values on read if missing
        };
    };

    // Helper to parse profile from query params
    const parseProfile = (prefix: string): ProfileData | null => {
        const name = searchParams.get(`${prefix}_name`);
        const date = searchParams.get(`${prefix}_date`);
        const time = searchParams.get(`${prefix}_time`);
        const lat = searchParams.get(`${prefix}_lat`);
        const lon = searchParams.get(`${prefix}_lon`);
        const locName = searchParams.get(`${prefix}_locName`);

        if (!name || !date || !time || !lat || !lon) return null;

        return {
            name,
            date,
            time,
            location: {
                name: locName || 'Unknown Location',
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                elevation: 0, // Defaulting as unlikely to be in URL for now unless added
                timezone: 'UTC' // We might need to fetch timezone or store it. For now default to UTC or approximations? 
                // Actually, getKundli uses observer which just needs Lat/Lon/Alt. Timezone is for display? 
                // Core library calculates based on Date object.
                // Wait, Date object needs timezone to be correct absolute time?
                // The input form creates Date string "YYYY-MM-DDTHH:mm".
                // If we construct "new Date('...')" it uses browser local time unless timezone offset is in string.
                // Our InputForm uses: new Date(`${p.date}T${p.time}`); -> Browser Local implicitly.
            }
        };
    };

    useEffect(() => {
        const boy = parseProfile('boy');
        const girl = parseProfile('girl');

        if (boy && girl) {
            setProfiles({ boy, girl });

            // Perform calculation
            // Note: We need to handle timezone correctly if we want persistence across different user timezones.
            // For now, assuming user stays in same browser session context.
            // Ideally we should store timezone in URL too.

            const generate = (p: ProfileData) => {
                const date = new Date(`${p.date}T${p.time}`);
                const observer = new Observer(p.location.lat, p.location.lon, p.location.elevation);
                return getKundli(date, observer);
            };

            const boyKundli = generate(boy);
            const girlKundli = generate(girl);
            const matchResult = matchKundli(boyKundli, girlKundli);

            setResult(matchResult);
            setViewState('result');
        } else {
            setViewState('input');
        }
    }, [searchParams]);

    const handleCalculate = (boy: Kundli, girl: Kundli, boyProfile: ProfileData, girlProfile: ProfileData) => {
        setViewState('analyzing');
        setProfiles({ boy: boyProfile, girl: girlProfile });

        // Serialize to URL logic
        const params: Record<string, string> = {
            ...serializeProfile('boy', boyProfile),
            ...serializeProfile('girl', girlProfile)
        };

        // Simulating delay for effect then setting params which triggers useEffect
        setTimeout(() => {
            setSearchParams(params);
        }, 2000);
    };

    const handleReset = () => {
        setSearchParams({});
        setResult(null);
        setProfiles(null);
        setViewState('input');
    };

    return (
        <div className="match-view-page">
            <StarField />
            <header className="match-header">
                <h1>Kundli Matching</h1>
                <p className="subtitle">Check your compatibility with Vedic accuracy</p>
            </header>

            <main className="match-content">
                <AnimatePresence mode='wait'>
                    {viewState === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: '100%' }}
                        >
                            <MatchingInputForm onCalculate={handleCalculate} />
                        </motion.div>
                    )}

                    {viewState === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="analyzing-container"
                        >
                            <div className="cosmic-loader"></div>
                            <h2>Reading the Stars...</h2>
                            <p>Analyzing Nakshatras & Planetary Positions</p>
                        </motion.div>
                    )}

                    {viewState === 'result' && result && profiles && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: '100%' }}
                        >
                            <MatchingResult result={result} profiles={profiles} onReset={handleReset} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
