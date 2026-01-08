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

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'hottest100';

  // Check for existing session cookie on mount
  useEffect(() => {
    const sessionCookie = Cookies.get('hottest100_session');
    if (sessionCookie === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

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
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Remove session cookie
    Cookies.remove('hottest100_session');
    setActiveTab('home');
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === 'home') {
      setActiveTab('home');
    } else if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
        <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg" style={{ backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <img className="logo" src={logo} alt="Fairest 100 Logo" style={{ width: '100%', maxWidth: '25rem', height: 'auto' }} />
            <img className="banner-right" src={bannerRight}  style={{ width: '25%', height: 'auto', position: 'absolute', top: '0', right: '0', transform: 'translateY(-25%)' }} />
          </div>
        </header>

        {isAuthenticated && (
          <nav className="bg-white border-b-2 border-orange-300 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex gap-2 overflow-x-auto">
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
