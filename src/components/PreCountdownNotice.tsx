import React from 'react';
import { useApp } from '../context/AppContext';
import { useCountdownDateReached } from '../hooks/useCountdownSettings';
import { Icon } from './icons/Icon';

/**
 * Shown on pages that stay out of the menu until the countdown starts,
 * so whoever opens them early (for testing) knows why the menu skips them.
 */
export const PreCountdownNotice: React.FC<{ page: string }> = ({ page }) => {
  const { countdownResults, hottest200Results } = useApp();
  const dateReached = useCountdownDateReached();
  if (dateReached || countdownResults.length > 0 || hottest200Results.length > 0) return null;

  return (
    <div className="pre-countdown-notice mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-900">
      <Icon name="info" /> {page} is hidden from the menu until the countdown starts. You can still open it here for testing.
    </div>
  );
};
