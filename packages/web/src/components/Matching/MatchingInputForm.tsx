import React, { useState } from 'react';
import { LocationSelector } from '../LocationSelector/LocationSelector';
import type { Location } from '../../types';
import type { Kundli } from '@ishubhamx/panchangam-js'; // Import core types/functions
import { getKundli } from '@ishubhamx/panchangam-js';
import { Observer } from 'astronomy-engine';
import './MatchingInputForm.css';

export interface ProfileData {
    name: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    location: Location;
}

interface MatchingInputFormProps {
    onCalculate: (boy: Kundli, girl: Kundli, boyProfile: ProfileData, girlProfile: ProfileData) => void;
}

const DEFAULT_LOCATION: Location = {
    name: 'New Delhi, India',
    lat: 28.6139,
    lon: 77.2090,
    elevation: 0,
    timezone: 'Asia/Kolkata'
};

const INITIAL_PROFILE: ProfileData = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: DEFAULT_LOCATION
};

export const MatchingInputForm: React.FC<MatchingInputFormProps> = ({ onCalculate }) => {
    const [boy, setBoy] = useState<ProfileData>({ ...INITIAL_PROFILE, name: 'Boy' });
    const [girl, setGirl] = useState<ProfileData>({ ...INITIAL_PROFILE, name: 'Girl' });
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            // Helper to generate Kundli from profile
            const generate = (p: ProfileData) => {
                const date = new Date(`${p.date}T${p.time}`);
                const observer = new Observer(p.location.lat, p.location.lon, p.location.elevation);
                return getKundli(date, observer);
            };

            const boyKundli = generate(boy);
            const girlKundli = generate(girl);

            onCalculate(boyKundli, girlKundli, boy, girl);
        } catch (e) {
            console.error(e);
            alert('Error calculating match. Please check details.');
        } finally {
            setLoading(false);
        }
    };

    const renderCard = (title: string, data: ProfileData, setData: React.Dispatch<React.SetStateAction<ProfileData>>, type: 'boy' | 'girl') => (
        <div className={`profile-card ${type}`}>
            <div className="card-header">
                <span className="icon">{type === 'boy' ? '♂️' : '♀️'}</span>
                <h2>{title}</h2>
            </div>

            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    placeholder="Enter Name"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={data.date}
                        onChange={e => setData({ ...data, date: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        value={data.time}
                        onChange={e => setData({ ...data, time: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Location</label>
                <div className="location-wrapper">
                    <LocationSelector
                        currentLocation={data.location}
                        onLocationChange={(loc) => setData({ ...data, location: loc })}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="input-container">
            <div className="cards-wrapper">
                {renderCard("Boy's Details", boy, setBoy, 'boy')}
                <div className="vs-badge">VS</div>
                {renderCard("Girl's Details", girl, setGirl, 'girl')}
            </div>

            <button className="calculate-btn" onClick={handleCalculate} disabled={loading}>
                {loading ? 'Calculating...' : 'Check Compatibility'}
            </button>
        </div>
    );
};
