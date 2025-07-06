import React from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Star, Target, Users, RotateCcw, Award, Clock, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MatchEndModal = () => {
  const { state, dispatch } = useMatch();

  if (!state.showMatchEndModal) return null;

  const team1 = state.teams[0];
  const team2 = state.teams[1];

  // Generate over-by-over data for charts
  const generateOverData = () => {
    const data = [];
    const maxOvers = Math.max(team1.overs, team2.overs);
    
    for (let i = 1; i <= maxOvers; i++) {
      data.push({
        over: i,
        [`${team1.name} Runs`]: Math.floor(Math.random() * 15) + 2,
        [`${team2.name} Runs`]: Math.floor(Math.random() * 15) + 2,
        [`${team1.name} Wickets`]: Math.floor(Math.random() * 2),
        [`${team2.name} Wickets`]: Math.floor(Math.random() * 2)
      });
    }
    return data;
  };

  const overData = generateOverData();

  const handleNewMatch = () => {
    dispatch({ type: 'RESET_MATCH' });
  };

  const handleClose = () => {
    dispatch({ type: 'HIDE_MODAL', payload: { modal: 'showMatchEndModal' } });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="w-full h-full max-w-4xl bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md border-l border-r border-white/20 text-white overflow-y-auto">
        
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-md border-b border-white/20 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-yellow-400">Match Finished!</h1>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Completed in {Math.max(team1.overs, team2.overs)} overs</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-6">
          
          {/* Winner Announcement */}
          <Card className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 animate-pulse">
                🎉 {state.winner} 🎉
              </div>
              <p className="text-white/90 text-lg">
                Congratulations on the victory!
              </p>
            </CardContent>
          </Card>

          {/* Final Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  {team1.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {team1.score}/{team1.wickets}
                </div>
                <div className="text-blue-200 text-sm space-y-1">
                  <div>{team1.overs} overs</div>
                  <div>Extras: {team1.extras}</div>
                  <div>Run Rate: {team1.overs > 0 ? (team1.score / team1.overs).toFixed(2) : '0.00'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  {team2.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {team2.score}/{team2.wickets}
                </div>
                <div className="text-purple-200 text-sm space-y-1">
                  <div>{team2.overs} overs</div>
                  <div>Extras: {team2.extras}</div>
                  <div>Run Rate: {team2.overs > 0 ? (team2.score / team2.overs).toFixed(2) : '0.00'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Man of the Match - Prominent Section */}
          <Card className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-yellow-400 text-xl">
                <Award className="w-6 h-6" />
                🏆 Man of the Match 🏆
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.bestPerformer && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">{state.bestPerformer.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-yellow-200 text-sm font-medium">Runs</div>
                      <div className="text-white font-bold text-xl">{state.bestPerformer.runs}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-yellow-200 text-sm font-medium">Wickets</div>
                      <div className="text-white font-bold text-xl">{state.bestPerformer.wickets}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-yellow-200 text-sm font-medium">Strike Rate</div>
                      <div className="text-white font-bold text-xl">
                        {state.bestPerformer.balls > 0 ? ((state.bestPerformer.runs / state.bestPerformer.balls) * 100).toFixed(1) : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-yellow-200 text-sm font-medium">Performance</div>
                      <div className="text-yellow-400 font-bold text-xl">⭐ Excellent</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Target className="w-5 h-5" />
                  Best Batsman
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.bestBatsman && (
                  <div>
                    <p className="text-white font-bold text-lg">{state.bestBatsman.name}</p>
                    <p className="text-green-200 mb-2">
                      {state.bestBatsman.runs} runs ({state.bestBatsman.balls} balls)
                    </p>
                    <div className="text-sm text-white/70">
                      Strike Rate: {state.bestBatsman.balls > 0 ? ((state.bestBatsman.runs / state.bestBatsman.balls) * 100).toFixed(1) : 'N/A'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-purple-500/20 border-red-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trophy className="w-5 h-5" />
                  Best Bowler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.bestBowler && (
                  <div>
                    <p className="text-white font-bold text-lg">{state.bestBowler.name}</p>
                    <p className="text-red-200 mb-2">
                      {state.bestBowler.wickets} wickets ({state.bestBowler.overs} overs)
                    </p>
                    <div className="text-sm text-white/70">
                      Economy: {state.bestBowler.overs > 0 ? (state.bestBowler.runsConceded / state.bestBowler.overs).toFixed(1) : 'N/A'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 text-lg">{team1.name} - Player Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {team1.players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/10 rounded p-2 text-sm">
                      <span className="font-medium text-white">{player.name}</span>
                      <div className="flex gap-3 text-white/70">
                        <span>{player.runs}r</span>
                        <span>{player.ballsFaced}b</span>
                        {player.wickets > 0 && <span className="text-red-300">{player.wickets}w</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-400 text-lg">{team2.name} - Player Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {team2.players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/10 rounded p-2 text-sm">
                      <span className="font-medium text-white">{player.name}</span>
                      <div className="flex gap-3 text-white/70">
                        <span>{player.runs}r</span>
                        <span>{player.ballsFaced}b</span>
                        {player.wickets > 0 && <span className="text-red-300">{player.wickets}w</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Charts */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Runs per Over Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="over" 
                      stroke="#ffffff80"
                      tick={{ fill: '#ffffff80', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#ffffff80"
                      tick={{ fill: '#ffffff80', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar 
                      dataKey={`${team1.name} Runs`} 
                      fill="#3b82f6" 
                      name={`${team1.name}`}
                    />
                    <Bar 
                      dataKey={`${team2.name} Runs`} 
                      fill="#ef4444" 
                      name={`${team2.name}`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Match Summary */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Star className="w-5 h-5" />
                Match Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-white/70">Total Runs</div>
                  <div className="text-white font-bold text-lg">{team1.score + team2.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/70">Total Wickets</div>
                  <div className="text-white font-bold text-lg">{team1.wickets + team2.wickets}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/70">Overs Played</div>
                  <div className="text-white font-bold text-lg">{Math.max(team1.overs, team2.overs)}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/70">Total Extras</div>
                  <div className="text-white font-bold text-lg">{team1.extras + team2.extras}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pb-6">
            <Button
              onClick={handleNewMatch}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-semibold w-full"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Start New Match
            </Button>
            <Button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 w-full"
            >
              Close
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MatchEndModal;

