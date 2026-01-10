import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { PublicHome } from './components/PublicHome';
import { SongManager } from './components/SongManager';
import { VotingInterface } from './components/VotingInterface';
import { CountdownEntry } from './components/CountdownEntry';
import { Leaderboard } from './components/Leaderboard';
import logo from './assets/fairest-100-logo.png';
import banner from './assets/banner-bg.jpg';
import bannerRight from './assets/banner-right.png';

type Tab = 'home' | 'dashboard' | 'songs' | 'voting' | 'countdown' | 'leaderboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'hottest100';

  // Get tab from URL hash
  const getTabFromHash = (): Tab => {
    const hash = window.location.hash.slice(1);
    const validTabs: Tab[] = ['home', 'dashboard', 'songs', 'voting', 'countdown', 'leaderboard'];
    return validTabs.includes(hash as Tab) ? (hash as Tab) : 'home';
  };

  const updateHash = (tab: Tab) => {
    window.location.hash = tab;
  };

  // Check for existing session cookie and set initial tab from URL
  useEffect(() => {
    const sessionCookie = Cookies.get('hottest100_session');
    if (sessionCookie === 'authenticated') {
      setIsAuthenticated(true);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      // Set cookie with 7-day expiration
      Cookies.set('hottest100_session', 'authenticated', { expires: 7 });
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
      setActiveTab('dashboard');
      updateHash('dashboard');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Remove session cookie
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
        <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg" style={{ backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="max-w-7xl mx-auto px-6 py-6 relative">
            <img className="logo" src={logo} alt="Fairest 100 Logo" style={{ width: '100%', maxWidth: '25rem', height: 'auto' }} />
            {/* Banner right - hidden on mobile, shown on desktop */}
            <img className="banner-right hidden md:block" src={bannerRight}  style={{ width: '25%', height: 'auto', position: 'absolute', top: '0', right: '0', transform: 'translateY(-25%)' }} />
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
                    Family Votes
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
                  Family Votes
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

        <main className="py-8">
          {activeTab === 'home' && <PublicHome />}
          {activeTab === 'dashboard' && isAuthenticated && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'songs' && isAuthenticated && <SongManager />}
          {activeTab === 'voting' && isAuthenticated && <VotingInterface />}
          {activeTab === 'countdown' && isAuthenticated && <CountdownEntry />}
          {activeTab === 'leaderboard' && isAuthenticated && <Leaderboard />}
        </main>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h3>
              <p className="text-gray-600 mb-6">Enter password to access admin features</p>
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-orange-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-600 text-sm mb-4">{loginError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-bold"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
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
            <p className="font-semibold">Fairest 100: The Triple J Hottest 100 Family Tracker</p>
            <p className="mt-1 text-white/80">Real-time family voting tracker with cloud sync</p>
            <div className="mt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div>
                    <button
                      onClick={() => handleTabClick('songs')}
                      className="text-white/90 hover:text-white underline font-medium"
                    >
                      Manage Songs
                    </button>
                  </div>
                  <div>
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
