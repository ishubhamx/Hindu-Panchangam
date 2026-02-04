import React from 'react';
import { LocationSelector } from '../LocationSelector';
import { useTheme } from '../../context/ThemeContext';
import type { Location } from '../../types';
import './Header.css';

interface HeaderProps {
    onTodayClick: () => void;
    location: Location;
    onLocationChange: (location: Location) => void;
}

/**
 * Header - App navigation and controls
 * UX: Clean header with branding, location selector, today button
 */
export const Header: React.FC<HeaderProps> = ({ onTodayClick, location, onLocationChange }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="logo-section">
                    <div className="logo-icon">🪔</div>
                    <div className="logo-text">
                        <h1>Hindu Panchang</h1>
                        <p className="tagline">Vedic Calendar • Astronomical Calculations</p>
                    </div>
                </div>

                <div className="header-actions">
                    <LocationSelector
                        currentLocation={location}
                        onLocationChange={onLocationChange}
                    />
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="today-button" onClick={onTodayClick}>
                        <span className="today-icon">📅</span>
                        <span className="today-text">Today</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
