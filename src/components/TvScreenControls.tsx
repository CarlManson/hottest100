import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Icon } from './icons/Icon';
import { castStore, castSupported, requestCast, setCastGroup, startCast } from '../utils/cast';
import { installPromptStore, isInstalledApp, promptInstall } from '../utils/installPrompt';

const IDLE_MS = 4000;

const isAppleDevice = () =>
  /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

/**
 * Corner controls for TV mode: Cast, full screen, install, and a "Show on your TV" guide.
 * They fade out when the pointer is still so they don't sit on the big screen.
 */
export const TvScreenControls: React.FC<{ groupKey: string | null; raised?: boolean }> = ({ groupKey, raised }) => {
  const cast = useSyncExternalStore(castStore.subscribe, castStore.getSnapshot);
  const canInstall = useSyncExternalStore(installPromptStore.subscribe, installPromptStore.getSnapshot);
  const [helpOpen, setHelpOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);

  useEffect(() => { startCast(); }, []);
  useEffect(() => { setCastGroup(groupKey); }, [groupKey]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Fade out after a few seconds without pointer or keyboard activity
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, wake, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, wake));
    };
  }, []);

  const showCast = cast.status === 'ready' || cast.status === 'connecting' || cast.status === 'connected';
  const fullscreenAvailable = typeof document.documentElement.requestFullscreen === 'function';

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const castLabel = cast.status === 'connected'
    ? `On ${cast.deviceName ?? 'TV'}`
    : cast.status === 'connecting' ? 'Connecting…' : 'Cast';

  return (
    <div className={`tv-screen-controls ${raised ? 'is-raised' : ''} ${idle && !helpOpen ? 'is-idle' : ''}`}>
      <div className="tv-screen-controls-bar">
        {showCast && (
          <button
            type="button"
            className={`tv-control-button tv-cast-button ${cast.status === 'connected' ? 'is-active' : ''}`}
            onClick={requestCast}
            title={cast.status === 'connected' ? 'Casting. Click to stop or switch TV' : 'Cast TV mode to a Chromecast or Google TV'}
          >
            <Icon name="cast" /> {castLabel}
          </button>
        )}
        {fullscreenAvailable && (
          <button type="button" className="tv-control-button tv-fullscreen-button" onClick={toggleFullscreen}>
            <Icon name="fullscreen" /> {isFullscreen ? 'Exit full screen' : 'Full screen'}
          </button>
        )}
        <button
          type="button"
          className="tv-control-button tv-help-button"
          onClick={() => setHelpOpen(o => !o)}
          aria-expanded={helpOpen}
        >
          <Icon name="tv" /> Show on your TV
        </button>
      </div>

      {helpOpen && (
        <div className="tv-help-panel" role="dialog" aria-label="Show on your TV">
          <button type="button" className="tv-help-close" onClick={() => setHelpOpen(false)} aria-label="Close">
            <Icon name="close" />
          </button>
          <h3>Show on your TV</h3>

          <section>
            <h4>Chromecast or Google TV</h4>
            {showCast ? (
              <p>Tap <strong>Cast</strong> and pick your TV. The TV runs the leaderboard on its own, so your phone or laptop is free.</p>
            ) : castSupported() ? (
              <p>No Cast devices found yet. Make sure you're on the same Wi-Fi as your TV.</p>
            ) : (
              <p>Open this page in Chrome on a computer, then choose <strong>Cast…</strong> from the <strong>⋮</strong> menu and pick your TV. On Android, use <strong>Cast my screen</strong> in the Google Home app.</p>
            )}
          </section>

          <section>
            <h4>Apple TV</h4>
            <p>
              On an iPhone or iPad, open <strong>Control Centre</strong>, tap <strong>Screen Mirroring</strong> and pick your Apple TV.
              Turn your phone sideways for the full layout. Your phone needs to stay on this page, so we keep its screen awake.
              On a Mac, use <strong>Screen Mirroring</strong> in Control Centre, then go full screen.
            </p>
          </section>

          <section>
            <h4>Smart TV with a web browser</h4>
            <p>
              Type <strong>{window.location.host}/tv</strong> into the TV's browser. Older TVs get a simpler, easy-to-read
              leaderboard that refreshes itself.
            </p>
          </section>

          <section>
            <h4>No luck with the TV?</h4>
            <p>
              Plug a laptop into the TV with an HDMI cable and press <strong>Full screen</strong>, or grab a cheap
              Chromecast-style dongle and use the Cast button.
            </p>
          </section>

          {!isInstalledApp() && (
            <section>
              <h4>Install the app</h4>
              {canInstall ? (
                <p>
                  Install Fairest 100 to open it straight from your home screen, without the browser bars.{' '}
                  <button type="button" className="tv-control-button tv-install-button" onClick={() => { promptInstall(); }}>
                    <Icon name="download" /> Install
                  </button>
                </p>
              ) : isAppleDevice() ? (
                <p>In Safari, tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to open Fairest 100 like an app.</p>
              ) : (
                <p>Use your browser's <strong>Install app</strong> or <strong>Add to Home screen</strong> option to open Fairest 100 like an app.</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
