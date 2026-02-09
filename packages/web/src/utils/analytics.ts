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
