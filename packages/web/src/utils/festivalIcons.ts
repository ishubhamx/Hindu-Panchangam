/**
 * Festival Icons Mapping & Utility
 */

export const FESTIVAL_ICONS: Record<string, string> = {
    // Major Festivals
    'Diwali': '🪔',
    'Deepavali': '🪔',
    'Holi': '🎨',
    'Holika Dahan': '🔥',
    'Dussehra': '🏹',
    'Vijaya Dashami': '🏹',
    'Navaratri': '🔱',
    'Navratri': '🔱',
    'Chaitra Navratri': '🔱',
    'Ashwina Navaratri': '🔱',
    'Durga Puja': '🦁',
    'Ganesh Chaturthi': '🐘',
    'Raksha Bandhan': '🎀',
    'Janmashtami': '🍯',
    'Krishna Janmashtami': '🍯',
    'Rama Navami': '🏹',
    'Ram Navami': '🏹',
    'Maha Shivaratri': '🔱',
    'Masik Shivaratri': '🔱',
    'Shivaratri': '🔱',
    'Pongal': '🍚',
    'Makar Sankranti': '🪁',
    'Ugadi': '🥭',
    'Gudi Padwa': '🚩',
    'Baisakhi': '🌾',
    'Onam': '🌺',
    'Rath Yatra': '🛕',
    'Jagannath Rathyatra': '🛕',
    'Guru Purnima': '🧘',
    'Buddha Purnima': '☸️',
    'Hanuman Jayanti': '💪',
    'Karwa Chauth': '🌕',
    'Karva Chauth': '🌕',
    'Teej': '💃',
    'Haritalika Teej': '💃',
    'Chhath Puja': '🌅',
    'Vasant Panchami': '📚',
    'Saraswati Puja': '📚',
    'Akshaya Tritiya': '👑',
    'Dhanteras': '💰',
    'Bhai Dooj': '👫',
    'Nag Panchami': '🐍',

    // Recurring Monthly
    'Sankashti Chaturthi': '🐘',
    'Vinayaka Chaturthi': '🐘',
    'Purnima': '🌕',
    'Amavasya': '🌑',
    'Pradosham': '🐮',
    'Masik Durgashtami': '⚔️',

    // Navratri Days
    'Ghatasthapana': '🏺',
    'Navratri Day': '🔱',
    'Maha Saptami': '🙏',
    'Durga Maha Ashtami': '⚔️',
    'Maha Navami': '📜',
    'Saraswati Avahan': '📚',
    'Saraswati Visarjan': '📚',

    // Ekadashi
    'Ekadashi': '⚡',
    'Papankusha Ekadashi': '⚡',
    'Devshayani Ekadashi': '⚡',
    'Devuthani Ekadashi': '⚡',
    'Nirjala Ekadashi': '⚡',
    'Kamika Ekadashi': '⚡',
    'Putrada Ekadashi': '⚡',
    'Aja Ekadashi': '⚡',
    'Indira Ekadashi': '⚡',
    'Parama Ekadashi': '⚡',
    'Pausha Putrada Ekadashi': '⚡',
    'Shattila Ekadashi': '⚡',
    'Jaya Ekadashi': '⚡',
    'Vijaya Ekadashi': '⚡',
    'Amalaki Ekadashi': '⚡',
    'Papmochani Ekadashi': '⚡',
    'Varuthini Ekadashi': '⚡',
    'Mohini Ekadashi': '⚡',
    'Apara Ekadashi': '⚡',
    'Yogini Ekadashi': '⚡',
    'Shayani Ekadashi': '⚡',
    'Parsva Ekadashi': '⚡',
    'Padmini Ekadashi': '⚡',
    'Rama Ekadashi': '⚡',

    // Special days
    'Mahalaya Amavasya': '🕯️',
    'Pitru Paksha': '🕯️',
    'Vat Savitri Vrat': '🌳',
    'Ratha Saptami': '🌞',
    'Skanda Sashti': '🛡️',
    'Anant Chaturdashi': '🪷',
    'Govardhan Puja': '⛰️',
    'Tulsi Vivah': '🌿',
    'Maghi': '🌾',
    'Lohri': '🔥',

    // Jayantis
    'Jayanti': '🎂',
    'Parshurama Jayanti': '🪓',
    'Narasimha Jayanti': '🦁',
    'Vamana Jayanti': '👣',
    'Ganga Dussehra': '🌊',
    'Gandhi Jayanti': '👓',
    'Mahavir Jayanti': '☸️',

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
