export interface Location {
    name: string;
    lat: number;
    lon: number;
    elevation: number;
    timezone: string;
}

import type { Festival } from '@ishubhamx/panchangam-js';

export interface DayData {
    date: Date;
    panchang: {
        festivals: Festival[];
        [key: string]: any;
    };
}

export interface MonthData {
    days: DayData[];
    year: number;
    month: number;
}

export interface MonthCalendarProps {
    year: number;
    month: number;
    location: Location;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    monthData: DayData[];
    loading: boolean;
}

export interface DayCellProps {
    date: Date;
    panchang: any;
    isToday: boolean;
    isSelected: boolean;
    onClick: () => void;
    timezone: string;
}

export interface DayDetailProps {
    date: Date;
    panchang: any;
    timezone: string;
    monthData?: MonthData;
}

export interface SunriseTimelineProps {
    sunrise: Date | null;
    sunset: Date | null;
    moonrise?: Date | null;
    moonset?: Date | null;
    tithi?: number;
    paksha?: string;
    currentTime: Date;
    timezone: string;
}

export interface PanchangCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon?: React.ReactNode;
    details?: React.ReactNode;
    accentColor?: string;
}
