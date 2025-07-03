import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Trophy, Users, Play, BarChart3, Award, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

// Import components
import MatchSetup from './components/MatchSetup';
import LiveScoring from './components/LiveScoring';
import MatchSummary from './components/MatchSummary';
import PlayerStats from './components/PlayerStats';

function App() {
  const [currentTab, setCurrentTab] = useState('setup');
  const [matchData, setMatchData] = useState({
    teams: {
      team1: { name: '', players: [] },
      team2: { name: '', players: [] }
    },
    toss: { winner: '', decision: '' },
    matchFormat: { overs: 20, powerplay: 6 },
    currentMatch: null,
    matchHistory: []
  });
  
  const { theme, setTheme } = useTheme();

  const handleMatchSetupComplete = (setupData) => {
    setMatchData(prev => ({
      ...prev,
      ...setupData,
      currentMatch: {
        ...setupData,
        innings: [
          { team: setupData.toss.decision === 'bat' ? setupData.toss.winner : (setupData.toss.winner === setupData.teams.team1.name ? setupData.teams.team2.name : setupData.teams.team1.name), 
            balls: [], 
            score: 0, 
            wickets: 0, 
            overs: 0,
            batsmen: { striker: null, nonStriker: null },
            bowler: null,
            completed: false
          },
          { team: setupData.toss.decision === 'bat' ? (setupData.toss.winner === setupData.teams.team1.name ? setupData.teams.team2.name : setupData.teams.team1.name) : setupData.toss.winner,
            balls: [], 
            score: 0, 
            wickets: 0, 
            overs: 0,
            batsmen: { striker: null, nonStriker: null },
            bowler: null,
            completed: false
          }
        ],
        currentInnings: 0,
        status: 'live'
      }
    }));
    setCurrentTab('scoring');
  };

  const handleMatchComplete = (completedMatch) => {
    setMatchData(prev => ({
      ...prev,
      matchHistory: [...prev.matchHistory, completedMatch],
      currentMatch: null
    }));
    setCurrentTab('summary');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cricket Scorer</h1>
              <p className="text-gray-600 dark:text-gray-300">Professional match scoring made simple</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Setup</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" disabled={!matchData.currentMatch} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Live Score</span>
            </TabsTrigger>
            <TabsTrigger value="stats" disabled={!matchData.currentMatch} className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Summary</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <MatchSetup onComplete={handleMatchSetupComplete} />
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            {matchData.currentMatch && (
              <LiveScoring 
                matchData={matchData.currentMatch} 
                onMatchComplete={handleMatchComplete}
                onMatchUpdate={(updatedMatch) => {
                  setMatchData(prev => ({
                    ...prev,
                    currentMatch: updatedMatch
                  }));
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {matchData.currentMatch && (
              <PlayerStats matchData={matchData.currentMatch} />
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <MatchSummary 
              matchHistory={matchData.matchHistory}
              onNewMatch={() => {
                setMatchData(prev => ({
                  ...prev,
                  teams: { team1: { name: '', players: [] }, team2: { name: '', players: [] } },
                  toss: { winner: '', decision: '' },
                  currentMatch: null
                }));
                setCurrentTab('setup');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

