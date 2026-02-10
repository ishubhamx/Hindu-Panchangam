import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

export const initGA = () => {
    // Firebase Analytics is initialized in firebase.ts
    // This function is kept for compatibility with existing code structure
    console.log('Firebase Analytics initialized');
};

export const trackPageView = (path: string) => {
    // Firebase automatically tracks page views, but we can log a custom event if needed
    // or rely on the history change listener if using GA4 via GTM.
    // However, for single page apps, we often need to manually log 'page_view' or 'screen_view'.

    // In standard Firebase Analytics for Web, 'page_view' is automatically collected 
    // when using the config tag, but since we are using the SDK:
    logEvent(analytics, 'page_view', {
        page_path: path
    });
};

export const trackEvent = (category: string, action: string, label?: string) => {
    // Mapping generic event params to Firebase structure
    logEvent(analytics, action, {
        event_category: category,
        event_label: label
    });
};

// ── Specific tracking helpers ──────────────────────────────────

/** Navigation events */
export const trackNavigation = (action: string, label?: string) =>
    trackEvent('Navigation', action, label);

/** View-switch events (Day View / Month View) */
export const trackViewSwitch = (view: 'day' | 'month') =>
    trackEvent('Navigation', 'view_switch', view);

/** Today button */
export const trackTodayClick = () =>
    trackEvent('Navigation', 'today_click');

/** Theme toggle */
export const trackThemeToggle = (theme: string) =>
    trackEvent('Settings', 'theme_toggle', theme);

/** Location change */
export const trackLocationChange = (locationName: string) =>
    trackEvent('Location', 'location_change', locationName);

/** Location search */
export const trackLocationSearch = (query: string) =>
    trackEvent('Location', 'location_search', query);

/** Day cell click in month view */
export const trackDayCellClick = (dateStr: string) =>
    trackEvent('Calendar', 'day_cell_click', dateStr);

/** Festival section interaction */
export const trackFestivalView = (festivalName: string) =>
    trackEvent('Content', 'festival_view', festivalName);

/** Birth data modal */
export const trackBirthDataModal = (action: 'open' | 'save' | 'close' | 'calculate') =>
    trackEvent('BirthData', `birth_data_${action}`);

/** Vedic feature views */
export const trackFeatureView = (feature: 'shoola' | 'tarabalam' | 'chandrashtama' | 'hora' | 'muhurta' | 'planetary') =>
    trackEvent('Feature', 'feature_view', feature);

/** Error tracking */
export const trackError = (errorMessage: string, context?: string) =>
    trackEvent('Error', 'app_error', `${context ? context + ': ' : ''}${errorMessage}`);
