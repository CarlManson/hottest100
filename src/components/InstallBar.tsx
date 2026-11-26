import React, { useState, useSyncExternalStore } from 'react';
import { brand } from '../config/brand';
import { Icon } from './icons/Icon';
import { installPromptStore, isAndroid, isInstalledApp, isIos, promptInstall } from '../utils/installPrompt';

type InstallMode = 'prompt' | 'ios' | 'android' | 'none';

/**
 * 'prompt' when the browser offers its own install dialog, 'ios' for Safari's Share menu,
 * 'android' for the browser menu (Chrome holds back its dialog until the site has had some use), else 'none'
 */
function useInstallMode(): InstallMode {
  const canPrompt = useSyncExternalStore(installPromptStore.subscribe, installPromptStore.getSnapshot);
  if (isInstalledApp()) return 'none';
  if (canPrompt) return 'prompt';
  if (isIos()) return 'ios';
  return isAndroid() ? 'android' : 'none';
}

const DISMISS_KEY = 'install_bar_dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

/** The iOS Share symbol (a box with an arrow out the top), so people can spot it in Safari */
const ShareGlyph: React.FC = () => (
  <svg
    className="install-share-glyph inline-block align-[-0.2em] mx-0.5"
    width="1.15em"
    height="1.15em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Share"
  >
    <path d="M8.5 9.5H7a1.5 1.5 0 0 0-1.5 1.5v8.5A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V11A1.5 1.5 0 0 0 17 9.5h-1.5" />
    <path d="M12 14.5V2.5M8.5 6 12 2.5 15.5 6" />
  </svg>
);

export const IosInstallSteps: React.FC = () => (
  <>Tap Share <ShareGlyph /> in Safari, then <strong>Add to Home Screen</strong>.</>
);

export const AndroidInstallSteps: React.FC = () => (
  <>Tap the menu <strong aria-label="menu">⋮</strong> in your browser, then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</>
);

const ManualSteps: React.FC<{ mode: InstallMode }> = ({ mode }) =>
  mode === 'ios' ? <IosInstallSteps /> : <AndroidInstallSteps />;

/** Dismissible prompt to add the site to the home screen as an app */
export const InstallBar: React.FC = () => {
  const mode = useInstallMode();
  const [dismissed, setDismissed] = useState(readDismissed);
  if (mode === 'none' || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Storage unavailable: stays dismissed for this visit
    }
  };

  return (
    <div role="region" aria-label="Install the app" className="install-bar relative z-10 bg-surface text-white border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <img src={brand.images.appIcon} alt="" className="install-bar-icon w-7 h-7 rounded-md shrink-0" />
        <p className="install-bar-message flex-1 min-w-[12rem]">
          {mode === 'prompt'
            ? <>Get {brand.appName} on your home screen. It opens full screen, like an app.</>
            : <>Get {brand.appName} on your home screen. <ManualSteps mode={mode} /></>}
        </p>
        {mode === 'prompt' && (
          <button
            onClick={() => { void promptInstall(); }}
            className="install-bar-action shrink-0 px-3 py-1 rounded-full bg-primary-500 hover:bg-primary-600 font-semibold text-xs sm:text-sm transition"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          className="install-bar-dismiss shrink-0 w-7 h-7 rounded-full hover:bg-white/10 transition"
          aria-label="Dismiss"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
};

/** Footer link, so the app can still be installed after the bar is dismissed */
export const FooterInstall: React.FC = () => {
  const mode = useInstallMode();
  const [showSteps, setShowSteps] = useState(false);
  if (mode === 'none') return null;

  return (
    <div className="footer-install">
      <button
        onClick={() => (mode === 'prompt' ? void promptInstall() : setShowSteps(!showSteps))}
        className="text-white/90 hover:text-white underline font-medium"
        aria-expanded={mode === 'prompt' ? undefined : showSteps}
      >
        Install the app
      </button>
      {showSteps && mode !== 'prompt' && <p className="mt-1 text-white/90 text-xs"><ManualSteps mode={mode} /></p>}
    </div>
  );
};
