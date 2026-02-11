import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const firebaseConfigLocal = {
    apiKey: 'AIzaSyD6X1X1X1X1X1X1X1X1X1X1X1X1X1X1X1',
    authDomain: '1234567890',
    projectId: '1234567890',
    storageBucket: '1234567890',
    messagingSenderId: '1234567890',
    appId: '1234567890',
    measurementId: '1234567890'
};

const isLocalhost = window.location.hostname === 'localhost';

// Initialize Firebase
const app = initializeApp(isLocalhost ? firebaseConfigLocal : firebaseConfig);
const analytics = isLocalhost ? null : getAnalytics(app);

export { app, analytics };
