/**
 * BirthDataModal - Modal for entering birth data to personalize features
 * Calculates Birth Rashi and Nakshatra from DOB/time/place
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPanchangam, rashiNames, nakshatraNames, Observer } from '@ishubhamx/panchangam-js';
import { trackBirthDataModal } from '../../utils/analytics';
import './BirthDataModal.css';

interface BirthData {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
    birthRashi: number;
    birthNakshatra: number;
}

interface BirthDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BirthData) => void;
    initialData?: BirthData | null;
}

const STORAGE_KEY = 'panchangam_birth_data';

export const BirthDataModal: React.FC<BirthDataModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [date, setDate] = useState(initialData?.date || '');
    const [time, setTime] = useState(initialData?.time || '12:00');
    const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '28.6139');
    const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '77.2090');
    const [timezone, setTimezone] = useState(initialData?.timezone || 'Asia/Kolkata');
    const [locationName, setLocationName] = useState('New Delhi, India');

    const [calculatedRashi, setCalculatedRashi] = useState<number | null>(null);
    const [calculatedNakshatra, setCalculatedNakshatra] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Location search state
    const [locationQuery, setLocationQuery] = useState('');
    const [locationResults, setLocationResults] = useState<Array<{ name: string; lat: number; lon: number; timezone: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset form when modal opens with initial data
    useEffect(() => {
        if (initialData && isOpen) {
            setDate(initialData.date);
            setTime(initialData.time);
            setLatitude(initialData.latitude.toString());
            setLongitude(initialData.longitude.toString());
            setTimezone(initialData.timezone);
            setCalculatedRashi(initialData.birthRashi);
            setCalculatedNakshatra(initialData.birthNakshatra);
        }
    }, [initialData, isOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Search locations using Open-Meteo Geocoding API
    const searchLocations = async (query: string) => {
        if (query.length < 2) {
            setLocationResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?` +
                `name=${encodeURIComponent(query)}&count=8&language=en&format=json`
            );

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();

            if (!data.results) {
                setLocationResults([]);
                return;
            }

            const locations = data.results.map((result: { name: string; admin1?: string; country: string; latitude: number; longitude: number; timezone: string }) => ({
                name: result.admin1
                    ? `${result.name}, ${result.admin1}, ${result.country}`
                    : `${result.name}, ${result.country}`,
                lat: result.latitude,
                lon: result.longitude,
                timezone: result.timezone || 'UTC'
            }));

            setLocationResults(locations);
        } catch (error) {
            console.error('Location search error:', error);
            setLocationResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search handler
    const handleLocationSearch = (value: string) => {
        setLocationQuery(value);
        setLocationName(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchLocations(value);
        }, 400);
    };

    // Select a location from search results
    const selectLocation = (loc: { name: string; lat: number; lon: number; timezone: string }) => {
        setLocationName(loc.name);
        setLatitude(loc.lat.toString());
        setLongitude(loc.lon.toString());
        setTimezone(loc.timezone);
        setLocationQuery('');
        setLocationResults([]);
    };


    const calculateBirthChart = () => {
        if (!date || !time) {
            setError('Please enter date and time');
            return;
        }

        setIsCalculating(true);
        setError(null);
        trackBirthDataModal('calculate');

        try {
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);

            const birthDate = new Date(year, month - 1, day, hours, minutes);
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            // Get timezone offset
            const tzOffset = getTimezoneOffsetForZone(timezone, birthDate);

            // Create observer object for getPanchangam using the class
            const observer = new Observer(lat, lng, 0);
            const options = { timezoneOffset: tzOffset * 60 };  // Convert hours to minutes

            const panchang = getPanchangam(birthDate, observer, options);

            if (panchang.moonRashi) {
                setCalculatedRashi(panchang.moonRashi.index);
                setCalculatedNakshatra(panchang.nakshatra);
            } else {
                setError('Could not calculate Moon position');
            }
        } catch (err) {
            setError('Invalid date/time or location');
            console.error(typeof err === 'object' ? JSON.stringify(err) : err);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSave = () => {
        if (calculatedRashi === null || calculatedNakshatra === null) {
            setError('Please calculate first');
            return;
        }

        const birthData: BirthData = {
            date,
            time,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone,
            birthRashi: calculatedRashi,
            birthNakshatra: calculatedNakshatra,
        };

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(birthData));
        trackBirthDataModal('save');
        onSave(birthData);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content birth-data-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🌙 Birth Data</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        Enter your birth details to personalize Tarabalam and Chandrashtama calculations.
                    </p>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Birth Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="form-group">
                            <label>Birth Time</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Location Search or Manual Entry */}
                    <div className="form-group location-search-group">
                        <label>Birth Place</label>
                        <div className="location-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search city..."
                                value={locationQuery || locationName}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                                className="location-search-input"
                            />
                            {isSearching && <span className="search-spinner">🔍</span>}
                        </div>

                        {/* Search Results Dropdown */}
                        {locationResults.length > 0 && (
                            <ul className="location-results">
                                {locationResults.map((loc, idx) => (
                                    <li key={idx}>
                                        <button
                                            type="button"
                                            className="location-result-item"
                                            onClick={() => selectLocation(loc)}
                                        >
                                            <span className="loc-name">{loc.name}</span>
                                            <span className="loc-coords">{loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Toggle Manual Entry */}
                        <button
                            type="button"
                            className="toggle-manual-btn"
                            onClick={() => setShowManualEntry(!showManualEntry)}
                        >
                            {showManualEntry ? '▲ Hide coordinates' : '▼ Enter coordinates manually'}
                        </button>
                    </div>

                    {/* Manual Lat/Lng Entry (collapsible) */}
                    {showManualEntry && (
                        <div className="form-row manual-coords">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="28.6139"
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="77.2090"
                                />
                            </div>
                        </div>
                    )}

                    {/* Show selected coordinates */}
                    {!showManualEntry && (
                        <div className="selected-coords">
                            📍 {locationName} ({parseFloat(latitude).toFixed(4)}°, {parseFloat(longitude).toFixed(4)}°)
                        </div>
                    )}

                    <button
                        className="calculate-btn"
                        onClick={calculateBirthChart}
                        disabled={isCalculating}
                    >
                        {isCalculating ? 'Calculating...' : '🔮 Calculate Birth Chart'}
                    </button>

                    {error && <div className="error-message">{error}</div>}

                    {calculatedRashi !== null && calculatedNakshatra !== null && (
                        <div className="calculation-result">
                            <div className="result-item">
                                <span className="result-label">Birth Rashi (Moon Sign)</span>
                                <span className="result-value">{rashiNames[calculatedRashi]}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">Birth Nakshatra</span>
                                <span className="result-value">{nakshatraNames[calculatedNakshatra]}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={calculatedRashi === null}
                    >
                        Save Birth Data
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// Helper to get timezone offset
function getTimezoneOffsetForZone(tz: string, date: Date): number {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset'
        });
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find(p => p.type === 'timeZoneName');
        if (offsetPart) {
            const match = offsetPart.value.match(/GMT([+-])(\d+):?(\d*)/);
            if (match) {
                const sign = match[1] === '+' ? 1 : -1;
                const hours = parseInt(match[2]) || 0;
                const minutes = parseInt(match[3]) || 0;
                return sign * (hours + minutes / 60);
            }
        }
    } catch (e) {
        console.error('Timezone error:', e);
    }
    return 5.5; // Default to IST
}

// Helper to load saved birth data
export function loadBirthData(): BirthData | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading birth data:', e);
    }
    return null;
}

export default BirthDataModal;
