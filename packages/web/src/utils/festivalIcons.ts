/**
 * Festival Icons Mapping & Utility
 */

export const FESTIVAL_ICONS: Record<string, string> = {
    // Major Festivals
    'Diwali': '🪔',
    'Deepavali': '🪔',
    'Holi': '🎨',
    'Dussehra': '🏹',
    'Vijaya Dashami': '🏹',
    'Navaratri': '🔱',
    'Durga Puja': '🦁',
    'Ganesh Chaturthi': '🐘',
    'Raksha Bandhan': '🎀',
    'Janmashtami': '🍯',
    'Krishna Janmashtami': '🍯',
    'Rama Navami': '🏹',
    'Ram Navami': '🏹',
    'Maha Shivaratri': '🔱',
    'Shivaratri': '🔱',
    'Pongal': '🍚',
    'Makar Sankranti': '🪁',
    'Ugadi': '🥭',
    'Gudi Padwa': '🚩',
    'Baisakhi': '🌾',
    'Onam': '🌺',
    'Rath Yatra': '🛒', // Approximation for chariot
    'Jagannath Rathyatra': '🛒',
    'Guru Purnima': '🧘',
    'Buddha Purnima': '☸️',
    'Hanuman Jayanti': '💪',
    'Karwa Chauth': '🌕',
    'Teej': '💃',
    'Chhath Puja': '🌅',
    'Vasant Panchami': '📚',
    'Saraswati Puja': '📚',
    'Akshaya Tritiya': '👑',
    'Dhanteras': '💰',
    'Bhai Dooj': '👫',
    'Nag Panchami': '🐍',

    // Tithi-based Observances
    'Ekadashi': '⚡', // Fasting/Energy
    'Pradosham': '🐮', // Nandi/Shiva
    'Purnima': '🌕',
    'Amavasya': '🌑',
    'Sankashti': '🐘',
    'Chaturthi': '🐘',
    'Sashti': '🛡️', // Murugan
    'Karthigai': '🔥',
    'Rohini': '🌟',
    'Shivratri': '🔱',
    'Ashtami': '⚔️', // Durga
    'Navami': '📜',

    // Jayantis
    'Jayanti': '🎂',
    'Gandhi Jayanti': '👓',

    // Default
    'Festival': '🎉'
};

/**
 * Get icon for a festival name
 * Scans keys for partial matches if exact match not found
 */
export function getFestivalIcon(festivalName: string): string {
    const nameLower = festivalName.toLowerCase();

    // 1. Exact match
    if (FESTIVAL_ICONS[festivalName]) {
        return FESTIVAL_ICONS[festivalName];
    }

    // 2. Partial match (Iterate through keys)
    for (const [key, icon] of Object.entries(FESTIVAL_ICONS)) {
        if (nameLower.includes(key.toLowerCase())) {
            return icon;
        }
    }

    // 3. Fallback based on keywords
    if (nameLower.includes('jayanti')) return '🎂';
    if (nameLower.includes('vrat')) return '🙏';
    if (nameLower.includes('puja')) return '🕉️';
    if (nameLower.includes('aradhana')) return '🙏';
    if (nameLower.includes('utsvam')) return '🎊';

    return '🎉';
}
