# 🗺️ Hindu Panchangam Library Roadmap

**Vision:** To build the most accurate, type-safe, and feature-rich Hindu Panchangam library for the TypeScript/JavaScript ecosystem, matching the depth of traditional almanacs like Drik Panchang.

---

## 🏗 Phase 1: Core Foundation (✅ Mostly Complete)
*Basic astronomical accuracy and primary Vedic elements.*
- [x] **Planetary Ephmeris:** High-precision positions via `astronomy-engine`.
- [x] **Sunrise/Sunset:** Accurate to specific lat/long with refraction.
- [x] **The 5 Limbs (Panchang):** Tithi, Nakshatra, Yoga, Karana, Vara.
- [x] **Transitions:** Exact end times for all elements.
- [x] **Basic Muhurtas:** Rahu Kalam, Yamaganda, Gulika, Abhijit, Brahma.

---

## 🗓 Phase 2: Essential Calendar Units (High Priority)
*Turning calculations into a "Calendar" that people recognize.*

### 1. Lunar Month & Year
- [ ] **Lunar Month (Masa):** Calculate the current month name (e.g., Chaitra, Vaishakha).
    - Support for **Amanta** (ends on No Moon) vs **Purnimanta** (ends on Full Moon) systems.
- [ ] **Paksha:** Explicitly identify Krishna Paksha vs Shukla Paksha.
- [ ] **Ayana:** Solar motion direction (Uttarayana / Dakshinayana).
- [ ] **Ritu:** The 6 Vedic Seasons (Vasant, Grishma, Varsha, Sharad, Hemant, Shishir).

### 2. Eras (Samvat)
- [ ] **Vikram Samvat:** The standard North Indian year.
- [ ] **Shaka Samvat:** The official Indian government era.
- [ ] **Samvatsara:** The 60-year Jupiter cycle name (e.g., Prabhava, Vibhava).

---

## 🔮 Phase 3: Planetary Detail & Astrology (Medium Priority)
*Deepening the astronomical data for astrological use.*

### 1. Rashi & Padas
- [ ] **Nakshatra Padas:** Calculate the 1-4 quarter (Charan) for the Moon.
- [ ] **Moon Sign (Rashi):** Which Zodiac sign contains the Moon.
- [ ] **Sun Sign (Surya Rashi):** Which Zodiac sign contains the Sun.
- [ ] **Sun Nakshatra:** Which Star the Sun is currently transiting.

### 2. The Ascendant (Lagna)
- [ ] **Udaya Lagna:** The zodiac sign rising on the eastern horizon at sunrise (crucial for Muhurta).
- [ ] **Lagna Duration:** Start and end times of the current Lagna.

---

## ⚡ Phase 4: Advanced Muhurta & Strength (Medium Priority)
* Determining "Good" and "Bad" times for specific individuals.*

### 1. Personal Strength (Balam)
- [ ] **Tara Balam:** Strength of the day's star relative to a user's birth star.
- [ ] **Chandra Balam:** Strength of the Moon sign relative to a user's sign.

### 2. Additional Timings
- [ ] **Varjyam (Tyajyam):** Inauspicious period during a Nakshatra.
- [ ] **Amrit Kalam:** Auspicious period (counter to Varjyam).
- [ ] **Godhuli Muhurta:** The "Cow Dust" time at sunset.

### 3. Special Yogas
- [ ] **Nityayogas:** Anandadi Yogas (Ananda, Kaladanda, etc.).
- [ ] **Auspicious Yogas:** Sarvartha Siddhi, Amrit Siddhi, Guru Pushya.
- [ ] **Inauspicious Yogas:** Panchak (five bad days).

---

## 🧭 Phase 5: Regional & Esoteric (Low Priority)
*Features for specific regions or specific use cases.*

- [ ] **Directional Shool (Disha Shool):** Directions to avoid traveling.
- [ ] **Nivas:** Residence of Shiva/Agni (used for specific rituals).
- [ ] **Tamil Calendar:** Month names and rules specific to Tamil Nadu.
- [ ] **Bengali Calendar:** Solar month rules.

---

## 🎉 Phase 6: Festivals (Complex)
*Algorithmic determination of major holidays.*

- [ ] **Major Festivals:** Diwali, Holi, Rama Navami, Ganesh Chaturthi.
- [ ] **Ekadashi Rules:** Smarta vs Vaishnava Ekadashi calculation.
- [ ] **Pradosham:** Calculation of Pradosh Vrat timings.
