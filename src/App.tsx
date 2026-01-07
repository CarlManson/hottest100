import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { SongManager } from './components/SongManager';
import { VotingInterface } from './components/VotingInterface';
import { CountdownEntry } from './components/CountdownEntry';
import { Leaderboard } from './components/Leaderboard';

type Tab = 'songs' | 'voting' | 'countdown' | 'leaderboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('songs');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
        <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-5xl font-black text-white drop-shadow-lg">
              🔥 HOTTEST 100 🔥
            </h1>
            <p className="text-white/90 mt-2 font-semibold">Family Voting Tracker</p>
          </div>
        </header>

        <nav className="bg-white border-b-2 border-orange-300 shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('songs')}
                className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                  activeTab === 'songs'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-100'
                }`}
              >
                Manage Songs
              </button>
              <button
                onClick={() => setActiveTab('voting')}
                className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                  activeTab === 'voting'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-100'
                }`}
              >
                Family Votes
              </button>
              <button
                onClick={() => setActiveTab('countdown')}
                className={`px-6 py-4 font-bold transition whitespace-nowrap rounded-t-lg ${
                  activeTab === 'countdown'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-100'
                }`}
              >
                Countdown Results
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
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

        <main className="py-8">
          {activeTab === 'songs' && <SongManager />}
          {activeTab === 'voting' && <VotingInterface />}
          {activeTab === 'countdown' && <CountdownEntry />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </main>

        <footer className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 border-t mt-12 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-white text-sm">
            <p className="font-semibold">Triple J Hottest 100 Family Tracker</p>
            <p className="mt-1 text-white/80">Data is saved in your browser's local storage</p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
