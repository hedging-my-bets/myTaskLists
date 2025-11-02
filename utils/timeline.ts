
/**
 * Calculate the next hourly boundary considering grace minutes
 * @param now Current date/time
 * @param graceMinutes Grace period in minutes (0-30)
 * @returns Next boundary date
 */
export const nextBoundaryConsideringGrace = (now: Date, graceMinutes: number): Date => {
  const next = new Date(now);
  
  // Get current minutes
  const currentMinutes = now.getMinutes();
  
  // If we're within the grace period of the current hour, the boundary is at the end of grace
  if (currentMinutes < graceMinutes) {
    next.setMinutes(graceMinutes);
    next.setSeconds(0);
    next.setMilliseconds(0);
  } else {
    // Otherwise, boundary is at the start of next hour + grace
    next.setHours(next.getHours() + 1);
    next.setMinutes(graceMinutes);
    next.setSeconds(0);
    next.setMilliseconds(0);
  }
  
  return next;
};

/**
 * Check if current time is within grace period of an hour
 * @param now Current date/time
 * @param targetHour Target hour (0-23)
 * @param graceMinutes Grace period in minutes
 * @returns True if within grace period
 */
export const isWithinGracePeriod = (now: Date, targetHour: number, graceMinutes: number): boolean => {
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Check if we're in the target hour
  if (currentHour === targetHour) {
    return true;
  }
  
  // Check if we're in the next hour but within grace period
  if (currentHour === (targetHour + 1) % 24 && currentMinutes < graceMinutes) {
    return true;
  }
  
  return false;
};

/**
 * Get the current active hour considering grace period
 * @param now Current date/time
 * @param graceMinutes Grace period in minutes
 * @returns Active hour (0-23)
 */
export const getActiveHour = (now: Date, graceMinutes: number): number => {
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // If we're within grace period of the previous hour, return previous hour
  if (currentMinutes < graceMinutes && currentHour > 0) {
    return currentHour - 1;
  } else if (currentMinutes < graceMinutes && currentHour === 0) {
    return 23; // Wrap to previous day's last hour
  }
  
  return currentHour;
};

/**
 * Calculate time until next refresh (in milliseconds)
 * @param now Current date/time
 * @param graceMinutes Grace period in minutes
 * @returns Milliseconds until next refresh
 */
export const getTimeUntilNextRefresh = (now: Date, graceMinutes: number): number => {
  const nextBoundary = nextBoundaryConsideringGrace(now, graceMinutes);
  return nextBoundary.getTime() - now.getTime();
};
