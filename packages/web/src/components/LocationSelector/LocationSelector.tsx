import React, { useState, useRef, useEffect } from 'react';
import type { Location } from '../../types';
import './LocationSelector.css';

interface LocationSelectorProps {
    currentLocation: Location;
    onLocationChange: (location: Location) => void;
}

const PRESET_LOCATIONS: Location[] = [
    { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090, elevation: 216, timezone: 'Asia/Kolkata' },
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, elevation: 10, timezone: 'Asia/Kolkata' },
    { name: 'Bangalore, India', lat: 12.9716, lon: 77.5946, elevation: 920, timezone: 'Asia/Kolkata' },
    { name: 'Chennai, India', lat: 13.0827, lon: 80.2707, elevation: 6, timezone: 'Asia/Kolkata' },
    { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639, elevation: 9, timezone: 'Asia/Kolkata' },
    { name: 'Hyderabad, India', lat: 17.3850, lon: 78.4867, elevation: 542, timezone: 'Asia/Kolkata' },
    { name: 'Varanasi, India', lat: 25.3176, lon: 82.9739, elevation: 80, timezone: 'Asia/Kolkata' },
    { name: 'Ujjain, India', lat: 23.1765, lon: 75.7885, elevation: 494, timezone: 'Asia/Kolkata' },
    { name: 'Puri, India', lat: 19.8135, lon: 85.8312, elevation: 3, timezone: 'Asia/Kolkata' },
    { name: 'Kathmandu, Nepal', lat: 27.7172, lon: 85.3240, elevation: 1400, timezone: 'Asia/Kathmandu' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, elevation: 15, timezone: 'Asia/Singapore' },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278, elevation: 11, timezone: 'Europe/London' },
    { name: 'New York, USA', lat: 40.7128, lon: -74.0060, elevation: 10, timezone: 'America/New_York' },
    { name: 'Los Angeles, USA', lat: 34.0522, lon: -118.2437, elevation: 71, timezone: 'America/Los_Angeles' },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, elevation: 58, timezone: 'Australia/Sydney' },
    { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, elevation: 5, timezone: 'Asia/Dubai' },
];

/**
 * LocationSelector - Dropdown for selecting location
 */
export const LocationSelector: React.FC<LocationSelectorProps> = ({
    currentLocation,
    onLocationChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredLocations = PRESET_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (location: Location) => {
        onLocationChange(location);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="location-selector" ref={dropdownRef}>
            <button
                className="location-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="location-icon">📍</span>
                <span className="location-name">{currentLocation?.name}</span>
                <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="location-dropdown">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                    </div>
                    <ul className="location-list">
                        {filteredLocations.map((location) => (
                            <li key={location.name}>
                                <button
                                    className={`location-option ${location.name === currentLocation.name ? 'selected' : ''}`}
                                    onClick={() => handleSelect(location)}
                                >
                                    <span className="option-name">{location.name}</span>
                                    <span className="option-coords">
                                        {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                                    </span>
                                </button>
                            </li>
                        ))}
                        {filteredLocations.length === 0 && (
                            <li className="no-results">No locations found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
