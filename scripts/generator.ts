import { Observer, Body, SearchRiseSet } from 'astronomy-engine';
import { getPanchangam, Panchangam, yogaNames, karanaNames } from "../src/index";
import { DateTime } from "luxon";

// Re-using the name arrays from index.ts. In a larger app, we might centralize these.
const tithiNames = [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function formatTime(date: Date | null, timeZone: string): string {
    if (!date) return '';
    return DateTime.fromJSDate(date).setZone(timeZone).toFormat('HH:mm');
}

export function generateHtmlCalendar(year: number, month: number, observer: Observer, timeZone: string): string {
    const monthDate = DateTime.fromObject({ year, month });
    const monthName = monthDate.toFormat('MMMM yyyy');
    const daysInMonth = monthDate.daysInMonth;

    if (!daysInMonth) {
        return `<html><body>Error: Invalid year or month provided.</body></html>`;
    }

    let calendarHtml = `
        <html>
            <head>
                <title>Panchangam for ${monthName}</title>
                <style>
                    /* Basic styling for the calendar */
                    body { font-family: sans-serif; }
                    .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; border: 1px solid #ccc; }
                    .day, .header { border: 1px solid #ccc; padding: 10px; min-height: 180px; }
                    .header { font-weight: bold; text-align: center; background: #f0f0f0; min-height: auto; }
                    .day-number { font-weight: bold; margin-bottom: 5px; }
                    .details { font-size: 0.8em; }
                    .tithi, .nakshatra, .yoga, .karana, .kala, .timings { margin-bottom: 4px; }
                    .timings { margin-top: 8px; padding-top: 4px; border-top: 1px solid #eee; }
                    .timings div { margin-bottom: 2px; }
                </style>
            </head>
            <body>
                <h1>Panchangam for ${monthName}</h1>
                <div class="calendar">
                    <div class="header">Sun</div>
                    <div class="header">Mon</div>
                    <div class="header">Tue</div>
                    <div class="header">Wed</div>
                    <div class="header">Thu</div>
                    <div class="header">Fri</div>
                    <div class="header">Sat</div>
    `;

    // Add empty cells for the first day of the month
    const firstDayOfMonth = DateTime.fromObject({ year, month, day: 1 }).weekday; // 1 for Monday, 7 for Sunday
    const startOffset = firstDayOfMonth % 7;
    for (let i = 0; i < startOffset; i++) {
        calendarHtml += '<div class="day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);

        const sunriseToday = SearchRiseSet(Body.Sun, observer, 1, date, 300);
        if (sunriseToday === null) {
            calendarHtml += `<div class="day"><div class="day-number">${day}</div><div>No sunrise</div></div>`;
            continue;
        }

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const sunriseTomorrow = SearchRiseSet(Body.Sun, observer, 1, nextDate, 300);
        if (sunriseTomorrow === null) {
            calendarHtml += `<div class="day"><div class="day-number">${day}</div><div>No sunrise on next day</div></div>`;
            continue;
        }

        const dayWindow = { start: sunriseToday, end: sunriseTomorrow };
        const p1 = getPanchangam(dayWindow.start.date, observer);

        let tithiHtml = `${tithiNames[p1.tithi]} (starts ${formatTime(p1.tithiStartTime, timeZone)})`;
        if (p1.tithiEndTime && p1.tithiEndTime < dayWindow.end.date) {
            const nextTithiIndex = (p1.tithi + 1) % 30;
            tithiHtml += `<br>${tithiNames[nextTithiIndex]} (starts ${formatTime(p1.tithiEndTime, timeZone)})`;
        }

        let nakshatraHtml = `${nakshatraNames[p1.nakshatra]} (starts ${formatTime(p1.nakshatraStartTime, timeZone)})`;
        if (p1.nakshatraEndTime && p1.nakshatraEndTime < dayWindow.end.date) {
            const nextNakshatraIndex = (p1.nakshatra + 1) % 27;
            nakshatraHtml += `<br>${nakshatraNames[nextNakshatraIndex]} (starts ${formatTime(p1.nakshatraEndTime, timeZone)})`;
        }

        let yogaHtml = `${yogaNames[p1.yoga]} (until ${formatTime(p1.yogaEndTime, timeZone)})`;
        if (p1.yogaEndTime && p1.yogaEndTime < dayWindow.end.date) {
            const nextYogaIndex = (p1.yoga + 1) % 27;
            yogaHtml += `<br>${yogaNames[nextYogaIndex]} (starts ${formatTime(p1.yogaEndTime, timeZone)})`;
        }

        calendarHtml += `
            <div class="day">
                <div class="day-number">${day}</div>
                <div class="details">
                    <div class="tithi">${tithiHtml}</div>
                    <div class="nakshatra">${nakshatraHtml}</div>
                    <div class="yoga"><strong>Yoga:</strong> ${yogaHtml}</div>
                    <div class="karana"><strong>Karana:</strong> ${p1.karana}</div>
                    <div class="kala"><strong>Rahu Kalam:</strong> ${formatTime(p1.rahuKalamStart, timeZone)} - ${formatTime(p1.rahuKalamEnd, timeZone)}</div>
                    <div class="timings">
                        <div><strong>Sun:</strong> ${formatTime(p1.sunrise, timeZone)} - ${formatTime(p1.sunset, timeZone)}</div>
                        <div><strong>Moon:</strong> ${formatTime(p1.moonrise, timeZone)} - ${formatTime(p1.moonset, timeZone)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    calendarHtml += `
                </div>
            </body>
        </html>
    `;

    return calendarHtml;
} 