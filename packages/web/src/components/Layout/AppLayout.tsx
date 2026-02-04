import React, { type ReactNode } from 'react';
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
 * UX: Responsive layout with header and content area
 * Desktop: side-by-side month + day view
 * Mobile: stacked views
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ 
    children, 
    onTodayClick, 
    location, 
    onLocationChange 
}) => {
    return (
        <div className="app-layout">
            <Header 
                onTodayClick={onTodayClick}
                location={location}
                onLocationChange={onLocationChange}
            />
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};
