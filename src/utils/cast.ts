// Google Cast sender: loads Google's Web Sender SDK on demand and exposes a tiny store
// that TV mode subscribes to. The receiver lives at /cast-receiver.html.

import { brand } from '../config/brand';

/** Custom message channel shared with public/cast-receiver.html. */
export const CAST_NAMESPACE = 'urn:x-cast:au.fairest100.tv';

const SENDER_SDK = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

export type CastStatus = 'unsupported' | 'loading' | 'no-devices' | 'ready' | 'connecting' | 'connected';

export interface CastSnapshot {
  status: CastStatus;
  deviceName: string | null;
}

// Just enough of the Cast sender API for our needs.
interface CastSession {
  sendMessage(namespace: string, message: unknown): Promise<unknown>;
  getCastDevice(): { friendlyName: string };
}
interface CastContextInstance {
  setOptions(options: Record<string, unknown>): void;
  addEventListener(type: string, handler: (event: { castState?: string; sessionState?: string }) => void): void;
  getCastState(): string;
  getCurrentSession(): CastSession | null;
  requestSession(): Promise<unknown>;
  endCurrentSession(stopCasting: boolean): void;
}
interface CastWindow {
  __onGCastApiAvailable?: (available: boolean) => void;
  cast?: {
    framework: {
      CastContext: { getInstance(): CastContextInstance };
      CastContextEventType: { CAST_STATE_CHANGED: string; SESSION_STATE_CHANGED: string };
      SessionState: { SESSION_STARTED: string; SESSION_RESUMED: string };
    };
  };
  chrome?: { cast?: { AutoJoinPolicy: { ORIGIN_SCOPED: string } } };
}

const castWindow = () => window as unknown as CastWindow;

let snapshot: CastSnapshot = { status: 'unsupported', deviceName: null };
let started = false;
let groupKey: string | null = null;
const listeners = new Set<() => void>();

const setSnapshot = (next: Partial<CastSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  listeners.forEach(l => l());
};

/** Cast works in Chrome and Edge on desktop and Android, not on iOS or in Safari/Firefox. */
export function castSupported(): boolean {
  if (!brand.castAppId || typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return false;
  // iPadOS reports itself as a Mac with touch
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return false;
  return 'chrome' in window;
}

/** Whether this page is running on the TV itself (inside the Cast receiver). */
export function isCastReceiver(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('receiver') === 'cast';
  } catch {
    return false;
  }
}

const mapState = (state: string): CastStatus => {
  switch (state) {
    case 'NO_DEVICES_AVAILABLE': return 'no-devices';
    case 'CONNECTING': return 'connecting';
    case 'CONNECTED': return 'connected';
    default: return 'ready';
  }
};

const context = () => castWindow().cast?.framework.CastContext.getInstance() ?? null;

const sendGroup = () => {
  const session = context()?.getCurrentSession();
  if (!session) return;
  session.sendMessage(CAST_NAMESPACE, { group: groupKey }).catch(() => {
    // The TV keeps showing whatever it had; nothing useful to do here
  });
};

const syncFromContext = () => {
  const ctx = context();
  if (!ctx) return;
  const status = mapState(ctx.getCastState());
  const session = ctx.getCurrentSession();
  setSnapshot({ status, deviceName: status === 'connected' && session ? session.getCastDevice().friendlyName : null });
};

function init() {
  const w = castWindow();
  const framework = w.cast?.framework;
  const ctx = context();
  if (!framework || !ctx) {
    setSnapshot({ status: 'unsupported' });
    return;
  }
  ctx.setOptions({
    receiverApplicationId: brand.castAppId,
    autoJoinPolicy: w.chrome?.cast?.AutoJoinPolicy.ORIGIN_SCOPED ?? 'origin_scoped',
  });
  ctx.addEventListener(framework.CastContextEventType.CAST_STATE_CHANGED, syncFromContext);
  ctx.addEventListener(framework.CastContextEventType.SESSION_STATE_CHANGED, event => {
    if (event.sessionState === framework.SessionState.SESSION_STARTED || event.sessionState === framework.SessionState.SESSION_RESUMED) {
      sendGroup();
    }
    syncFromContext();
  });
  syncFromContext();
}

/** Load the sender SDK once. Safe to call repeatedly. */
export function startCast() {
  if (started || !castSupported()) return;
  started = true;
  setSnapshot({ status: 'loading' });
  const w = castWindow();
  w.__onGCastApiAvailable = available => {
    if (available) init();
    else setSnapshot({ status: 'unsupported' });
  };
  const script = document.createElement('script');
  script.src = SENDER_SDK;
  script.async = true;
  script.onerror = () => setSnapshot({ status: 'unsupported' });
  document.head.appendChild(script);
}

export const castStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  getSnapshot: () => snapshot,
};

/** Open Chrome's device picker (or the "stop casting" dialog when already casting). */
export function requestCast() {
  context()?.requestSession().catch(() => {
    // Cancelled by the user, or no device picked
  });
}

/** Tell the TV which group to show. Sent now if casting, and again whenever a session starts. */
export function setCastGroup(key: string | null) {
  if (key === groupKey) return;
  groupKey = key;
  if (snapshot.status === 'connected') sendGroup();
}
