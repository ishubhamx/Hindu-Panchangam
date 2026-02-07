/**
 * Tithi Utility - Symbols and Moon Phases
 */

// Sanskrit/Vedic Numbers for Tithis (Prathama to Purnima/Amavasya)
export const TITHI_SYMBOLS = [
    '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५'
];

/**
 * Get Moon Phase Icon based on Tithi Index (1-30)
 * Note: Index 1-30 corresponds to:
 * 1-15: Shukla Paksha (Prathama to Purnima)
 * 16-30: Krishna Paksha (Prathama to Amavasya)
 */
export const getMoonIcon = (tithi: number): string => {
    // Normalize to 0-29 index if passed as 1-30
    // But typically tithi from calculations is 1-30.
    // Let's assume standard input 1-30.

    if (tithi < 1 || tithi > 30) return '🌑';

    // Shukla Paksha (Waxing)
    if (tithi <= 15) {
        if (tithi === 15) return '🌕'; // Purnima
        if (tithi <= 2) return '🌒';
        if (tithi <= 6) return '🌓';
        if (tithi <= 10) return '🌔';
        if (tithi <= 14) return '🌖'; // Almost full
        return '🌕';
    }
    // Krishna Paksha (Waning)
    else {
        if (tithi === 30) return '🌑'; // Amavasya
        if (tithi <= 17) return '🌖';
        if (tithi <= 21) return '🌗';
        if (tithi <= 25) return '🌘';
        return '🌑';
    }
};

/**
 * Get simple symbol/number for Tithi
 */
export const getTithiSymbol = (tithi: number): string => {
    const idx = (tithi - 1) % 15;
    return TITHI_SYMBOLS[idx] || '';
};

/**
 * Get Paksha Icon
 */
export const getPakshaIcon = (paksha: string): string => {
    return paksha === 'Shukla' ? '⚪' : '⚫';
};
