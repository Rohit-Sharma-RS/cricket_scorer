import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Clock, Play, Plus, Minus } from 'lucide-react';

const MatchSetup = () => {
  const { dispatch } = useMatch();
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  const [team1Players, setTeam1Players] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']);
  const [team2Players, setTeam2Players] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']);
  const [oversPerInnings, setOversPerInnings] = useState(20);

  const handlePlayerChange = (teamIndex, playerIndex, value) => {
    if (teamIndex === 1) {
      const newPlayers = [...team1Players];
      newPlayers[playerIndex] = value;
      setTeam1Players(newPlayers);
    } else {
      const newPlayers = [...team2Players];
      newPlayers[playerIndex] = value;
      setTeam2Players(newPlayers);
    }
  };

  const addPlayer = (teamIndex) => {
    if (teamIndex === 1) {
      setTeam1Players([...team1Players, `Player ${team1Players.length + 1}`]);
    } else {
      setTeam2Players([...team2Players, `Player ${team2Players.length + 1}`]);
    }
  };

  const removePlayer = (teamIndex, playerIndex) => {
    if (teamIndex === 1 && team1Players.length > 2) {
      const newPlayers = team1Players.filter((_, index) => index !== playerIndex);
      setTeam1Players(newPlayers);
    } else if (teamIndex === 2 && team2Players.length > 2) {
      const newPlayers = team2Players.filter((_, index) => index !== playerIndex);
      setTeam2Players(newPlayers);
    }
  };

  const handleStartMatch = () => {
    const team1 = {
      id: 1,
      name: team1Name,
      players: team1Players.map((name, index) => ({
        id: `t1p${index}`,
        name: name || `Player ${index + 1}`,
        runs: 0,
        balls: 0,
        wickets: 0,
        overs: 0,
        isOut: false,
        isRetired: false
      })),
      score: 0,
      wickets: 0,
      extras: 0,
      overs: 0
    };

    const team2 = {
      id: 2,
      name: team2Name,
      players: team2Players.map((name, index) => ({
        id: `t2p${index}`,
        name: name || `Player ${index + 1}`,
        runs: 0,
        balls: 0,
        wickets: 0,
        overs: 0,
        isOut: false,
        isRetired: false
      })),
      score: 0,
      wickets: 0,
      extras: 0,
      overs: 0
    };

    const match = {
      id: Date.now(),
      oversPerInnings,
      currentInnings: 1,
      matchStatus: 'toss'
    };

    dispatch({
      type: 'SET_MATCH_SETUP',
      payload: { match, teams: [team1, team2] }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cricket Scorer</h1>
          <p className="text-blue-200">Professional Cricket Scoring Application</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Team 1 Setup */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Team 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Team 1 Name"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/80">Players</h4>
                  <Button
                    onClick={() => addPlayer(1)}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-8 px-3 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Player
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {team1Players.map((player, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Player ${index + 1}`}
                        value={player}
                        onChange={(e) => handlePlayerChange(1, index, e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 text-sm flex-1"
                      />
                      {team1Players.length > 2 && (
                        <Button
                          onClick={() => removePlayer(1, index)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/60">Minimum 2 players required</p>
              </div>
            </CardContent>
          </Card>

          {/* Team 2 Setup */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Team 2
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Team 2 Name"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/80">Players</h4>
                  <Button
                    onClick={() => addPlayer(2)}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-8 px-3 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Player
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {team2Players.map((player, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Player ${index + 1}`}
                        value={player}
                        onChange={(e) => handlePlayerChange(2, index, e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 text-sm flex-1"
                      />
                      {team2Players.length > 2 && (
                        <Button
                          onClick={() => removePlayer(2, index)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/60">Minimum 2 players required</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Settings */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5" />
              Match Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Overs per Innings:</label>
              <Select value={oversPerInnings.toString()} onValueChange={(value) => setOversPerInnings(parseInt(value))}>
                <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Overs</SelectItem>
                  <SelectItem value="4">4 Overs</SelectItem>
                  <SelectItem value="6">6 Overs</SelectItem>
                  <SelectItem value="8">8 Overs</SelectItem>
                  <SelectItem value="10">10 Overs</SelectItem>
                  <SelectItem value="12">12 Overs</SelectItem>
                  <SelectItem value="20">20 Overs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Start Match Button */}
        <div className="text-center">
          <Button
            onClick={handleStartMatch}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Match
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchSetup;

