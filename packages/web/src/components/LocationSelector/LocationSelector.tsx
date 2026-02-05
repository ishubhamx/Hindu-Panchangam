import React, { useState, useRef, useEffect } from 'react';
import type { Location } from '../../types';
import './LocationSelector.css';

interface LocationSelectorProps {
    currentLocation: Location;
    onLocationChange: (location: Location) => void;
}

interface OpenMeteoResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    country: string;
    country_code: string;
    admin1?: string; // State/Province
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
 * LocationSelector - Dropdown for selecting location with Open-Meteo Geocoding API
 */
export const LocationSelector: React.FC<LocationSelectorProps> = ({
    currentLocation,
    onLocationChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Location[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Search Open-Meteo Geocoding API
    const searchLocations = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?` +
                `name=${encodeURIComponent(query)}&count=10&language=en&format=json`
            );

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            
            if (!data.results) {
                setSearchResults([]);
                return;
            }

            const locations: Location[] = data.results.map((result: OpenMeteoResult) => {
                // Format display name with country
                const displayName = result.admin1 
                    ? `${result.name}, ${result.admin1}, ${result.country}`
                    : `${result.name}, ${result.country}`;

                return {
                    name: displayName,
                    lat: result.latitude,
                    lon: result.longitude,
                    elevation: result.elevation || 0,
                    timezone: result.timezone || 'UTC'
                };
            });

            setSearchResults(locations);
        } catch (error) {
            console.error('Location search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search (Open-Meteo allows higher rate limits)
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout (500ms debounce - Open-Meteo has generous limits)
        searchTimeoutRef.current = setTimeout(() => {
            searchLocations(value);
        }, 500);
    };

    const filteredPresets = PRESET_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayLocations = searchQuery.length >= 2 ? searchResults : filteredPresets;

    const handleSelect = (location: Location) => {
        onLocationChange(location);
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
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
                            placeholder="Search locations worldwide..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                        {isSearching && <span className="search-loader">🔍</span>}
                    </div>
                    
                    {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                        <div className="search-hint">No results found. Try a different search.</div>
                    )}
                    
                    {searchQuery.length < 2 && (
                        <div className="search-hint">Popular locations</div>
                    )}
                    
                    <ul className="location-list">
                        {displayLocations.map((location, index) => (
                            <li key={`${location.name}-${index}`}>
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
                        {displayLocations.length === 0 && !isSearching && searchQuery.length < 2 && (
                            <li className="no-results">Start typing to search locations...</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
