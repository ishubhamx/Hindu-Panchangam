/**
 * Festival Category Colors & Labels
 * Maps festival categories to visual styling
 */

const CATEGORY_COLORS: Record<string, string> = {
    major:     '#ffc670',  // Saffron gold
    minor:     '#a78bfa',  // Soft purple
    ekadashi:  '#4ade80',  // Sacred green
    pradosham: '#c084fc',  // Twilight purple
    vrat:      '#f472b6',  // Rose pink
    jayanti:   '#60a5fa',  // Sky blue
    solar:     '#fb923c',  // Sun orange
};

const CATEGORY_LABELS: Record<string, string> = {
    major:     'Major Festival',
    minor:     'Observance',
    ekadashi:  'Ekadashi',
    pradosham: 'Pradosham',
    vrat:      'Vrat',
    jayanti:   'Jayanti',
    solar:     'Solar Festival',
};

const CATEGORY_ICONS: Record<string, string> = {
    major:     '🪔',
    minor:     '🔱',
    ekadashi:  '⚡',
    pradosham: '🐮',
    vrat:      '🙏',
    jayanti:   '🎂',
    solar:     '☀️',
};

/** Returns hex color for a festival category */
export function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.minor;
}

/** Returns human-readable label for a festival category */
export function getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] || 'Festival';
}

/** Returns emoji icon for a festival category */
export function getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] || '🎉';
}

/**
 * Returns a lighter, transparent version of the category color
 * Useful for backgrounds
 */
export function getCategoryBgColor(category: string): string {
    const hex = getCategoryColor(category);
    return `${hex}18`; // 18 = ~10% opacity in hex
}

/**
 * Returns a medium-opacity border color for the category
 */
export function getCategoryBorderColor(category: string): string {
    const hex = getCategoryColor(category);
    return `${hex}40`; // 40 = ~25% opacity in hex
}
