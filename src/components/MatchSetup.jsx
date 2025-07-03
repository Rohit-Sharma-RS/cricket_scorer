import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Users, Shuffle, Target, Clock } from 'lucide-react';

const MatchSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState({
    team1: { name: '', players: [''] },
    team2: { name: '', players: [''] }
  });
  const [toss, setToss] = useState({ winner: '', decision: '' });
  const [matchFormat, setMatchFormat] = useState({
    overs: 20,
    powerplay: 6,
    customOvers: false
  });

  const addPlayer = (team) => {
    if (teams[team].players.length < 11) {
      setTeams(prev => ({
        ...prev,
        [team]: {
          ...prev[team],
          players: [...prev[team].players, '']
        }
      }));
    }
  };

  const removePlayer = (team, index) => {
    if (teams[team].players.length > 1) {
      setTeams(prev => ({
        ...prev,
        [team]: {
          ...prev[team],
          players: prev[team].players.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updatePlayer = (team, index, name) => {
    setTeams(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        players: prev[team].players.map((player, i) => i === index ? name : player)
      }
    }));
  };

  const updateTeamName = (team, name) => {
    setTeams(prev => ({
      ...prev,
      [team]: { ...prev[team], name }
    }));
  };

  const canProceedToStep = (stepNum) => {
    switch (stepNum) {
      case 2:
        return teams.team1.name && teams.team2.name && 
               teams.team1.players.filter(p => p.trim()).length >= 1 &&
               teams.team2.players.filter(p => p.trim()).length >= 1;
      case 3:
        return toss.winner && toss.decision;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleComplete = () => {
    const setupData = {
      teams: {
        team1: {
          ...teams.team1,
          players: teams.team1.players.filter(p => p.trim()).map((name, index) => ({
            id: `t1_p${index}`,
            name: name.trim(),
            battingOrder: index + 1,
            bowlingOrder: index + 1,
            stats: {
              batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
              bowling: { overs: 0, runs: 0, wickets: 0, economy: 0 },
              fielding: { catches: 0, runouts: 0 }
            }
          }))
        },
        team2: {
          ...teams.team2,
          players: teams.team2.players.filter(p => p.trim()).map((name, index) => ({
            id: `t2_p${index}`,
            name: name.trim(),
            battingOrder: index + 1,
            bowlingOrder: index + 1,
            stats: {
              batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
              bowling: { overs: 0, runs: 0, wickets: 0, economy: 0 },
              fielding: { catches: 0, runouts: 0 }
            }
          }))
        }
      },
      toss,
      matchFormat
    };
    onComplete(setupData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                step > stepNum ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Teams */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Setup</span>
            </CardTitle>
            <CardDescription>Add team names and players</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team 1 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team1-name">Team 1 Name</Label>
                  <Input
                    id="team1-name"
                    placeholder="Enter team name"
                    value={teams.team1.name}
                    onChange={(e) => updateTeamName('team1', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Players ({teams.team1.players.filter(p => p.trim()).length}/11)</Label>
                  <div className="space-y-2 mt-2">
                    {teams.team1.players.map((player, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Player ${index + 1}`}
                          value={player}
                          onChange={(e) => updatePlayer('team1', index, e.target.value)}
                          className="flex-1"
                        />
                        {teams.team1.players.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePlayer('team1', index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {teams.team1.players.length < 11 && (
                      <Button
                        variant="outline"
                        onClick={() => addPlayer('team1')}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Team 2 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team2-name">Team 2 Name</Label>
                  <Input
                    id="team2-name"
                    placeholder="Enter team name"
                    value={teams.team2.name}
                    onChange={(e) => updateTeamName('team2', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Players ({teams.team2.players.filter(p => p.trim()).length}/11)</Label>
                  <div className="space-y-2 mt-2">
                    {teams.team2.players.map((player, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Player ${index + 1}`}
                          value={player}
                          onChange={(e) => updatePlayer('team2', index, e.target.value)}
                          className="flex-1"
                        />
                        {teams.team2.players.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePlayer('team2', index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {teams.team2.players.length < 11 && (
                      <Button
                        variant="outline"
                        onClick={() => addPlayer('team2')}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!canProceedToStep(2)}
              >
                Next: Toss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Toss */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shuffle className="w-5 h-5" />
              <span>Toss</span>
            </CardTitle>
            <CardDescription>Who won the toss and what did they choose?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Toss Winner</Label>
                <Select value={toss.winner} onValueChange={(value) => setToss(prev => ({ ...prev, winner: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={teams.team1.name}>{teams.team1.name}</SelectItem>
                    <SelectItem value={teams.team2.name}>{teams.team2.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Decision</Label>
                <Select value={toss.decision} onValueChange={(value) => setToss(prev => ({ ...prev, decision: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Bat or Bowl?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bat">Bat First</SelectItem>
                    <SelectItem value="bowl">Bowl First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!canProceedToStep(3)}
              >
                Next: Match Format
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Match Format */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Match Format</span>
            </CardTitle>
            <CardDescription>Set overs and powerplay rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Number of Overs</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex space-x-2">
                    {[5, 10, 20, 50].map((overCount) => (
                      <Button
                        key={overCount}
                        variant={matchFormat.overs === overCount && !matchFormat.customOvers ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMatchFormat(prev => ({ ...prev, overs: overCount, customOvers: false }))}
                      >
                        {overCount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={matchFormat.customOvers}
                      onCheckedChange={(checked) => setMatchFormat(prev => ({ ...prev, customOvers: checked }))}
                    />
                    <Label>Custom</Label>
                  </div>
                </div>
                {matchFormat.customOvers && (
                  <Input
                    type="number"
                    placeholder="Enter overs"
                    value={matchFormat.overs}
                    onChange={(e) => setMatchFormat(prev => ({ ...prev, overs: parseInt(e.target.value) || 20 }))}
                    className="mt-2"
                    min="1"
                    max="50"
                  />
                )}
              </div>
              <div>
                <Label>Powerplay Overs</Label>
                <Input
                  type="number"
                  value={matchFormat.powerplay}
                  onChange={(e) => setMatchFormat(prev => ({ ...prev, powerplay: parseInt(e.target.value) || 6 }))}
                  className="mt-1"
                  min="0"
                  max={Math.floor(matchFormat.overs / 2)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum {Math.floor(matchFormat.overs / 2)} overs
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Next: Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Match Summary</span>
            </CardTitle>
            <CardDescription>Review and start the match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Teams</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium">{teams.team1.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {teams.team1.players.filter(p => p.trim()).length} players
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium">{teams.team2.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {teams.team2.players.filter(p => p.trim()).length} players
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Match Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Toss Winner:</span>
                    <Badge>{toss.winner}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Decision:</span>
                    <Badge variant="outline">{toss.decision === 'bat' ? 'Bat First' : 'Bowl First'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <Badge variant="secondary">{matchFormat.overs}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Powerplay:</span>
                    <Badge variant="secondary">{matchFormat.powerplay}</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Start Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchSetup;

