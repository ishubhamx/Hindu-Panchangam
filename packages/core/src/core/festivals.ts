
import { masaNames } from './constants';

export const EKADASHI_NAMES: { [key: string]: string } = {
    // Chaitra (0)
    "0-Shukla": "Kamada Ekadashi",
    "0-Krishna": "Varuthini Ekadashi",

    // Vaishakha (1)
    "1-Shukla": "Mohini Ekadashi",
    "1-Krishna": "Apara Ekadashi",

    // Jyeshtha (2)
    "2-Shukla": "Nirjala Ekadashi",
    "2-Krishna": "Yogini Ekadashi",

    // Ashadha (3)
    "3-Shukla": "Devshayani Ekadashi",
    "3-Krishna": "Kamika Ekadashi",

    // Shravana (4)
    "4-Shukla": "Shravana Putrada Ekadashi",
    "4-Krishna": "Aja Ekadashi",

    // Bhadrapada (5)
    "5-Shukla": "Parsva Ekadashi",
    "5-Krishna": "Indira Ekadashi",

    // Ashwina (6)
    "6-Shukla": "Papankusha Ekadashi",
    "6-Krishna": "Rama Ekadashi",

    // Kartika (7)
    "7-Shukla": "Devutthana Ekadashi",
    "7-Krishna": "Utpanna Ekadashi",

    // Margashirsha (8)
    "8-Shukla": "Mokshada Ekadashi", // Vaikuntha Ekadashi
    "8-Krishna": "Saphala Ekadashi",

    // Pausha (9)
    "9-Shukla": "Pausha Putrada Ekadashi",
    "9-Krishna": "Shattila Ekadashi",

    // Magha (10)
    "10-Shukla": "Jaya Ekadashi",
    "10-Krishna": "Vijaya Ekadashi",

    // Phalguna (11)
    "11-Shukla": "Amalaki Ekadashi",
    "11-Krishna": "Papmochani Ekadashi",
};

export function getEkadashiName(masaIndex: number, paksha: string): string {
    const key = `${masaIndex}-${paksha}`;
    return EKADASHI_NAMES[key] || `${masaNames[masaIndex]} ${paksha} Ekadashi`;
}

export function getFestivals(masaIndex: number, isAdhika: boolean, paksha: string, tithiIndex: number, vara?: number): string[] {
    const festivals: string[] = [];

    if (isAdhika) {
        // Usually festivals are not celebrated in Adhika Masa (except maybe Adhika Masa specific ones)
        // For now, adhering to main festivals only.
        return festivals;
    }

    // Tithi Indices: 
    // 1..15 are Shukla (if Paksha is Shukla) or Krishna (if Paksha is Krishna)?
    // Note: getTithi in calculations.ts returns 1..30.
    // 1..15 = Shukla
    // 16..30 = Krishna
    // My previous logic in calculations.ts assumed getTithi returns 1 based on Sun/Moon angle.
    // 0-12 deg = Tithi 1. 0-180 deg = 1-15 (Shukla). 180-360 deg = 16-30 (Krishna).

    // However, the `paksha` argument passed here is derived from tithi.
    // If tithiIndex is 1..15, paksha is Shukla.
    // If tithiIndex is 16..30, paksha is Krishna.

    // We need 'Lunar Day Number' within Paksha for some comparisons (Prathama=1, etc.)
    // But `tithiIndex` is absolute 1-30.

    // 1. Ugadi / Gudi Padwa: Chaitra (0) Shukla Prathama (1)
    if (masaIndex === 0 && tithiIndex === 1) {
        festivals.push("Ugadi / Gudi Padwa (New Year)");
    }

    // 2. Rama Navami: Chaitra (0) Shukla Navami (9)
    if (masaIndex === 0 && tithiIndex === 9) {
        festivals.push("Rama Navami");
    }

    // 3. Akshaya Tritiya: Vaishakha (1) Shukla Tritiya (3)
    if (masaIndex === 1 && tithiIndex === 3) {
        festivals.push("Akshaya Tritiya");
        festivals.push("Parashurama Jayanti");
    }

    // Ganga Saptami: Vaishakha (1) Shukla Saptami (7)
    if (masaIndex === 1 && tithiIndex === 7) {
        festivals.push("Ganga Saptami");
    }

    // Sita Navami: Vaishakha (1) Shukla Navami (9)
    if (masaIndex === 1 && tithiIndex === 9) {
        festivals.push("Sita Navami");
    }

    // Narada Jayanti: Vaishakha (1) Krishna Prathama (16)
    // (Jyeshtha Krishna 1 in Purnimanta)
    if (masaIndex === 1 && tithiIndex === 16) {
        festivals.push("Narada Jayanti");
    }

    // 4. Guru Purnima: Ashadha (3) Purnima (15)
    if (masaIndex === 3 && tithiIndex === 15) {
        festivals.push("Guru Purnima");
    }

    // --- Jyeshtha Festivals ---

    // Vat Savitri Vrat (Amavasya): Jyeshtha (2) Amavasya (30)
    // Also Shani Jayanti
    if (masaIndex === 2 && tithiIndex === 30) {
        festivals.push("Vat Savitri Vrat (Amavasya)");
        festivals.push("Shani Jayanti");
    }

    // Mahesh Navami: Jyeshtha (2) Shukla Navami (9)
    if (masaIndex === 2 && tithiIndex === 9) {
        festivals.push("Mahesh Navami");
    }

    // Ganga Dussehra: Jyeshtha (2) Shukla Dashami (10)
    if (masaIndex === 2 && tithiIndex === 10) {
        festivals.push("Ganga Dussehra");
    }

    // Vat Purnima Vrat: Jyeshtha (2) Purnima (15)
    if (masaIndex === 2 && tithiIndex === 15) {
        festivals.push("Vat Purnima Vrat");
    }

    // 5. Raksha Bandhan: Shravana (4) Purnima (15)
    if (masaIndex === 4 && tithiIndex === 15) {
        festivals.push("Raksha Bandhan");
    }

    // 6. Krishna Janmashtami: Shravana (4) Krishna Ashtami (23)
    // Krishna Paksha starts at 16. Ashtami is 8th day. 15+8 = 23.
    if (masaIndex === 4 && tithiIndex === 23) {
        festivals.push("Krishna Janmashtami");
    }

    // 7. Ganesh Chaturthi: Bhadrapada (5) Shukla Chaturthi (4)
    if (masaIndex === 5 && tithiIndex === 4) {
        festivals.push("Ganesh Chaturthi");
    }

    // 8. Navaratri Start: Ashwina (6) Shukla Prathama (1)
    if (masaIndex === 6 && tithiIndex === 1) {
        festivals.push("Navaratri Ghatasthapana");
    }

    // 9. Vijaya Dashami: Ashwina (6) Shukla Dashami (10)
    if (masaIndex === 6 && tithiIndex === 10) {
        festivals.push("Vijaya Dashami (Dussehra)");
    }

    // 10. Diwali (Lakshmi Puja): Ashwina (6) Amavasya (30)
    // Amavasya is Tithi 30.
    if (masaIndex === 6 && tithiIndex === 30) {
        festivals.push("Diwali (Lakshmi Puja)");
    }

    // 11. Bali Pratipada: Kartika (7) Shukla Prathama (1)
    if (masaIndex === 7 && tithiIndex === 1) {
        festivals.push("Bali Pratipada");
    }

    // 12. Maha Shivaratri: Magha (10) Krishna Chaturdashi (29)
    // Krishna Chaturdashi is 14th day of dark phase. 15+14 = 29.
    if (masaIndex === 10 && tithiIndex === 29) {
        festivals.push("Maha Shivaratri");
    }

    // 13. Holi: Phalguna (11) Purnima (15)
    if (masaIndex === 11 && tithiIndex === 15) {
        festivals.push("Holi / Holika Dahan");
    }

    // --- North Indian / Purnimanta Chaitra Festivals (Fall in Amanta Phalguna Krishna) ---

    // Ranga Panchami: Phalguna (11) Krishna Panchami (20)
    if (masaIndex === 11 && tithiIndex === 20) {
        festivals.push("Ranga Panchami");
    }

    // Sheetala Ashtami: Phalguna (11) Krishna Ashtami (23)
    if (masaIndex === 11 && tithiIndex === 23) {
        festivals.push("Sheetala Ashtami");
    }

    // --- Chaitra Shukla Festivals ---

    // Chaitra Navratri Ghatasthapana: Chaitra (0) Shukla Prathama (1)
    if (masaIndex === 0 && tithiIndex === 1) {
        festivals.push("Chaitra Navratri Ghatasthapana");
    }

    // Gangaur: Chaitra (0) Shukla Tritiya (3)
    if (masaIndex === 0 && tithiIndex === 3) {
        festivals.push("Gangaur");
    }

    // Yamuna Chhath: Chaitra (0) Shukla Shashthi (6)
    if (masaIndex === 0 && tithiIndex === 6) {
        festivals.push("Yamuna Chhath");
    }

    // --- New Minor Major Festivals ---

    // Hanuman Jayanti: Chaitra (0) Purnima (15)
    if (masaIndex === 0 && tithiIndex === 15) {
        festivals.push("Hanuman Jayanti");
    }

    // Narasimha Jayanti: Vaishakha (1) Shukla Chaturdashi (14)
    if (masaIndex === 1 && tithiIndex === 14) {
        festivals.push("Narasimha Jayanti");
    }

    // Buddha Purnima: Vaishakha (1) Purnima (15)
    if (masaIndex === 1 && tithiIndex === 15) {
        festivals.push("Buddha Purnima");
    }

    // Vat Savitri Vrat: Jyeshtha (2) Amavasya (30) (Purnimanta tradition follows this on Amavasya)
    if (masaIndex === 2 && tithiIndex === 30) {
        festivals.push("Vat Savitri Vrat");
    }

    // Jagannath Rathyatra: Ashadha (3) Shukla Dwitiya (2)
    if (masaIndex === 3 && tithiIndex === 2) {
        festivals.push("Jagannath Rathyatra");
    }

    // --- Shravana Festivals ---

    // Hariyali Teej: Shravana (4) Shukla Tritiya (3)
    if (masaIndex === 4 && tithiIndex === 3) {
        festivals.push("Hariyali Teej");
    }

    // Nag Panchami: Shravana (4) Shukla Panchami (5)
    if (masaIndex === 4 && tithiIndex === 5) {
        festivals.push("Nag Panchami");
        festivals.push("Kalki Jayanti");
    }

    // Shravana Putrada Ekadashi (already handled in Ekadashi map)

    // Varalakshmi Vrat (Friday before Shravana Purnima)
    // Handled in existing logic using varalakshmi logic below?
    // Let's check below.

    // Hayagriva Jayanti, Gayatri Jayanti, Narali Purnima: Shravana (4) Purnima (15)
    // Also Raksha Bandhan (already there)
    if (masaIndex === 4 && tithiIndex === 15) {
        // Raksha Bandhan is already pushed above.
        festivals.push("Gayatri Jayanti (Shravana)");
        festivals.push("Hayagriva Jayanti");
        festivals.push("Narali Purnima");
    }

    // --- Bhadrapada Festivals ---

    // Kajari Teej: Bhadrapada (5) Krishna Tritiya (18)
    // (Shravana Krishna 3 in Amanta, but usually celebrated as Bhadrapada Krishna 3 in PurnimantaNorth)
    // Drik says: "Next Teej after Hariyali Teej... fifteen days... Bhadrapada Krishna Paksha (Purnimanta) / Shravana Krishna (Amanta)"
    // So in Amanta system (ours), it is Shravana (4) Krishna Tritiya (18).
    if (masaIndex === 4 && tithiIndex === 18) {
        festivals.push("Kajari Teej");
    }

    // Jivitputrika Vrat: Ashwina Krishna Ashtami (Purnimanta) -> Bhadrapada Krishna Ashtami (Amanta)
    // Masa = 5 (Bhadrapada), Tithi = 16+8 = 23 (Krishna Ashtami)
    if (masaIndex === 5 && tithiIndex === 23) {
        festivals.push("Jivitputrika Vrat");
    }

    // Aja Ekadashi: Shravana (4) Krishna 11 (26) (Handled)

    // Hartalika Teej: Bhadrapada (5) Shukla Tritiya (3)
    if (masaIndex === 5 && tithiIndex === 3) {
        festivals.push("Hartalika Teej");
        festivals.push("Gowri Habba");
    }

    // Ganesh Chaturthi: Bhadrapada (5) Shukla Chaturthi (4) (Already added)

    // Rishi Panchami: Bhadrapada (5) Shukla Panchami (5)
    if (masaIndex === 5 && tithiIndex === 5) {
        festivals.push("Rishi Panchami");
    }

    // Radha Ashtami: Bhadrapada (5) Shukla Ashtami (8)
    if (masaIndex === 5 && tithiIndex === 8) {
        festivals.push("Radha Ashtami");
    }

    // Parsva Ekadashi (Handled)

    // Vamana Jayanti: Bhadrapada (5) Shukla Dwadashi (12)
    if (masaIndex === 5 && tithiIndex === 12) {
        festivals.push("Vamana Jayanti");
    }

    // Anant Chaturdashi / Ganesh Visarjan: Bhadrapada (5) Shukla Chaturdashi (14)
    if (masaIndex === 5 && tithiIndex === 14) {
        festivals.push("Anant Chaturdashi");
        festivals.push("Ganesh Visarjan");
    }

    // Pitru Paksha Begins: Bhadrapada (5) Purnima (15) (Usually Purnima Shraddha)
    // But main period is Krishna Paksha of Ashwina (Amanta: Bhadrapada Krishna).
    // Let's mark Purnima Shraddha.
    if (masaIndex === 5 && tithiIndex === 15) {
        festivals.push("Purnima Shraddha (Pitru Paksha Begins)");
    }

    // Sarva Pitru Amavasya: Bhadrapada (5) Amavasya (30)
    // (Ashwina Krishna 30 Purnimanta)
    if (masaIndex === 5 && tithiIndex === 30) {
        festivals.push("Sarva Pitru Amavasya (Mahalaya)");
    }

    // --- Ashwin Festivals ---

    // Navaratri Ghatasthapana: Ashwina (6) Shukla 1 (Already added)

    // Saraswati Avahan: Ashwina (6) Shukla ... depends on Nakshatra (Moola).
    // Skipping logic based *only* on Tithi for now. 
    // Drik says "Ashanina Shukla Saptami" or "Moola Nakshatra".
    // Usually Saptami/Ashtami/Navami are main days.

    // Durga Ashtami: Ashwina (6) Shukla Ashtami (8)
    if (masaIndex === 6 && tithiIndex === 8) {
        festivals.push("Durga Ashtami");
    }

    // Maha Navami: Ashwina (6) Shukla Navami (9)
    if (masaIndex === 6 && tithiIndex === 9) {
        festivals.push("Maha Navami");
    }

    // Vijaya Dashami: Ashwina (6) Shukla 10 (Already added)

    // Papankusha Ekadashi (Handled)

    // Sharad Purnima: Ashwina (6) Purnima (15)
    // Also Valmiki Jayanti
    if (masaIndex === 6 && tithiIndex === 15) {
        festivals.push("Sharad Purnima");
        festivals.push("Valmiki Jayanti");
    }

    // Karwa Chauth: Ashwina (6) Krishna Chaturthi (19)
    // (Kartika Krishna 4 Purnimanta)
    if (masaIndex === 6 && tithiIndex === 19) {
        festivals.push("Karwa Chauth");
    }

    // Ahoi Ashtami: Ashwina (6) Krishna Ashtami (23)
    if (masaIndex === 6 && tithiIndex === 23) {
        festivals.push("Ahoi Ashtami");
    }

    // Rama Ekadashi (Handled)

    // Dhanteras: Ashwina (6) Krishna Trayodashi (28)
    if (masaIndex === 6 && tithiIndex === 28) {
        festivals.push("Dhanteras");
    }

    // Naraka Chaturdashi: Ashwina (6) Krishna Chaturdashi (29)
    if (masaIndex === 6 && tithiIndex === 29) {
        festivals.push("Naraka Chaturdashi");
    }

    // Diwali (Lakshmi Puja): Ashwina (6) Amavasya (30) (Already added)

    // Varalakshmi Vrat: Shravana (4) Friday before Purnima.
    // Usually falls on Shukla Krat (Eighth?) no, it's strictly Friday before Purnima.
    // This is tricky with just Tithi. We need to check if current day is Friday, 
    // AND if Purnima is nearby (within 7 days).
    // Or simpler: It occurs on the Friday of Shravana Shukla Paksha close to Purnima.
    // Most texts say: Second Friday of Shravana? No. "Last Friday before Shravana Purnima".
    // If today is Friday (vara=5) and we are in Shravana Shukla Paksha?
    // How to know if it's the *last* Friday?
    // If tithi is 9, 10, 11, 12, 13, 14? 
    // If we are at Tithi 15 (Purnima), looking back is hard without next/prev checks.
    // Approximation: If Vara=5 (Fri) and Tithi is between Shukla Dashami(10) and Chaturdashi(14)?
    // Or closer? Purnima can be Fri. If Purnima is Fri, is it that day? Usually yes.
    // Let's assume Shravana Shukla Friday is widely auspicious, 
    // but the specific Vrat is the one nearest Purnima.
    // Range: Tithi 8 to 15.
    if (masaIndex === 4 && tithiIndex >= 8 && tithiIndex <= 15 && vara === 5) {
        festivals.push("Varalakshmi Vrat (Likely)");
    }



    // Govardhan Puja: Kartika (7) Shukla Prathama (1)
    if (masaIndex === 7 && tithiIndex === 1) {
        festivals.push("Govardhan Puja");
    }

    // Bhai Dooj: Kartika (7) Shukla Dwitiya (2)
    if (masaIndex === 7 && tithiIndex === 2) {
        festivals.push("Bhai Dooj");
    }

    // Chhath Puja: Kartika (7) Shukla Shashthi (6)
    if (masaIndex === 7 && tithiIndex === 6) {
        festivals.push("Chhath Puja");
    }

    // Tulasi Vivah: Kartika (7) Shukla Dwadashi (12)
    if (masaIndex === 7 && tithiIndex === 12) {
        festivals.push("Tulasi Vivah");
    }

    // Kartik Purnima (Dev Diwali): Kartika (7) Purnima (15)
    if (masaIndex === 7 && tithiIndex === 15) {
        festivals.push("Kartik Purnima / Dev Diwali");
    }

    // Gita Jayanti: Margashirsha (8) Shukla Ekadashi (11) (Mokshada)
    if (masaIndex === 8 && tithiIndex === 11) {
        festivals.push("Gita Jayanti");
    }

    // Dattatreya Jayanti: Margashirsha (8) Purnima (15)
    if (masaIndex === 8 && tithiIndex === 15) {
        festivals.push("Dattatreya Jayanti");
    }

    // Vasant Panchami: Magha (10) Shukla Panchami (5)
    if (masaIndex === 10 && tithiIndex === 5) {
        festivals.push("Vasant Panchami");
    }

    // Ratha Saptami: Magha (10) Shukla Saptami (7)
    if (masaIndex === 10 && tithiIndex === 7) {
        festivals.push("Ratha Saptami");
    }

    // Ekadashi Detection
    // Absolute Tithi 11 (Shukla Ekadashi) or 26 (Krishna Ekadashi)
    if (tithiIndex === 11 || tithiIndex === 26) {
        const name = getEkadashiName(masaIndex, paksha);
        festivals.push(name);
    }

    // Pradosham Detection (Trayodashi - 13 or 28)
    if (tithiIndex === 13 || tithiIndex === 28) {
        const pakshaName = (tithiIndex === 13) ? "Shukla" : "Krishna";
        festivals.push(`Pradosham (${pakshaName})`);
    }

    return festivals;
}
