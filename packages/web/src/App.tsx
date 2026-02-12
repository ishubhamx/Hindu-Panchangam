import { useState, useCallback } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import AnalyticsTracker from './components/Analytics/AnalyticsTracker';
import { DayViewPage } from './pages/DayViewPage';
import { MonthViewPage } from './pages/MonthViewPage';
import { MatchViewPage } from './pages/MatchViewPage';
import { trackEvent } from './utils/analytics';
import type { Location } from './types';
import './styles/global.css';
import './App.css';

// Default location: New Delhi, India
const DEFAULT_LOCATION: Location = {
  name: 'New Delhi, India',
  lat: 28.6139,
  lon: 77.2090,
  elevation: 216,
  timezone: 'Asia/Kolkata',
};

/**
 * Main App Component
 * Manages Global State (Location) and Routing
 */
function App() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

  const handleLocationChange = useCallback((newLocation: Location) => {
    setLocation(newLocation);
    trackEvent('Location', 'Change', newLocation.name);
  }, []);

  const handleTodayClick = useCallback(() => {
    // Navigate to root (Day View / Today)
    window.location.href = '/';
  }, []);

  // Custom wrapper to pass props to Layout
  const LayoutWrapper = () => (
    <AppLayout
      onTodayClick={handleTodayClick}
      location={location}
      onLocationChange={handleLocationChange}
    >
      <AnalyticsTracker />
      <Outlet context={{ location }} />
    </AppLayout>
  );

  return (
    <Routes>
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<DayViewPage />} />
        <Route path="/date/:dateStr" element={<DayViewPage />} />
        <Route path="/month" element={<MonthViewPage />} />
        <Route path="/matching" element={<MatchViewPage />} />
        {/* Fallback to Day View */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
