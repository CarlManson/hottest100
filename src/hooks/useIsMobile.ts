import { useEffect, useState } from 'react';

/**
 * Phones and tablets: a narrow screen, or a touch screen without a mouse (so a phone held
 * sideways still counts). Song alerts are only offered on these.
 */
export const MOBILE_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)';

export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE_QUERY).matches;
}

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(isMobileDevice);
  useEffect(() => {
    const query = window.matchMedia?.(MOBILE_QUERY);
    if (!query) return;
    const onChange = () => setMobile(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return mobile;
}
