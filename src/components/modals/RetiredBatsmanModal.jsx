import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserMinus, User } from 'lucide-react';

const RetiredBatsmanModal = () => {
  const { state, dispatch } = useMatch();
  const [selectedBatsman, setSelectedBatsman] = useState('');
  const [replacementPosition, setReplacementPosition] = useState('');

  const currentTeam = state.teams.find(team => 
    state.currentInnings === 1 ? team.id === state.battingFirst : team.id !== state.battingFirst
  );

  const availableBatsmen = currentTeam?.players.filter(player => 
    !player.isOut && 
    !player.isRetired &&
    player.id !== state.currentBatsmen.batsman1?.id &&
    player.id !== state.currentBatsmen.batsman2?.id
  ) || [];

  // Also include retired batsmen who can return (one-man standing rule)
  const retiredBatsmen = currentTeam?.players.filter(player => 
    player.isRetired && !player.isOut
  ) || [];

  const allAvailableBatsmen = [...availableBatsmen, ...retiredBatsmen];

  const handleBatsmanChange = () => {
    if (!selectedBatsman || !replacementPosition) return;

    const newBatsman = currentTeam.players.find(p => p.id === selectedBatsman);
    
    // If it's a retirement, mark the current batsman as retired
    if (replacementPosition && state.currentBatsmen[replacementPosition]) {
      dispatch({
        type: 'RETIRE_BATSMAN',
        payload: { position: replacementPosition }
      });
    }

    // Bring in the new batsman
    dispatch({
      type: 'NEW_BATSMAN',
      payload: { 
        position: replacementPosition,
        batsman: { ...newBatsman, isRetired: false }
      }
    });

    dispatch({ type: 'HIDE_MODAL', payload: { modal: 'showRetiredBatsmanModal' } });
  };

  const handleClose = () => {
    dispatch({ type: 'HIDE_MODAL', payload: { modal: 'showRetiredBatsmanModal' } });
  };

  if (!state.showRetiredBatsmanModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserMinus className="w-5 h-5" />
            Change Batsman
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position Selection */}
          <div>
            <label className="block text-white font-medium mb-2">Replace Position:</label>
            <div className="space-y-2">
              {['batsman1', 'batsman2'].map((position) => {
                const batsman = state.currentBatsmen[position];
                if (!batsman) return null;
                
                return (
                  <div
                    key={position}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      replacementPosition === position
                        ? 'bg-red-500/30 border-2 border-red-400'
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                    onClick={() => setReplacementPosition(position)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{batsman.name}</p>
                        <p className="text-blue-200 text-sm">
                          {batsman.runs} runs ({batsman.balls} balls)
                        </p>
                      </div>
                      {replacementPosition === position && (
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Batsman Selection */}
          {replacementPosition && (
            <div>
              <label className="block text-white font-medium mb-2">New Batsman:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allAvailableBatsmen.map((batsman) => (
                  <div
                    key={batsman.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedBatsman === batsman.id
                        ? 'bg-green-500/30 border-2 border-green-400'
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                    onClick={() => setSelectedBatsman(batsman.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">
                            {batsman.name}
                            {batsman.isRetired && (
                              <span className="text-yellow-400 text-xs ml-2">(Retired)</span>
                            )}
                          </p>
                          <p className="text-blue-200 text-sm">
                            {batsman.runs} runs ({batsman.balls} balls)
                          </p>
                        </div>
                      </div>
                      {selectedBatsman === batsman.id && (
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                
                {allAvailableBatsmen.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-white/70">No available batsmen</p>
                    <p className="text-white/50 text-sm">One-man standing in effect</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatsmanChange}
              disabled={!selectedBatsman || !replacementPosition}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Change Batsman
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetiredBatsmanModal;

