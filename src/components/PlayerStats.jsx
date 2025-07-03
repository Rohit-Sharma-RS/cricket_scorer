import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Users, 
  Award,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const PlayerStats = ({ matchData }) => {
  const [activeTab, setActiveTab] = useState('batting');
  
  const currentInnings = matchData.currentInnings || 0;
  const battingTeam = matchData.innings[currentInnings].team === matchData.teams.team1.name ? 
    matchData.teams.team1 : matchData.teams.team2;
  const bowlingTeam = matchData.innings[currentInnings].team === matchData.teams.team1.name ? 
    matchData.teams.team2 : matchData.teams.team1;

  // Get batting stats
  const getBattingStats = () => {
    return battingTeam.players
      .filter(player => player.stats.batting.balls > 0)
      .sort((a, b) => b.stats.batting.runs - a.stats.batting.runs);
  };

  // Get bowling stats  
  const getBowlingStats = () => {
    return bowlingTeam.players
      .filter(player => player.stats.bowling.overs > 0)
      .sort((a, b) => b.stats.bowling.wickets - a.stats.bowling.wickets);
  };

  // Get fielding stats
  const getFieldingStats = () => {
    return bowlingTeam.players
      .filter(player => player.stats.fielding.catches > 0 || player.stats.fielding.runouts > 0)
      .sort((a, b) => (b.stats.fielding.catches + b.stats.fielding.runouts) - 
                      (a.stats.fielding.catches + a.stats.fielding.runouts));
  };

  // Partnership data
  const getPartnershipData = () => {
    const partnerships = [];
    const balls = matchData.innings[currentInnings].balls;
    let currentPartnership = { batsman1: null, batsman2: null, runs: 0, balls: 0 };
    
    balls.forEach(ball => {
      if (!currentPartnership.batsman1) {
        currentPartnership.batsman1 = ball.striker.name;
        currentPartnership.batsman2 = matchData.innings[currentInnings].batsmen.nonStriker?.name;
      }
      
      if (!ball.isBye && !ball.isLegBye) {
        currentPartnership.runs += ball.runs;
      }
      if (!ball.isWide && !ball.isNoBall) {
        currentPartnership.balls++;
      }
      
      if (ball.isWicket) {
        partnerships.push({ ...currentPartnership });
        currentPartnership = { batsman1: null, batsman2: null, runs: 0, balls: 0 };
      }
    });
    
    if (currentPartnership.batsman1) {
      partnerships.push(currentPartnership);
    }
    
    return partnerships;
  };

  // Run rate data for chart
  const getRunRateData = () => {
    const data = [];
    const balls = matchData.innings[currentInnings].balls;
    let cumulativeRuns = 0;
    let cumulativeOvers = 0;
    
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      cumulativeRuns += ball.runs + (ball.isWide || ball.isNoBall ? 1 : 0);
      
      if (!ball.isWide && !ball.isNoBall) {
        cumulativeOvers += 1/6;
      }
      
      if ((i + 1) % 6 === 0 || i === balls.length - 1) {
        data.push({
          over: Math.ceil(cumulativeOvers),
          runRate: cumulativeOvers > 0 ? (cumulativeRuns / cumulativeOvers).toFixed(2) : 0,
          runs: cumulativeRuns
        });
      }
    }
    
    return data;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>{battingTeam.name} - Batting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Score</span>
                <Badge variant="default" className="text-lg">
                  {matchData.innings[currentInnings].score}/{matchData.innings[currentInnings].wickets}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Overs</span>
                <Badge variant="outline">
                  {matchData.innings[currentInnings].overs.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Run Rate</span>
                <Badge variant="secondary">
                  {(matchData.innings[currentInnings].score / 
                    (Math.floor(matchData.innings[currentInnings].overs) + 
                     (matchData.innings[currentInnings].overs % 1) * 10 / 6)).toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{bowlingTeam.name} - Bowling</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Wickets Taken</span>
                <Badge variant="destructive">
                  {matchData.innings[currentInnings].wickets}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Runs Conceded</span>
                <Badge variant="outline">
                  {matchData.innings[currentInnings].score}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Economy Rate</span>
                <Badge variant="secondary">
                  {(matchData.innings[currentInnings].score / 
                    (Math.floor(matchData.innings[currentInnings].overs) + 
                     (matchData.innings[currentInnings].overs % 1) * 10 / 6)).toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="batting">Batting</TabsTrigger>
          <TabsTrigger value="bowling">Bowling</TabsTrigger>
          <TabsTrigger value="fielding">Fielding</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="batting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batting Performance</CardTitle>
              <CardDescription>Individual batting statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getBattingStats().map((player, index) => (
                  <div key={player.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span>Runs: {player.stats.batting.runs}</span>
                          <span>Balls: {player.stats.batting.balls}</span>
                          <span>SR: {player.stats.batting.strikeRate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {player.stats.batting.runs}
                        </div>
                        <div className="text-sm text-gray-500">
                          ({player.stats.batting.balls})
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm">4s: {player.stats.batting.fours}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-sm">6s: {player.stats.batting.sixes}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(player.stats.batting.strikeRate, 200)} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Strike Rate: {player.stats.batting.strikeRate}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bowling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bowling Performance</CardTitle>
              <CardDescription>Individual bowling statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getBowlingStats().map((player, index) => (
                  <div key={player.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span>Overs: {player.stats.bowling.overs}</span>
                          <span>Runs: {player.stats.bowling.runs}</span>
                          <span>Econ: {player.stats.bowling.economy}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {player.stats.bowling.wickets}
                        </div>
                        <div className="text-sm text-gray-500">
                          wickets
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium">{player.stats.bowling.overs}</div>
                        <div className="text-gray-500">Overs</div>
                      </div>
                      <div>
                        <div className="font-medium">{player.stats.bowling.runs}</div>
                        <div className="text-gray-500">Runs</div>
                      </div>
                      <div>
                        <div className="font-medium">{player.stats.bowling.economy}</div>
                        <div className="text-gray-500">Economy</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fielding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fielding Performance</CardTitle>
              <CardDescription>Catches and run-outs</CardDescription>
            </CardHeader>
            <CardContent>
              {getFieldingStats().length > 0 ? (
                <div className="space-y-4">
                  {getFieldingStats().map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{player.stats.fielding.catches}</div>
                          <div className="text-xs text-gray-500">Catches</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{player.stats.fielding.runouts}</div>
                          <div className="text-xs text-gray-500">Run-outs</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No fielding statistics yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Run Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Run Rate Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getRunRateData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="over" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="runRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Runs Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Runs Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getBattingStats().slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="stats.batting.runs"
                      nameKey="name"
                    >
                      {getBattingStats().slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Partnership Details */}
          <Card>
            <CardHeader>
              <CardTitle>Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPartnershipData().map((partnership, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">
                        {partnership.batsman1} & {partnership.batsman2}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {partnership.runs} runs
                      </Badge>
                      <Badge variant="secondary">
                        {partnership.balls} balls
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerStats;

