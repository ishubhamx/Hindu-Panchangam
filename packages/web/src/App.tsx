import { useState, useCallback, useMemo } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { MonthCalendar } from './components/Calendar/MonthCalendar';
import { DayDetail } from './components/DayDetail/DayDetail';
import { PanchangTimeline } from './components/DayDetail/PanchangTimeline';
import { useMonthData } from './hooks/useMonthData';
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Main App Component
 * Manages state for current month, selected date, and location
 */
function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

  // Fetch month data
  const { monthData, loading } = useMonthData(currentYear, currentMonth, location);

  // Get selected day's panchang from the already-calculated month data
  // This ensures consistency between calendar cell and detail view
  const selectedPanchang = useMemo(() => {
    if (!selectedDate || monthData.length === 0) return null;
    
    const dayData = monthData.find(d => 
      d.date.getDate() === selectedDate.getDate() &&
      d.date.getMonth() === selectedDate.getMonth() &&
      d.date.getFullYear() === selectedDate.getFullYear()
    );
    
    return dayData?.panchang || null;
  }, [selectedDate, monthData]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  const handleTodayClick = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now);
  }, []);

  const handleLocationChange = useCallback((newLocation: Location) => {
    setLocation(newLocation);
  }, []);

  return (
    <AppLayout 
      onTodayClick={handleTodayClick}
      location={location}
      onLocationChange={handleLocationChange}
    >
      <div className="month-controls">
        <button className="nav-button" onClick={handlePrevMonth} aria-label="Previous month">
          ←
        </button>
        <div className="month-year-display">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </div>
        <button className="nav-button" onClick={handleNextMonth} aria-label="Next month">
          →
        </button>
      </div>

      <div className="content-grid">
        <div className="month-view">
          <MonthCalendar
            year={currentYear}
            month={currentMonth}
            location={location}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            monthData={monthData}
            loading={loading}
          />

      {/* Panchang Timeline - Full Width Below Calendar */}
      {selectedPanchang && (
        <div className="timeline-section-bottom">
          <PanchangTimeline panchang={selectedPanchang} timezone={location.timezone} />
        </div>
      )}
        </div>

        <div className="day-view">
          {selectedDate && selectedPanchang && (
            <DayDetail
              date={selectedDate}
              panchang={selectedPanchang}
              timezone={location.timezone}
              monthData={{ days: monthData, year: currentYear, month: currentMonth }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
