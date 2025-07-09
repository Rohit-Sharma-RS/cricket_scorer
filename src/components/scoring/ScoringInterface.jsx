import React, { useState, useEffect } from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Target, 
  Users, 
  Clock, 
  RotateCcw, 
  UserMinus, 
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

const ScoringInterface = () => {
  const { state, dispatch } = useMatch();
  const [selectedBatsman, setSelectedBatsman] = useState('batsman1');
  const [extraRuns, setExtraRuns] = useState(0);
  const [showExtraOptions, setShowExtraOptions] = useState(false);

  const currentTeam = state.teams.find(team => 
    state.currentInnings === 1 ? team.id === state.battingFirst : team.id !== state.battingFirst
  );

  const bowlingTeam = state.teams.find(team => 
    state.currentInnings === 1 ? team.id !== state.battingFirst : team.id === state.battingFirst
  );

  const target = state.currentInnings === 2 ? state.teams.find(t => t.id !== currentTeam.id).score + 1 : null;
  const required = target ? target - currentTeam.score : null;
  const ballsRemaining = (state.match.oversPerInnings * 6) - (state.overCount * 6 + state.ballCount);

  // Check for match end conditions
  useEffect(() => {
    if (state.matchStatus !== 'playing') return;

    // Check if target reached
    if (target && currentTeam.score >= target) {
      const wicketsRemaining = currentTeam.players.length - 1 - currentTeam.wickets;
      endMatch(`${currentTeam.name} won by ${wicketsRemaining} wickets`);
      return;
    }

    // Check if all overs completed
    if (state.overCount >= state.match.oversPerInnings) {
      if (state.currentInnings === 1) {
        // Start second innings
        startSecondInnings();
      } else {
        // Match finished
        const team1 = state.teams[0];
        const team2 = state.teams[1];
        const winner = team1.score > team2.score ? team1 : team2;
        const margin = Math.abs(team1.score - team2.score);
        endMatch(`${winner.name} won by ${margin} runs`);
      }
      return;
    }

    // Check if all out (with one-man standing rule)
    const availableBatsmen = currentTeam.players.filter(p => !p.isOut && !p.isRetired);
    const totalPlayers = currentTeam.players.length;
    
    if (availableBatsmen.length === 1 && currentTeam.wickets >= totalPlayers - 2) {
      // One-man standing - continue with last batsman
      return;
    }

    if (currentTeam.wickets >= totalPlayers - 1) {
      if (state.currentInnings === 1) {
        startSecondInnings();
      } else {
        const team1 = state.teams[0];
        const team2 = state.teams[1];
        const winner = team1.score > team2.score ? team1 : team2;
        const margin = Math.abs(team1.score - team2.score);
        endMatch(`${winner.name} won by ${margin} runs`);
      }
    }
  }, [currentTeam.score, currentTeam.wickets, state.overCount, state.ballCount]);

  const startSecondInnings = () => {
    const newBattingTeam = bowlingTeam;
    dispatch({
      type: 'START_INNINGS',
      payload: {
        innings: 2,
        batsmen: {
          batsman1: newBattingTeam.players[0],
          batsman2: newBattingTeam.players[1]
        },
        bowler: currentTeam.players[0]
      }
    });
  };

  const endMatch = (result) => {
    const bestBatsman = [...state.teams[0].players, ...state.teams[1].players]
      .reduce((best, player) => player.runs > best.runs ? player : best);
    
    const bestBowler = [...state.teams[0].players, ...state.teams[1].players]
      .reduce((best, player) => player.wickets > best.wickets ? player : best);

    dispatch({
      type: 'END_MATCH',
      payload: {
        winner: result,
        bestBatsman,
        bestBowler,
        bestPerformer: bestBatsman.runs > bestBowler.wickets * 20 ? bestBatsman : bestBowler
      }
    });
  };

  const handleRunScored = (runs) => {
    const batsmanKey = selectedBatsman;
    const batsman = state.currentBatsmen[batsmanKey];

    dispatch({
      type: 'SCORE_RUNS',
      payload: {
        teamId: currentTeam.id,
        batsman: batsmanKey,
        runs,
        ballNumber: state.ballCount + 1
      }
    });

    // Switch strike on odd runs
    if (runs % 2 === 1) {
      setSelectedBatsman(selectedBatsman === 'batsman1' ? 'batsman2' : 'batsman1');
    }

    // Check for over completion
    if (state.ballCount + 1 >= 6) {
      dispatch({ type: 'COMPLETE_OVER' });
      // Switch strike at end of over
      setSelectedBatsman(selectedBatsman === 'batsman1' ? 'batsman2' : 'batsman1');
    }
  };

  const handleWicket = () => {
    const batsmanKey = selectedBatsman;
    
    dispatch({
      type: 'WICKET_TAKEN',
      payload: {
        teamId: currentTeam.id,
        bowlingTeamId: bowlingTeam.id,
        batsman: batsmanKey,
        ballNumber: state.ballCount + 1
      }
    });

    // Show new batsman selection
    dispatch({ type: 'SHOW_MODAL', payload: { modal: 'showRetiredBatsmanModal' } });

    // Check for over completion
    if (state.ballCount + 1 >= 6) {
      dispatch({ type: 'COMPLETE_OVER' });
    }
  };

  const handleExtra = (extraType) => {
    const runs = extraType === 'wide' || extraType === 'noball' ? 1 + extraRuns : extraRuns;
    
    dispatch({
      type: 'SCORE_EXTRA',
      payload: {
        teamId: currentTeam.id,
        extraType,
        runs,
        ballNumber: extraType === 'wide' || extraType === 'noball' ? state.ballCount : state.ballCount + 1
      }
    });

    // Check for over completion (only for bye/legbye)
    if (extraType !== 'wide' && extraType !== 'noball' && state.ballCount + 1 >= 6) {
      dispatch({ type: 'COMPLETE_OVER' });
    }

    setExtraRuns(0);
    setShowExtraOptions(false);
  };

  if (!currentTeam || !state.currentBatsmen.batsman1) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Match Header */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{currentTeam.name}</h1>
                <p className="text-blue-200">Innings {state.currentInnings}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {currentTeam.score}/{currentTeam.wickets}
                </div>
                <div className="text-blue-200">
                  {state.overCount}.{state.ballCount} overs ({currentTeam.players.length} players)
                </div>
              </div>
            </div>

            {target && (
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Target: {target}</span>
                </div>
                <div className="text-white">
                  Need {required} runs from {ballsRemaining} balls
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Players */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Batsmen */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Batsmen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['batsman1', 'batsman2'].map((key) => {
                const batsman = state.currentBatsmen[key];
                if (!batsman) return null;
                
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedBatsman === key
                        ? 'bg-blue-500/30 border-2 border-blue-400'
                        : 'bg-white/10 border border-white/20'
                    }`}
                    onClick={() => setSelectedBatsman(key)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{batsman.name}</p>
                        {selectedBatsman === key && (
                          <Badge className="bg-blue-500 text-white text-xs">On Strike</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{batsman.runs}</p>
                        <p className="text-blue-200 text-sm">({batsman.balls})</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Bowler */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                Bowler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.currentBowler && (
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-white font-medium">{state.currentBowler.name}</p>
                  <div className="flex justify-between text-sm text-blue-200 mt-1">
                    <span>{state.currentBowler.overs} overs</span>
                    <span>{state.currentBowler.wickets} wickets</span>
                  </div>
                </div>
              )}
              <Button
                onClick={() => dispatch({ type: 'SHOW_MODAL', payload: { modal: 'showBowlerChangeModal' } })}
                className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Bowler
              </Button>
            </CardContent>
          </Card>

          {/* Current Over */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">This Over</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {state.currentOver.map((ball, index) => (
                  <Badge
                    key={index}
                    className={`${
                      ball.isWicket
                        ? 'bg-red-500'
                        : ball.extraType
                        ? 'bg-yellow-500'
                        : ball.runs >= 4
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    } text-white`}
                  >
                    {ball.isWicket ? 'W' : ball.extraType ? `${ball.extraType[0].toUpperCase()}${ball.runs}` : ball.runs}
                  </Badge>
                ))}
                {Array.from({ length: 6 - state.currentOver.length }, (_, i) => (
                  <div key={i} className="w-8 h-6 border border-white/30 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoring Controls */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Scoring</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Run Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                <Button
                  key={runs}
                  onClick={() => handleRunScored(runs)}
                  className={`h-12 text-lg font-bold ${
                    runs === 0
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : runs >= 4
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {runs}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={handleWicket}
                className="bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
              >
                Wicket
              </Button>
              <Button
                onClick={() => setShowExtraOptions(!showExtraOptions)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white h-12 font-semibold"
              >
                Extras
              </Button>
            </div>

            {/* Extra Options */}
            {showExtraOptions && (
              <Card className="bg-white/20 border-white/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white">Extra Runs:</span>
                    <Button
                      onClick={() => setExtraRuns(Math.max(0, extraRuns - 1))}
                      className="w-8 h-8 p-0 bg-white/20"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-white font-bold w-8 text-center">{extraRuns}</span>
                    <Button
                      onClick={() => setExtraRuns(extraRuns + 1)}
                      className="w-8 h-8 p-0 bg-white/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleExtra('wide')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Wide {extraRuns > 0 && `+${extraRuns}`}
                    </Button>
                    <Button
                      onClick={() => handleExtra('noball')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      No Ball {extraRuns > 0 && `+${extraRuns}`}
                    </Button>
                    <Button
                      onClick={() => handleExtra('bye')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Bye {extraRuns}
                    </Button>
                    <Button
                      onClick={() => handleExtra('legbye')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Leg Bye {extraRuns}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Utility Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => dispatch({ type: 'SHOW_MODAL', payload: { modal: 'showRetiredBatsmanModal' } })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Retire Batsman
              </Button>
              <Button
                onClick={() => dispatch({ type: 'UNDO_LAST_ACTION' })}
                disabled={!state.lastAction}
                className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoringInterface;

