import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLE_LABELS } from './utils/auth';
import { PublicHome } from './components/PublicHome';
import { TVMode } from './components/TVMode';
import { VotingInterface } from './components/VotingInterface';
import { CountdownEntry } from './components/CountdownEntry';
import { Leaderboard } from './components/Leaderboard';
import { DetailedBreakdown } from './components/DetailedBreakdown';
import { Settings } from './components/Settings';
import { Archive } from './components/Archive';
import { AlertsBar, AlertsMemberSelect, ALERTS_SUMMARY } from './components/AlertsBar';
import { InstallBar, FooterInstall } from './components/InstallBar';
import { useResultNotifications } from './utils/useResultNotifications';
import { useCountdownSettings, useCountdownDateReached } from './hooks/useCountdownSettings';
import { brand } from './config/brand';
import { Icon } from './components/icons/Icon';

type Tab = 'home' | 'tv' | 'voting' | 'countdown' | 'leaderboard' | 'detailed-breakdown' | 'settings' | 'archive';

function AppContent() {
  const { archives, songs, countdownResults, hottest200Results, familyMembers, loading } = useApp();
  // Single instance so each reveal notifies once, whichever page is open
  const { countdownDate } = useCountdownSettings();
  const notifications = useResultNotifications(songs, countdownResults, hottest200Results, familyMembers, countdownDate, !loading);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { ready: authReady, role, isAdmin, isSignedIn: isAuthenticated, signIn, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const hasArchives = archives.length > 0;

  // The Admin always sees Countdown and Leaderboard. For the Host they stay out of the menu
  // until the countdown starts (date reached or first result entered); #countdown and
  // #leaderboard still open for testing, and Settings → Event links to them.
  const countdownDateReached = useCountdownDateReached();
  const countdownUnderway = countdownDateReached || countdownResults.length > 0 || hottest200Results.length > 0;
  const showCountdownTab = isAdmin || countdownUnderway || activeTab === 'countdown';
  const showLeaderboardTab = isAdmin || countdownUnderway || activeTab === 'leaderboard' || activeTab === 'detailed-breakdown';

  // Get tab from URL hash
  const getTabFromHash = (): Tab => {
    const hash = window.location.hash.slice(1);
    // The old Dashboard page was retired; send old #dashboard links to home
    if (hash === 'dashboard') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#home`);
      return 'home';
    }
    const validTabs: Tab[] = ['home', 'tv', 'voting', 'countdown', 'leaderboard', 'detailed-breakdown', 'settings', 'archive'];
    return validTabs.includes(hash as Tab) ? (hash as Tab) : 'home';
  };

  const updateHash = (tab: Tab) => {
    window.location.hash = tab;
  };

  // Once the saved login (if any) has been checked, open the page in the URL
  useEffect(() => {
    if (!authReady) return;
    const tabFromHash = getTabFromHash();
    if (tabFromHash === 'home' || tabFromHash === 'tv' || isAuthenticated) {
      setActiveTab(tabFromHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  // Logged out (here or in another tab): leave pages that need a login
  useEffect(() => {
    if (authReady && !isAuthenticated && activeTab !== 'home' && activeTab !== 'tv') {
      setActiveTab('home');
      updateHash('home');
    }
  }, [authReady, isAuthenticated, activeTab]);

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      // Allow access to home and tv without authentication
      if (tab === 'home' || tab === 'tv' || isAuthenticated) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setActiveTab('home');
    updateHash('home');
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('home');
    updateHash('home');
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleTabClick = (tab: Tab) => {
    // Allow access to home and tv without authentication
    if (tab === 'home' || tab === 'tv') {
      setActiveTab(tab);
      updateHash(tab);
    } else if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setActiveTab(tab);
      updateHash(tab);
    }
    setMobileMenuOpen(false); // Close mobile menu after tab selection
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-red-50 to-purple-50">
        {/* Hide header for TV mode */}
        {activeTab !== 'tv' && (
        <header
          className="bg-gradient-to-r from-primary-500 via-tertiary-500 to-secondary-500 shadow-lg header-with-banner"
          style={{ '--banner-image': `url(${brand.images.background})` } as React.CSSProperties}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 relative">
            <img
              className="logo cursor-pointer"
              src={brand.images.logo}
              alt={`${brand.appName} logo`}
              onClick={() => handleTabClick('home')}
            />
            {/* Banner right - hidden on mobile, shown on desktop */}
            {brand.images.mascot && <img className="banner-right hidden md:block pointer-events-none" src={brand.images.mascot} alt="" />}
            {/* Mobile menu button - shown on mobile when authenticated */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </header>
        )}

        {/* Hide nav menu for TV mode */}
        {activeTab !== 'tv' && isAuthenticated && (
          <nav id="main-menu" className="sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Mobile current tab label - hidden since menu is now in header */}
              {/* <div className="md:hidden py-3 text-center">
                <span className="font-bold text-gray-800">
                  {activeTab === 'voting' && 'Family Votes'}
                  {activeTab === 'countdown' && 'Countdown'}
                  {activeTab === 'leaderboard' && 'Leaderboard'}
                </span>
              </div> */}

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="mobile-menu md:hidden mobile-menu">
                  <button
                    onClick={() => handleTabClick('home')}
                    className={`menu-link ${
                      activeTab === 'home'
                        ? 'active'
                        : ''
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleTabClick('voting')}
                    className={`menu-link ${
                      activeTab === 'voting'
                        ? 'active'
                        : ''
                    }`}
                  >
                    Mates &amp; Picks
                  </button>
                  <button
                    onClick={() => handleTabClick('countdown')}
                    hidden={!showCountdownTab}
                                        className={`menu-link ${
                      activeTab === 'countdown'
                        ? 'active'
                        : ''
                    }`}
                  >
                    Countdown
                  </button>
                  <button
                    onClick={() => handleTabClick('leaderboard')}
                    hidden={!showLeaderboardTab}
                                        className={`menu-link ${
                      activeTab === 'leaderboard'
                        ? 'active'
                        : ''
                    }`}
                  >
                    Leaderboard
                  </button>
                  {hasArchives && (
                    <button
                      onClick={() => handleTabClick('archive')}
                      className={`menu-link ${
                        activeTab === 'archive'
                          ? 'active'
                          : ''
                      }`}
                    >
                      Archive
                    </button>
                  )}
                  <a href="#tv" className="menu-link nav-tv-link text-center" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="tv" /> TV Mode
                  </a>
                </div>
              )}

              {/* Desktop Menu */}
              <div className="desktop-menu hidden md:flex gap-2">
                <button
                  onClick={() => handleTabClick('home')}
                  className={`menu-link ${
                    activeTab === 'home'
                      ? 'active'
                      : ''
                  }`}
                >
                  Home
                </button>
                
                <button
                  onClick={() => handleTabClick('voting')}
                  className={`menu-link whitespace-nowrap ${
                    activeTab === 'voting'
                      ? 'active'
                      : ''
                  }`}
                >
                  Mates &amp; Picks
                </button>
                <button
                  onClick={() => handleTabClick('countdown')}
                  hidden={!showCountdownTab}
                                    className={`menu-link ${
                    activeTab === 'countdown'
                      ? 'active'
                      : ''
                  }`}
                >
                  Countdown
                </button>
                <button
                  onClick={() => handleTabClick('leaderboard')}
                  hidden={!showLeaderboardTab}
                                    className={`menu-link ${
                    activeTab === 'leaderboard'
                      ? 'active'
                      : ''
                  }`}
                >
                  Leaderboard
                </button>
                {/* Archive + TV Mode - pinned to the far right */}
                <div className="nav-right ml-auto flex items-center gap-2">
                  {hasArchives && (
                    <button
                      onClick={() => handleTabClick('archive')}
                      className={`menu-link ${
                        activeTab === 'archive'
                          ? 'active'
                          : ''
                      }`}
                    >
                      Archive
                    </button>
                  )}
                  <a href="#tv" className="menu-link nav-tv-link whitespace-nowrap">
                    <Icon name="tv" /> TV Mode
                  </a>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main>
          {activeTab === 'home' && <AlertsBar notifications={notifications} members={familyMembers} />}
          {activeTab === 'home' && <InstallBar />}
          {activeTab === 'home' && <PublicHome showTvButton={!isAuthenticated} onLoginClick={isAuthenticated ? undefined : () => setShowLoginModal(true)} onVoteClick={() => handleTabClick('voting')} />}
          {activeTab === 'tv' && <TVMode />}
          {activeTab === 'voting' && isAuthenticated && <VotingInterface />}
          {activeTab === 'countdown' && isAuthenticated && <CountdownEntry />}
          {activeTab === 'leaderboard' && isAuthenticated && <Leaderboard />}
          {activeTab === 'detailed-breakdown' && isAuthenticated && <DetailedBreakdown />}
          {activeTab === 'settings' && isAuthenticated && <Settings />}
          {activeTab === 'archive' && isAuthenticated && hasArchives && <Archive />}
        </main>

        {/* Login Modal - Shown when trying to access protected tabs */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Log in</h3>
              <p className="text-gray-600 mb-6">For the Admin or Host. Everyone else can follow along without logging in.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSigningIn(true);
                setLoginError('');
                const error = await signIn(username, password);
                setSigningIn(false);
                if (error) {
                  setLoginError(error);
                  setPassword('');
                } else {
                  closeLoginModal();
                  handleLogin();
                }
              }} className="space-y-4">
                <div>
                  <label htmlFor="modal-username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="modal-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition"
                    placeholder="Enter username"
                    autoComplete="username"
                    autoCapitalize="none"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="modal-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="modal-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {loginError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={signingIn}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold py-3 px-6 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition shadow-lg disabled:opacity-60"
                  >
                    {signingIn ? 'Logging in…' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={closeLoginModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hide footer for TV mode */}
        {activeTab !== 'tv' && (
        <footer className="bg-gradient-to-r from-primary-500 via-tertiary-500 to-secondary-500 border-t mt-12 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-white text-sm">
            <p className="font-semibold">{brand.appName}: {brand.tagline}</p>
            <p className="mt-2 text-white/90 text-xs">
              Open source project • Made by Carl Manson,{' '}
              <a href="https://axiom.com.au" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                Axiom
              </a>{' '}
              • © {new Date().getFullYear()}
            </p>
            <div className="mt-4 space-y-2">
              <FooterInstall />
              {notifications.supported && !notifications.blocked && (
                <div className="footer-alerts flex justify-center items-center gap-3 flex-wrap">
                  <button
                    onClick={notifications.toggle}
                    title={ALERTS_SUMMARY}
                    className="text-white/90 hover:text-white underline font-medium"
                  >
                    Song alerts: {notifications.enabled ? 'on' : 'off'}
                  </button>
                  {notifications.enabled && (
                    <AlertsMemberSelect
                      notifications={notifications}
                      members={familyMembers}
                      className="bg-white/15 rounded-full px-3 py-1 text-xs text-white"
                    />
                  )}
                </div>
              )}
              {isAuthenticated ? (
                <>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {role && <span className="footer-role text-white/80">Logged in as {ROLE_LABELS[role]}</span>}
                    {role && <span className="text-white/60">•</span>}
                    <button
                      onClick={() => handleTabClick('settings')}
                      className="text-white/90 hover:text-white underline font-medium"
                    >
                      Settings
                    </button>
                    <span className="text-white/60">•</span>
                    <button
                      onClick={handleLogout}
                      className="text-white/90 hover:text-white underline font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-white/90 hover:text-white underline font-medium"
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 text-white/70 text-xs max-w-2xl mx-auto">
              <p><strong>Before You Start Whinging:</strong> Righto, settle down. Here's the deal. We are not the ABC. We are not Triple J. We're just a bunch of legends who finally realized that trying to update a bloody spreadsheet with greasy sausage-roll fingers is a sh*t idea.</p>
              <p>I built this so we can figure out who picked the best bangers without fighting over who broke the formulas or deleted the rows by accident.</p>
              <p>This is 100% unofficial. If you try to sue me over this, the only thing you're getting is a kick up the arse and a face full of flies.</p>
              <p>Play fair, don't be a d*ckhead, and turn the volume up.</p>
            </div>
          </div>
        </footer>
        )}
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
