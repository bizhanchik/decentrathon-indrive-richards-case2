import Cookies from 'js-cookie';

const TOUR_COMPLETED_COOKIE = 'taxi_analysis_tour_completed';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Check if the user has completed the tour before
 * @returns true if the user is a first-time visitor (tour not completed)
 */
export const isFirstTimeVisitor = (): boolean => {
  const tourCompleted = Cookies.get(TOUR_COMPLETED_COOKIE);
  return !tourCompleted;
};

/**
 * Mark the tour as completed for this user
 */
export const markTourAsCompleted = (): void => {
  Cookies.set(TOUR_COMPLETED_COOKIE, 'true', { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax',
    secure: window.location.protocol === 'https:'
  });
};

/**
 * Reset the tour completion status (for testing purposes)
 */
export const resetTourStatus = (): void => {
  Cookies.remove(TOUR_COMPLETED_COOKIE);
};