import React from 'react';
import { MatchProvider, useMatch } from './context/MatchContext';
import MatchSetup from './components/match/MatchSetup';
import TossModal from './components/modals/TossModal';
import ScoringInterface from './components/scoring/ScoringInterface';
import BowlerChangeModal from './components/modals/BowlerChangeModal';
import RetiredBatsmanModal from './components/modals/RetiredBatsmanModal';
import MatchEndModal from './components/modals/MatchEndModal';
import { Button } from './components/ui/button';
import { Moon, Sun } from 'lucide-react';
import './App.css';

function AppContent() {
  const { state, dispatch } = useMatch();

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <div className={`min-h-screen gradient-bg ${state.isDarkMode ? 'dark' : ''}`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          onClick={toggleDarkMode}
          className="glass-card btn-cricket touch-button text-white hover:bg-white/20"
        >
          {state.isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="fade-in">
        {state.matchStatus === 'setup' && <MatchSetup />}
        {state.matchStatus === 'toss' && <TossModal />}
        {state.matchStatus === 'playing' && <ScoringInterface />}
        {state.matchStatus === 'finished' && <ScoringInterface />}
      </div>

      {/* Modals */}
      <BowlerChangeModal />
      <RetiredBatsmanModal />
      <MatchEndModal />

      {/* Footer */}
      <footer className="relative bottom-0 left-0 right-0 glass-card border-t border-white/10 p-3 mt-8">
        <div className="text-center">
          <p className="text-white/70 text-sm">
            Made for fun and ❤️ by <span className="footer-text font-bold">Rohit</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <MatchProvider>
      <AppContent />
    </MatchProvider>
  );
}

export default App;

