# Hindu Panchang Calendar - Modern UI

A beautiful, modern calendar interface for the Hindu Panchang web application built with React + Vite. Features a clean, premium aesthetic inspired by Google Calendar and Apple Weather, while accurately calculating Vedic calendar data using the `@ishubhamx/panchangam-js` library.

## ✨ Features

### 🎨 Modern Design
- **Premium aesthetics** with soft gradients and glassmorphism effects
- **Smooth animations** for all interactions
- **Dark theme** with vibrant accent colors
- **Responsive design** - works beautifully on desktop, tablet, and mobile

### 📅 Month View
- Clean 7-column calendar grid
- Large date numbers with small tithi labels
- Color-coded special days:
  - 🎉 Festivals (pink gradient)
  - 🌑 Amavasya/New Moon (deep blue)
  - 🌕 Purnima/Full Moon (golden glow)
  - 🙏 Ekadashi (light cyan)
- Today's date highlighted with soft glow effect
- Smooth hover animations

### 📖 Day Detail View
- **Hero section** with full date, Vikram/Shaka Samvat, Masa, and Paksha
- **Visual sunrise timeline** showing day/night cycle with gradient
- **Panchang cards** for Tithi, Nakshatra, Yoga, and Karana
- **Expandable details** with tap/click interaction
- **Planetary positions** grid showing all 9 grahas

### 🌍 Location Support
- Default: New Delhi, India (IST timezone)
- Accurate timezone handling using Intl API
- Sunrise-based Panchang calculations (hidden complexity)

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- Parent `@ishubhamx/panchangam-js` library built

### Installation

```bash
# Navigate to web directory from project root
cd packages/web

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Component Structure

```
src/
├── components/
│   ├── Calendar/
│   │   ├── MonthCalendar.tsx    # Month grid view
│   │   ├── DayCell.tsx          # Individual day cell
│   │   └── *.css
│   ├── DayDetail/
│   │   ├── DayDetail.tsx        # Day detail container
│   │   ├── SunriseTimeline.tsx  # Visual day/night timeline
│   │   ├── PanchangCard.tsx     # Reusable info card
│   │   └── *.css
│   └── Layout/
│       ├── AppLayout.tsx        # Main layout wrapper
│       ├── Header.tsx           # App header
│       └── *.css
├── hooks/
│   ├── usePanchangData.ts       # Fetch single day data
│   └── useMonthData.ts          # Fetch full month data
├── utils/
│   ├── timezone.ts              # Timezone calculations
│   └── colors.ts                # Color/formatting helpers
├── styles/
│   ├── tokens.css               # Design system tokens
│   └── global.css               # Global styles & reset
├── types/
│   └── index.ts                 # TypeScript definitions
├── App.tsx                      # Main app component
└── main.tsx                     # React entry point
```

### Key Design Decisions

#### 1. **Sunrise-Based Logic (Hidden from Users)**
- **Why**: Traditional Panchangam calculates Tithi/Nakshatra at sunrise, not midnight
- **How**: `useMonthData` hook gets sunrise time for each day, then calculates Panchang at that moment
- **UX**: Users see civil dates (Jan 26, Jan 27) but get accurate sunrise-anchored data

#### 2. **UTC Calculations, Local Display**
- **Why**: Avoid timezone bugs and ensure accuracy across locations
- **How**: All internal calculations in UTC, timezone offset passed to library
- **UX**: Times displayed in user's local timezone using `Intl.DateTimeFormat`

#### 3. **Glassmorphism & Gradients**
- **Why**: Create premium, modern feel (not traditional/cluttered)
- **How**: `backdrop-filter: blur()`, semi-transparent backgrounds, soft shadows
- **UX**: Cards feel lightweight and elegant, gradients guide eye naturally

#### 4. **Responsive Grid**
- **Desktop**: Side-by-side month + day view (60/40 split)
- **Mobile**: Stacked views with smooth transitions
- **Breakpoint**: 1024px (standard tablet cutoff)

#### 5. **Color Coding Special Days**
- **Festivals**: Pink-red gradient (vibrant, celebratory)
- **Amavasya**: Dark blue (new moon, introspective)
- **Purnima**: Golden glow (full moon, radiant)
- **Today**: Purple glow with pulsing shadow

## 🎨 Design System

### Color Palette

```css
--color-accent-primary: #667eea;   /* Purple */
--color-accent-secondary: #f093fb; /* Pink */
--color-accent-tertiary: #4facfe;  /* Blue */

/* Gradients */
--gradient-sunrise: linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcf7f);
--gradient-sunset: linear-gradient(135deg, #fc466b, #3f5efb);
--gradient-twilight: linear-gradient(135deg, #667eea, #764ba2);
```

### Typography

- **Primary Font**: Inter (body text, UI elements)
- **Display Font**: Outfit (headings, large numbers)
- **Modular Scale**: 12px → 48px (responsive)

### Spacing

- **Base Unit**: 4px
- **Scale**: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px), 3xl(64px)

## 🔌 Integration with Parent Library

This app uses `@ishubhamx/panchangam-js` via `file:..` dependency:

```json
{
  "dependencies": {
    "@ishubhamx/panchangam-js": "file:.."
  }
}
```

### Key Imports

```typescript
import { 
  Observer,           // Location representation
  getPanchangam,      // Main calculation function
  getSunrise,         // Sunrise time calculation
  tithiNames,         // Array of tithi names
  nakshatraNames,     // Array of nakshatra names
  yogaNames           // Array of yoga names
} from '@ishubhamx/panchangam-js';
```

## 📱 Responsive Behavior

### Desktop (1024px+)
- **Layout**: `grid-template-columns: 1.2fr 1fr` (month | day)
- **Day View**: Sticky scroll (stays visible while scrolling month)
- **Interactions**: Hover effects on all clickable elements

### Tablet (768px - 1024px)
- **Layout**: Stacked (month above day)
- **Font Sizes**: Slightly reduced
- **Spacing**: Tighter gaps

### Mobile (< 768px)
- **Layout**: Full-width stacked
- **Date Numbers**: Smaller (2xl → xl)
- **Grid Gaps**: Minimal (4px)
- **Touch Targets**: Minimum 44x44px

## 🧪 Testing Checklist

- [ ] Month navigation (previous/next buttons)
- [ ] Day selection (click on any day cell)
- [ ] Today button (jumps to current month/date)
- [ ] Today glow effect visible
- [ ] Festival days show colored background
- [ ] Sunrise timeline displays correctly
- [ ] Panchang cards expand/collapse smoothly
- [ ] Planetary positions grid loads
- [ ] Responsive layout works on mobile
- [ ] Loading skeletons appear during calculation
- [ ] No console errors

## 📝 Future Enhancements

- [ ] Location selector dropdown (multiple cities)
- [ ] Date picker for quick navigation
- [ ] Swipe gestures for mobile month navigation
- [ ] Share button (export day as image)
- [ ] Dark/light mode toggle
- [ ] Print view for monthly Panchang
- [ ] PWA support (offline mode)
- [ ] Muhurata finder (search for auspicious times)

## 🐛 Troubleshooting

### Issue: "Cannot find module '@ishubhamx/panchangam-js'"
**Solution**: Ensure parent library is built:
```bash
# From project root
npm run build
cd packages/web
npm install
```

### Issue: Blank screen / white page
**Solution**: Check browser console for errors. Common causes:
- Missing dependencies (run `npm install`)
- TypeScript errors (run `npm run build` to check)

### Issue: Incorrect Panchang data
**Solution**: Verify timezone offset is being passed correctly to `getPanchangam()`.

## 📄 License

MIT License - Same as parent `@ishubhamx/panchangam-js` project.

---

**Built with** ❤️ **using React, Vite, and Swiss Ephemeris calculations**
