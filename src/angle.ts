/**
 * Angle utility functions for working with celestial longitudes.
 * These utilities help normalize angles and compute differences in the 0-360 degree range.
 */

/**
 * Normalize an angle to the range [0, 360).
 * @param angle - The angle in degrees
 * @returns The normalized angle in [0, 360)
 */
export function normalize360(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

/**
 * Compute the minimal positive forward difference from 'from' to 'to' in degrees.
 * Returns a value in [0, 360).
 * 
 * @param from - Starting angle in degrees
 * @param to - Target angle in degrees
 * @returns The minimal positive forward difference
 */
export function diffPositive(from: number, to: number): number {
    const normFrom = normalize360(from);
    const normTo = normalize360(to);
    let diff = normTo - normFrom;
    if (diff < 0) {
        diff += 360;
    }
    return diff;
}

/**
 * Adjust current angle for root-finding continuity when searching for a target angle.
 * Adds or subtracts 360 degrees when the gap between current and target exceeds 180 degrees
 * to maintain monotonicity during binary search.
 * 
 * @param current - Current angle value
 * @param target - Target angle to reach
 * @returns Adjusted angle for continuous search
 */
export function wrapForSearch(current: number, target: number): number {
    let adjusted = current;
    
    // If current is much larger than target, wrap it down
    if (current > target + 180) {
        adjusted -= 360;
    }
    // If current is much smaller than target, wrap it up
    else if (current < target - 180) {
        adjusted += 360;
    }
    
    return adjusted;
}
