/**
 * Centralized ephemeris computation and caching module.
 * Provides cached access to tropical and sidereal longitudes for Sun and Moon.
 */

import { Body, GeoVector, Ecliptic as EclipticFunc } from "astronomy-engine";

/**
 * Ephemeris data for a specific time point
 */
export interface EphemerisData {
    sunTrop: number;    // Tropical longitude of Sun
    moonTrop: number;   // Tropical longitude of Moon
    sunSid: number;     // Sidereal longitude of Sun (Lahiri ayanamsa) - placeholder for future use
    moonSid: number;    // Sidereal longitude of Moon (Lahiri ayanamsa) - placeholder for future use
}

/**
 * Simple LRU cache implementation for ephemeris data
 */
class EphemerisCache {
    private cache: Map<number, EphemerisData>;
    private maxSize: number;
    private computationCount: number;

    constructor(maxSize: number = 500) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.computationCount = 0;
    }

    /**
     * Get ephemeris data from cache or compute if not present
     */
    get(timestamp: number): EphemerisData {
        // Check cache first
        if (this.cache.has(timestamp)) {
            // Move to end (most recently used)
            const data = this.cache.get(timestamp)!;
            this.cache.delete(timestamp);
            this.cache.set(timestamp, data);
            return data;
        }

        // Compute fresh data
        this.computationCount++;
        const date = new Date(timestamp);
        
        const sunVector = GeoVector(Body.Sun, date, true);
        const moonVector = GeoVector(Body.Moon, date, true);
        
        const sunEcliptic = EclipticFunc(sunVector);
        const moonEcliptic = EclipticFunc(moonVector);
        
        const data: EphemerisData = {
            sunTrop: sunEcliptic.elon,
            moonTrop: moonEcliptic.elon,
            sunSid: sunEcliptic.elon,  // Placeholder - currently same as tropical
            moonSid: moonEcliptic.elon // Placeholder - currently same as tropical
        };

        // Add to cache
        this.cache.set(timestamp, data);

        // Evict oldest if cache is full
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        return data;
    }

    /**
     * Clear the cache and reset computation counter
     */
    clear(): void {
        this.cache.clear();
        this.computationCount = 0;
    }

    /**
     * Get the number of actual ephemeris computations performed
     */
    getComputationCount(): number {
        return this.computationCount;
    }

    /**
     * Reset the computation counter
     */
    resetComputationCount(): void {
        this.computationCount = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; maxSize: number; computations: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            computations: this.computationCount
        };
    }
}

// Global cache instance
const globalCache = new EphemerisCache(500);

/**
 * Get ephemeris data for a specific date/time.
 * This function uses an internal cache to avoid redundant calculations.
 * For better cache hit rates during binary search, timestamps are rounded
 * to the nearest second.
 * 
 * @param date - The date/time for which to get ephemeris data
 * @returns Object containing tropical and sidereal longitudes for Sun and Moon
 */
export function getEphemeris(date: Date): EphemerisData {
    // Round to nearest second for better cache hit rates during binary search
    // This is acceptable since binary search narrows down to ~1 second precision anyway
    const roundedTimestamp = Math.round(date.getTime() / 1000) * 1000;
    return globalCache.get(roundedTimestamp);
}

/**
 * Get the Sun's tropical longitude for a given date
 * @param date - The date for which to compute the longitude
 * @returns Sun's tropical longitude in degrees [0, 360)
 */
export function getSunTropicalLongitude(date: Date): number {
    return getEphemeris(date).sunTrop;
}

/**
 * Get the Moon's tropical longitude for a given date
 * @param date - The date for which to compute the longitude
 * @returns Moon's tropical longitude in degrees [0, 360)
 */
export function getMoonTropicalLongitude(date: Date): number {
    return getEphemeris(date).moonTrop;
}

/**
 * Get the Sun's sidereal longitude for a given date (placeholder - currently returns tropical)
 * @param date - The date for which to compute the longitude
 * @returns Sun's sidereal longitude in degrees [0, 360)
 */
export function getSunSiderealLongitude(date: Date): number {
    return getEphemeris(date).sunSid;
}

/**
 * Get the Moon's sidereal longitude for a given date (placeholder - currently returns tropical)
 * @param date - The date for which to compute the longitude
 * @returns Moon's sidereal longitude in degrees [0, 360)
 */
export function getMoonSiderealLongitude(date: Date): number {
    return getEphemeris(date).moonSid;
}

/**
 * Clear the ephemeris cache
 */
export function clearCache(): void {
    globalCache.clear();
}

/**
 * Get the number of actual ephemeris computations performed since last reset
 */
export function getComputationCount(): number {
    return globalCache.getComputationCount();
}

/**
 * Reset the computation counter
 */
export function resetComputationCount(): void {
    globalCache.resetComputationCount();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number; computations: number } {
    return globalCache.getStats();
}
