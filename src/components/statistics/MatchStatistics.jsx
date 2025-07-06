import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Award } from 'lucide-react';
import { calculateStrikeRate, calculateEconomyRate, calculateRunRate } from '../../utils/matchUtils';

const MatchStatistics = ({ teams, matchHistory, oversPerInnings }) => {
  const team1 = teams[0];
  const team2 = teams[1];

  // Generate over-by-over data
  const overData = [];
  const maxOvers = Math.max(team1.overs || 0, team2.overs || 0);
  
  for (let i = 1; i <= maxOvers; i++) {
    const team1Over = matchHistory.team1OverData?.[i - 1] || { runs: 0, wickets: 0 };
    const team2Over = matchHistory.team2OverData?.[i - 1] || { runs: 0, wickets: 0 };
    
    overData.push({
      over: i,
      [`${team1.name} Runs`]: team1Over.runs,
      [`${team2.name} Runs`]: team2Over.runs,
      [`${team1.name} Wickets`]: team1Over.wickets,
      [`${team2.name} Wickets`]: team2Over.wickets
    });
  }

  // Generate run rate progression
  const runRateData = [];
  let team1CumulativeRuns = 0;
  let team2CumulativeRuns = 0;
  
  for (let i = 1; i <= maxOvers; i++) {
    const team1Over = matchHistory.team1OverData?.[i - 1] || { runs: 0 };
    const team2Over = matchHistory.team2OverData?.[i - 1] || { runs: 0 };
    
    team1CumulativeRuns += team1Over.runs;
    team2CumulativeRuns += team2Over.runs;
    
    runRateData.push({
      over: i,
      [`${team1.name} Run Rate`]: calculateRunRate(team1CumulativeRuns, i - 1, 6),
      [`${team2.name} Run Rate`]: calculateRunRate(team2CumulativeRuns, i - 1, 6)
    });
  }

  // Top performers
  const allPlayers = [...team1.players, ...team2.players];
  const topBatsmen = allPlayers
    .filter(p => p.runs > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 5);
  
  const topBowlers = allPlayers
    .filter(p => p.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Team Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5" />
              {team1.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Score:</span>
              <span className="text-2xl font-bold text-white">{team1.score}/{team1.wickets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Overs:</span>
              <span className="text-white">{team1.overs}.{team1.balls || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Run Rate:</span>
              <span className="text-white">{calculateRunRate(team1.score, team1.overs, team1.balls || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Extras:</span>
              <span className="text-white">{team1.extras || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5" />
              {team2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Score:</span>
              <span className="text-2xl font-bold text-white">{team2.score}/{team2.wickets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Overs:</span>
              <span className="text-white">{team2.overs}.{team2.balls || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Run Rate:</span>
              <span className="text-white">{calculateRunRate(team2.score, team2.overs, team2.balls || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Extras:</span>
              <span className="text-white">{team2.extras || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runs per Over Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Runs per Over
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="over" 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <YAxis 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey={`${team1.name} Runs`} 
                  fill="#3b82f6" 
                  name={`${team1.name} Runs`}
                />
                <Bar 
                  dataKey={`${team2.name} Runs`} 
                  fill="#ef4444" 
                  name={`${team2.name} Runs`}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Wickets per Over Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Wickets per Over
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="over" 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <YAxis 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey={`${team1.name} Wickets`} 
                  fill="#10b981" 
                  name={`${team1.name} Wickets`}
                />
                <Bar 
                  dataKey={`${team2.name} Wickets`} 
                  fill="#f59e0b" 
                  name={`${team2.name} Wickets`}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Run Rate Progression */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Run Rate Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="over" 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <YAxis 
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff80' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={`${team1.name} Run Rate`} 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name={`${team1.name} Run Rate`}
                />
                <Line 
                  type="monotone" 
                  dataKey={`${team2.name} Run Rate`} 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name={`${team2.name} Run Rate`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5" />
              Top Batsmen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBatsmen.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-500 text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-white font-medium">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{player.runs} runs</div>
                  <div className="text-white/70 text-sm">
                    SR: {calculateStrikeRate(player.runs, player.balls)}
                  </div>
                </div>
              </div>
            ))}
            {topBatsmen.length === 0 && (
              <p className="text-white/70 text-center py-4">No batting statistics yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5" />
              Top Bowlers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBowlers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-white font-medium">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{player.wickets} wickets</div>
                  <div className="text-white/70 text-sm">
                    Econ: {calculateEconomyRate(player.runsConceded || 0, player.overs || 0)}
                  </div>
                </div>
              </div>
            ))}
            {topBowlers.length === 0 && (
              <p className="text-white/70 text-center py-4">No bowling statistics yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchStatistics;

