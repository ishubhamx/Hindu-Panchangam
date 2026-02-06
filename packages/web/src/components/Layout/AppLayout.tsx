
import React, { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import type { Location } from '../../types';
import './AppLayout.css';

interface AppLayoutProps {
    children: ReactNode;
    onTodayClick: () => void;
    location: Location;
    onLocationChange: (location: Location) => void;
}

/**
 * AppLayout - Main layout wrapper
 * UX: Responsive layout with header, view switcher, and content area
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    onTodayClick,
    location,
    onLocationChange
}) => {
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const isMonthView = routerLocation.pathname.startsWith('/month');
    const isDayView = !isMonthView;

    return (
        <div className="app-layout">
            <Header
                onTodayClick={onTodayClick}
                location={location}
                onLocationChange={onLocationChange}
            />

            <div className="layout-view-controls">
                <div className="view-switcher display-tabs">
                    <button
                        className={`view-tab ${isDayView ? 'active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        Day View
                    </button>
                    <button
                        className={`view-tab ${isMonthView ? 'active' : ''}`}
                        onClick={() => navigate('/month')}
                    >
                        Month View
                    </button>
                </div>
            </div>

            <main className="app-main">
                {children}
            </main>
        </div>
    );
};
