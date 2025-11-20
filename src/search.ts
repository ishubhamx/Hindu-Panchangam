/**
 * Enhanced transition search algorithms using bracket + binary search approach.
 * Provides more precise and efficient boundary detection compared to simple iteration.
 */

/**
 * Find a boundary where a function crosses zero using bracketing and binary search.
 * 
 * @param f - Function that returns signed difference from boundary (negative before, positive after)
 * @param startDate - Starting date for the search
 * @param direction - Search direction: 'forward' (future) or 'backward' (past)
 * @param maxSearchHours - Maximum hours to search (default: 48)
 * @param coarseStepHours - Initial coarse step size in hours (default: 2)
 * @returns Date of the boundary crossing, or null if not found
 */
export function findBoundary(
    f: (date: Date) => number,
    startDate: Date,
    direction: 'forward' | 'backward' = 'forward',
    maxSearchHours: number = 48,
    coarseStepHours: number = 2
): Date | null {
    const step = direction === 'forward' ? 1 : -1;
    const coarseStepMs = coarseStepHours * 60 * 60 * 1000;
    const maxSearchMs = maxSearchHours * 60 * 60 * 1000;
    
    let current = new Date(startDate);
    let fCurrent = f(current);
    
    // Phase 1: Bracket the zero crossing with coarse steps
    let bracketStart: Date | null = null;
    let bracketEnd: Date | null = null;
    let fStart = fCurrent;
    let fEnd = 0;
    
    let searchedMs = 0;
    while (searchedMs < maxSearchMs) {
        const next = new Date(current.getTime() + step * coarseStepMs);
        const fNext = f(next);
        
        // Check if we've crossed zero
        if (fCurrent * fNext < 0) {
            // Found a bracket
            if (direction === 'forward') {
                bracketStart = fCurrent < 0 ? current : next;
                bracketEnd = fCurrent < 0 ? next : current;
                fStart = fCurrent < 0 ? fCurrent : fNext;
                fEnd = fCurrent < 0 ? fNext : fCurrent;
            } else {
                bracketStart = fCurrent > 0 ? next : current;
                bracketEnd = fCurrent > 0 ? current : next;
                fStart = fCurrent > 0 ? fNext : fCurrent;
                fEnd = fCurrent > 0 ? fCurrent : fNext;
            }
            break;
        }
        
        current = next;
        fCurrent = fNext;
        searchedMs += coarseStepMs;
    }
    
    if (!bracketStart || !bracketEnd) {
        // No crossing found
        return null;
    }
    
    // Phase 2: Binary search to refine to < 1 second precision
    let a = bracketStart;
    let b = bracketEnd;
    let fa = fStart;
    let fb = fEnd;
    
    // Continue until we have < 1 second precision
    const targetPrecisionMs = 1000;
    let iterations = 0;
    const maxIterations = 25; // More than enough for millisecond precision
    
    while (b.getTime() - a.getTime() > targetPrecisionMs && iterations < maxIterations) {
        const mid = new Date((a.getTime() + b.getTime()) / 2);
        const fMid = f(mid);
        
        if (fMid * fa < 0) {
            b = mid;
            fb = fMid;
        } else {
            a = mid;
            fa = fMid;
        }
        
        iterations++;
    }
    
    // Return the midpoint of the final bracket
    return new Date((a.getTime() + b.getTime()) / 2);
}

/**
 * Legacy search function for backward compatibility.
 * Uses binary search within a fixed 2-day window.
 * 
 * @param f - Function that should cross zero at the target boundary
 * @param startDate - Starting date for the search
 * @returns Date where f(date) crosses zero, or null if not found
 */
export function search(f: (date: Date) => number, startDate: Date): Date | null {
    let a = startDate;
    let b = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000); // Look ahead 2 days

    let fa = f(a);
    let fb = f(b);

    if (fa * fb >= 0) {
        // We need the function to cross zero in the interval. 
        // If not, we might not find a root.
        return null;
    }

    for (let i = 0; i < 20; i++) { // 20 iterations are enough for high precision
        const m = new Date((a.getTime() + b.getTime()) / 2);
        const fm = f(m);
        if (fm * fa < 0) {
            b = m;
            fb = fm;
        } else {
            a = m;
            fa = fm;
        }
    }
    return a;
}
