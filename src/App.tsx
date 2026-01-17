import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { PublicHome } from './components/PublicHome';
import { VotingInterface } from './components/VotingInterface';
import { CountdownEntry } from './components/CountdownEntry';
import { Leaderboard } from './components/Leaderboard';
import { DetailedBreakdown } from './components/DetailedBreakdown';
import { Settings } from './components/Settings';
import logo from './assets/fairest-100-logo.png';
import banner from './assets/banner-bg.jpg';
import bannerRight from './assets/banner-right.png';

type Tab = 'home' | 'dashboard' | 'voting' | 'countdown' | 'leaderboard' | 'detailed-breakdown' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Get tab from URL hash
  const getTabFromHash = (): Tab => {
    const hash = window.location.hash.slice(1);
    const validTabs: Tab[] = ['home', 'dashboard', 'voting', 'countdown', 'leaderboard', 'detailed-breakdown', 'settings'];
    return validTabs.includes(hash as Tab) ? (hash as Tab) : 'home';
  };

  const updateHash = (tab: Tab) => {
    window.location.hash = tab;
  };

  // Check for existing session (localStorage and cookie) and set initial tab from URL
  useEffect(() => {
    const localAuth = localStorage.getItem('hottest100_auth');
    const sessionCookie = Cookies.get('hottest100_session');

    if (localAuth === 'true' || sessionCookie === 'authenticated') {
      setIsAuthenticated(true);
      // Sync both storage methods
      localStorage.setItem('hottest100_auth', 'true');
      Cookies.set('hottest100_session', 'authenticated', { expires: 7 });

      const tabFromHash = getTabFromHash();
      if (tabFromHash !== 'home') {
        setActiveTab(tabFromHash);
      }
    }
  }, []);

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      if (tab === 'home' || isAuthenticated) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Set both localStorage and cookie with 7-day expiration
    localStorage.setItem('hottest100_auth', 'true');
    Cookies.set('hottest100_session', 'authenticated', { expires: 7 });
    setActiveTab('dashboard');
    updateHash('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Remove both localStorage and cookie
    localStorage.removeItem('hottest100_auth');
    Cookies.remove('hottest100_session');
    setActiveTab('home');
    updateHash('home');
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === 'home') {
      setActiveTab('home');
      updateHash('home');
    } else if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setActiveTab(tab);
      updateHash(tab);
    }
    setMobileMenuOpen(false); // Close mobile menu after tab selection
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
        <header
          className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg header-with-banner"
          style={{ '--banner-image': `url(${banner})` } as React.CSSProperties}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 relative">
            <img
              className="logo cursor-pointer"
              src={logo}
              alt="Fairest 100 Logo"
              onClick={() => handleTabClick('home')}
            />
            {/* Banner right - hidden on mobile, shown on desktop */}
            <img className="banner-right hidden md:block" src={bannerRight} alt="Banner decoration" />
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

        {isAuthenticated && (
          <nav className="bg-white border-b-2 border-orange-300 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Mobile current tab label - hidden since menu is now in header */}
              {/* <div className="md:hidden py-3 text-center">
                <span className="font-bold text-gray-800">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'voting' && 'Family Votes'}
                  {activeTab === 'countdown' && 'Countdown Results'}
                  {activeTab === 'leaderboard' && 'Leaderboard'}
                </span>
              </div> */}

              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                  <button
                    onClick={() => handleTabClick('dashboard')}
                    className={`w-full text-left px-4 py-3 font-bold transition ${
                      activeTab === 'dashboard'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleTabClick('voting')}
                    className={`w-full text-left px-4 py-3 font-bold transition ${
                      activeTab === 'voting'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    Votes
                  </button>
                  <button
                    onClick={() => handleTabClick('countdown')}
                    className={`w-full text-left px-4 py-3 font-bold transition ${
                      activeTab === 'countdown'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    Countdown Results
                  </button>
                  <button
                    onClick={() => handleTabClick('leaderboard')}
                    className={`w-full text-left px-4 py-3 font-bold transition ${
                      activeTab === 'leaderboard'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    Leaderboard
                  </button>
                </div>
              )}

              {/* Desktop Menu */}
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => handleTabClick('dashboard')}
                  className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                    activeTab === 'dashboard'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleTabClick('voting')}
                  className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                    activeTab === 'voting'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Votes
                </button>
                <button
                  onClick={() => handleTabClick('countdown')}
                  className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                    activeTab === 'countdown'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Countdown Results
                </button>
                <button
                  onClick={() => handleTabClick('leaderboard')}
                  className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                    activeTab === 'leaderboard'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </nav>
        )}

        <main>
          {activeTab === 'home' && <PublicHome />}
          {activeTab === 'dashboard' && isAuthenticated && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'voting' && isAuthenticated && <VotingInterface />}
          {activeTab === 'countdown' && isAuthenticated && <CountdownEntry />}
          {activeTab === 'leaderboard' && isAuthenticated && <Leaderboard />}
          {activeTab === 'detailed-breakdown' && isAuthenticated && <DetailedBreakdown />}
          {activeTab === 'settings' && isAuthenticated && <Settings />}
        </main>

        {/* Login Modal - Shown when trying to access protected tabs */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h3>
              <p className="text-gray-600 mb-6">Enter your credentials to access admin features</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const envUsername = import.meta.env.VITE_AUTH_USERNAME;
                const envPassword = import.meta.env.VITE_AUTH_PASSWORD;

                if (username === envUsername && password === envPassword) {
                  setShowLoginModal(false);
                  setUsername('');
                  setPassword('');
                  setLoginError('');
                  handleLogin();
                } else {
                  setLoginError('Invalid username or password');
                  setPassword('');
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition"
                    placeholder="Enter username"
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition"
                    placeholder="Enter password"
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
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition shadow-lg"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setUsername('');
                      setPassword('');
                      setLoginError('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 border-t mt-12 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-white text-sm">
            <p className="font-semibold">Fairest 100: The Triple J Hottest 100 Voting Scorecard</p>
            <p className="mt-2 text-white/90 text-xs">
              Open source project • Made by Carl Manson,{' '}
              <a href="https://axiom.com.au" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                Axiom
              </a>{' '}
              • 2026
            </p>
            <div className="mt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex justify-center gap-4 flex-wrap">
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
                    Admin Login
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
      </div>
    </AppProvider>
  );
}

export default App;
