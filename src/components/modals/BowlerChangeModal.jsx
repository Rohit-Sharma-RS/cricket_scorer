import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RefreshCw, User } from 'lucide-react';

const BowlerChangeModal = () => {
  const { state, dispatch } = useMatch();
  const [selectedBowler, setSelectedBowler] = useState('');

  const bowlingTeam = state.teams.find(team => 
    state.currentInnings === 1 ? team.id !== state.battingFirst : team.id === state.battingFirst
  );

  const availableBowlers = bowlingTeam?.players.filter(player => 
    player.id !== state.currentBowler?.id
  ) || [];

  const handleBowlerChange = () => {
    if (!selectedBowler) return;

    const newBowler = bowlingTeam.players.find(p => p.id === selectedBowler);
    
    dispatch({
      type: 'CHANGE_BOWLER',
      payload: { bowler: newBowler }
    });
  };

  const handleClose = () => {
    dispatch({ type: 'HIDE_MODAL', payload: { modal: 'showBowlerChangeModal' } });
  };

  if (!state.showBowlerChangeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <RefreshCw className="w-5 h-5" />
            Change Bowler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {availableBowlers.map((bowler) => (
              <div
                key={bowler.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedBowler === bowler.id
                    ? 'bg-blue-500/30 border-2 border-blue-400'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
                onClick={() => setSelectedBowler(bowler.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{bowler.name}</p>
                      <p className="text-blue-200 text-sm">
                        {bowler.overs} overs, {bowler.wickets} wickets
                      </p>
                    </div>
                  </div>
                  {selectedBowler === bowler.id && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBowlerChange}
              disabled={!selectedBowler}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Change Bowler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BowlerChangeModal;

