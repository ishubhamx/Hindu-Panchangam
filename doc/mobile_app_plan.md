# 📱 Mobile App Plan: Hindu Panchangam

**Goal:** Create a high-performance, aesthetically premium mobile application using the `@ishubhamx/panchangam-js` library.

---

## 🛠 Technology Stack
*   **Framework:** **React Native (Expo)** (Managed Workflow) - For rapid development, ease of updates, and cross-platform (iOS/Android) support.
*   **Language:** **TypeScript** - leveraging the strong typing of our library.
*   **Styling:** **NativeWind** (TailwindCSS for React Native) - for rapid, consistent, and beautiful UI.
*   **State Management:** **Zustand** (Lightweight) or **TanStack Query** (if fetching external data options).
*   **Navigation:** **Expo Router** (File-based routing, similar to Next.js).
*   **Storage:** **MMKV** (Fastest key-value storage for settings/cache).
*   **Icons:** **Lucide React Native** or **Phosphor Icons**.
*   **Fonts:** **Inter** or **Outfit** for a modern, clean look; **Tiro Devanagari** for Hindi text.

---

## 📱 App Architecture (Monorepo consideration)
Since we have the library in the same repo (or closely related), we should ideally structure this as:
- `/packages/core` (The current library)
- `/apps/mobile` (The new Expo app)

This ensures the app always uses the latest logic from the library without needing NPM publishes for local dev.

---

## 🎨 Design System & UI UX
*Theme: "Divine Modernity" – Deep midnight blues, golds, and soft whites. Glassmorphism for cards.*

### 1. Home Screen (The "Today" Dashboard)
*   **Header:** Current Location (GPS/Manual), Date (Gregorian & Vedic).
*   **Hero Section:**
    *   **Sun/Moon Graphic:** A visual arc showing the current position of Sun/Moon.
    *   **Sunrise/Sunset:** Clearly visible timing.
*   **Primary Panchang:** Tithi, Nakshatra, Yoga, Karana (highlighting the *current* one active right now).
*   **Quick Status:** "Good Time" (Abhijit) vs "Bad Time" (Rahu Kalam) indicators.

### 2. Day View (Detailed)
A scrollable timeline or list view for the specific day:
*   **Transitions:** Visual timeline showing when Tithi/Nakshatra changes.
*   **Muhurtas:** Collapsible sections for Auspicious vs Inauspicious timings.
*   **Planetary Positions:** A table of current planet degrees/rashis.

### 3. Calendar Tab
*   Month view grid.
*   Dot indicators for Ekadashi, Purnima, Amavasya.
*   Tap a day to jump to Day View.

### 4. Settings
*   **Location:** Auto-detect vs Manual City Search.
*   **Preferences:** Amanta vs Purnimanta month display.
*   **Language:** English / Hindi (Future).
*   **Theme:** Light / Dark (System Default).

---

## 🚀 Development Phases

### Phase 1: Setup & Integration
1.  Initialize Expo project in `/apps/mobile` (or standalone).
2.  Link local `@ishubhamx/panchangam-js` library.
3.  Setup Navigation (Expo Router) and Styling (NativeWind).

### Phase 2: Core Dashboard
1.  Implement Location Service (Expo Location).
2.  Build "Today" view using `getPanchangam(new Date(), location)`.
3.  Design "Hero" component with Sun/Moon animations.

### Phase 3: Detailed Views
1.  Implement Day Timeline.
2.  Implement Planetary Position cards.

### Phase 4: Calendar & Settings
1.  Build Month Grid.
2.  Implement User Preferences (MMKV persistence).

---

## ❓ Questions for Refinement
1.  **Repository Structure:** Do you want to keep the app in this same repo (Monorepo) or a separate one?
2.  **Design Preference:** Minimalist (Apple style) or Rich/Traditional (Gold accents, textures)?
3.  **Language:** Should we prioritize Hindi localization immediately?
