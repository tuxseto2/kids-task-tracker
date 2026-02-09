// Time utility functions for Pacific timezone handling

/**
 * Get current date/time in Pacific timezone
 * @returns {Date} Current Pacific time
 */
export function getCurrentPacificTime() {
    // Create a date object and convert to Pacific time
    const now = new Date();
    const pacificTimeString = now.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles'
    });
    return new Date(pacificTimeString);
}

/**
 * Get midnight Pacific time for today
 * @returns {Date} Midnight PT today
 */
export function getMidnightPacificToday() {
    const now = getCurrentPacificTime();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
}

/**
 * Get the start of the current week (Sunday at midnight PT)
 * @returns {string} ISO date string for week start
 */
export function getWeekStartDate() {
    const now = getCurrentPacificTime();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days to subtract to get to Sunday
    const daysToSubtract = dayOfWeek;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);

    return weekStart.toISOString().split('T')[0]; // Return YYYY-MM-DD
}

/**
 * Check if tasks should reset (midnight has passed since last reset)
 * @param {string} lastResetDate - ISO date string of last reset
 * @returns {boolean} True if should reset
 */
export function shouldResetDaily(lastResetDate) {
    if (!lastResetDate) return true;

    const lastReset = new Date(lastResetDate);
    const midnightToday = getMidnightPacificToday();

    return midnightToday > lastReset;
}

/**
 * Check if weekly stats should reset (new week has started)
 * @param {string} weekStartDate - ISO date string of current week start
 * @returns {boolean} True if should reset
 */
export function shouldResetWeekly(weekStartDate) {
    if (!weekStartDate) return true;

    const currentWeekStart = getWeekStartDate();
    return currentWeekStart !== weekStartDate;
}

/**
 * Get date range for current week
 * @returns {object} { start: Date, end: Date }
 */
export function getCurrentWeekRange() {
    const weekStartStr = getWeekStartDate();
    const weekStart = new Date(weekStartStr);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { start: weekStart, end: weekEnd };
}

/**
 * Format date range for display
 * @returns {string} Formatted date range (e.g., "Jan 26 - Feb 1")
 */
export function getWeekRangeDisplay() {
    const { start, end } = getCurrentWeekRange();

    const options = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);

    return `${startStr} - ${endStr}`;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD) in Pacific time
 * @returns {string} Today's date
 */
export function getTodayDateString() {
    const now = getCurrentPacificTime();
    return now.toISOString().split('T')[0];
}
