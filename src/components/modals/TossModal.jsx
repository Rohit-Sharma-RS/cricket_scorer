import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Coins, Trophy } from 'lucide-react';

const TossModal = () => {
  const { state, dispatch } = useMatch();
  const [tossResult, setTossResult] = useState(null);
  const [tossWinner, setTossWinner] = useState('');
  const [battingFirst, setBattingFirst] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateToss = () => {
    setIsSimulating(true);
    
    // Simulate coin flip animation
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      setTossResult(result);
      setIsSimulating(false);
    }, 2000);
  };

  const handleTossComplete = () => {
    if (!tossWinner || !battingFirst) return;

    dispatch({
      type: 'SET_TOSS_RESULT',
      payload: {
        tossWinner: parseInt(tossWinner),
        battingFirst: parseInt(battingFirst)
      }
    });

    // Set initial batsmen and bowler
    const battingTeam = state.teams.find(team => team.id === parseInt(battingFirst));
    const bowlingTeam = state.teams.find(team => team.id !== parseInt(battingFirst));

    dispatch({
      type: 'START_INNINGS',
      payload: {
        innings: 1,
        batsmen: {
          batsman1: battingTeam.players[0],
          batsman2: battingTeam.players[1]
        },
        bowler: bowlingTeam.players[0]
      }
    });
  };

  if (!state.teams.length) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-center">
            <Coins className="w-6 h-6" />
            Toss Time!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coin Simulation */}
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl font-bold text-yellow-900 ${isSimulating ? 'animate-spin' : ''}`}>
              {isSimulating ? '🪙' : tossResult === 'heads' ? 'H' : tossResult === 'tails' ? 'T' : '🪙'}
            </div>
            
            {!tossResult && (
              <Button
                onClick={simulateToss}
                disabled={isSimulating}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {isSimulating ? 'Flipping...' : 'Flip Coin'}
              </Button>
            )}
            
            {tossResult && (
              <div className="text-center">
                <p className="text-white text-lg mb-4">
                  Result: <span className="font-bold text-yellow-400">{tossResult.toUpperCase()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Manual Toss Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Toss Winner:</label>
              <Select value={tossWinner} onValueChange={setTossWinner}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Select toss winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{state.teams[0]?.name}</SelectItem>
                  <SelectItem value="2">{state.teams[1]?.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Choose to:</label>
              <Select value={battingFirst} onValueChange={setBattingFirst}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Bat or Bowl first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Bat First ({state.teams[0]?.name})</SelectItem>
                  <SelectItem value="2">Bat First ({state.teams[1]?.name})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Match Button */}
          <Button
            onClick={handleTossComplete}
            disabled={!tossWinner || !battingFirst}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Start Match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TossModal;

