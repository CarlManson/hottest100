import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useCountdownDateReached } from '../hooks/useCountdownSettings';
import { Icon } from './icons/Icon';

/**
 * Shown on the Countdown and Leaderboard pages before the countdown starts, so the Admin
 * knows it's a test run and the Host knows why the page isn't in their menu yet.
 */
export const PreCountdownNotice: React.FC<{ page: string }> = ({ page }) => {
  const { countdownResults, hottest200Results } = useApp();
  const { isAdmin } = useAuth();
  const dateReached = useCountdownDateReached();
  if (dateReached || countdownResults.length > 0 || hottest200Results.length > 0) return null;

  return (
    <div className="pre-countdown-notice mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-900">
      <Icon name="info" /> {isAdmin
        ? `The countdown hasn't started yet. ${page} is ready for testing in the meantime.`
        : `${page} is hidden from the Host menu until the countdown starts. You can still open it here for testing.`}
    </div>
  );
};
