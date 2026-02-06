# Feature-Rich Vedic Panchang Enhancement Roadmap

A comprehensive roadmap to make the `@panchangam/core` library the most accurate and feature-complete Vedic Panchang solution available.

---

## Current State Summary

The library has a **strong foundation** with:
- ✅ **Core 5 Limbs**: Tithi, Nakshatra, Yoga, Karana, Vara
- ✅ **Astronomical Precision**: Swiss Ephemeris via `astronomy-engine`
- ✅ **Multiple Muhurats**: Rahu/Yamaganda/Gulika Kalam, Abhijit, Brahma, Govardhan, Dur Muhurta, Choghadiya, Gowri
- ✅ **Amrit Kalam & Varjyam**: Time-based auspicious/inauspicious windows
- ✅ **Planetary Positions**: All 9 Grahas with dignity (exalted/debilitated/own)
- ✅ **Calendar Units**: Masa, Paksha, Ritu, Ayana, Samvat (Vikram/Shaka/Samvatsara)
- ✅ **Vimshottari Dasha**: Full 120-year cycle with Antardasha
- ✅ **Festivals**: 50+ Hindu festivals detected
- ✅ **Kundli & Matching**: Ashtakoot Guna Milan, Mangal Dosha
- ✅ **Validation**: 200+ days verified against Drik Panchang

---

## Phase 0: Fix Current Gaps
> *Goal: Address identified accuracy issues*

| Gap | Description | Status |
|-----|-------------|--------|
| Karana verification | Validate Karana output against Drik | ⏳ |
| Moon transit times | Refine RashiTransition end times | ⏳ |
| Festival edge cases | Handle Nakshatra + Tithi + Masa combos | ⏳ |

---

## Phase 1: Core Accuracy & Missing Elements

| Feature | Description | Priority |
|---------|-------------|----------|
| **Sankranti** | Sun's entry into each Rashi (12/year) | ✅ Done |
| **Panchak** | Moon in last 5 Nakshatras (inauspicious) | ✅ Done |
| **Shoola** | Day-specific directional dosha | ✅ Done |
| **Chandrashtama** | Moon in 8th from natal Rashi | ✅ Done |
| **Tarabalam** | Birth Nakshatra daily strength | ✅ Done |

---

## Phase 2: Advanced Muhurat System

| Feature | Description | Priority |
|---------|-------------|----------|
| **Vivah Muhurat** | Marriage date calculator | 🟡 P1 |
| **Graha Pravesh** | Housewarming muhurat | 🟠 P2 |
| **Naamkaran** | Naming ceremony muhurat | 🟠 P2 |
| **Shubh Muhurat API** | Generic activity-based API | 🟡 P1 |

---

## Phase 3: Regional Variants

| Feature | Description | Priority |
|---------|-------------|----------|
| **Purnimant/Amant** | North/South Masa calculation | 🟠 P2 |
| **Ayanamsa Options** | Lahiri, Raman, KP, Surya Siddhanta | 🟠 P2 |
| **Regional Festivals** | Odia, Tamil, Bengali calendar variants | 🟠 P2 |

---

## Phase 4: Advanced Jyotish

| Feature | Description | Priority |
|---------|-------------|----------|
| **Pratyantardasha** | 3rd/4th level Dasha periods | 🔴 P3 |
| **Yogini Dasha** | Alternative 36-year system | 🔴 P3 |
| **Ashtakavarga** | Planetary strength points (0-8) | 🔴 P3 |
| **Shadbala** | Sixfold planetary strength | 🔴 P3 |
| **Transit Analysis** | Sade Sati, Guru Peyarchi detection | 🔴 P3 |

---

## Phase 5: Data & Localization

| Feature | Description | Priority |
|---------|-------------|----------|
| **Localization** | Hindi, Tamil, Telugu, Kannada names | 🟠 P2 |
| **Eclipse Data** | Solar/Lunar eclipse + Sutak Kalam | 🟠 P2 |
| **Full Hora** | All 24 planetary hours | 🟡 P1 |

---
## Progress Tracking

Last Updated: 2026-02-06

### Completed
- [x] Initial enhancement plan created
- [x] **Sankranti** - `findNextSankranti`, `findSankrantisInRange`, `getSankrantiForDate` with Punya Kalam
- [x] **Panchak** - `getPanchak` with 5 types (Mrityu, Agni, Raja, Chora, Roga)
- [x] **Shoola** - `getDishaShoola`, `isDirectionSafe` (Verified against Drik Panchang)
- [x] **Chandrashtama** - `getChandrashtama`, `getChandrashtamaRashi`
- [x] **Tarabalam** - `getTarabalam`, `getAuspiciousNakshatras`

### In Progress
- [ ] Phase 2: Advanced Muhurat System

### Planned
- [ ] Phase 3-5 pending Phase 2 completion
