import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Target, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Activity
} from 'lucide-react';

const LiveScoring = ({ matchData, onMatchComplete, onMatchUpdate }) => {
  const [currentInnings, setCurrentInnings] = useState(0);
  const [currentBall, setCurrentBall] = useState(null);
  const [showWicketDialog, setShowWicketDialog] = useState(false);
  const [showBatsmanDialog, setShowBatsmanDialog] = useState(false);
  const [showBowlerDialog, setShowBowlerDialog] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [fielder, setFielder] = useState('');
  const [newBatsman, setNewBatsman] = useState('');
  const [newBowler, setNewBowler] = useState('');
  const [ballHistory, setBallHistory] = useState([]);

  const currentInningsData = matchData.innings[currentInnings];
  const battingTeam = currentInningsData.team === matchData.teams.team1.name ? matchData.teams.team1 : matchData.teams.team2;
  const bowlingTeam = currentInningsData.team === matchData.teams.team1.name ? matchData.teams.team2 : matchData.teams.team1;
  
  // Initialize batsmen and bowler if not set
  useEffect(() => {
    if (!currentInningsData.batsmen.striker && battingTeam.players.length > 0) {
      const updatedMatch = { ...matchData };
      updatedMatch.innings[currentInnings].batsmen.striker = battingTeam.players[0];
      updatedMatch.innings[currentInnings].batsmen.nonStriker = battingTeam.players[1] || battingTeam.players[0];
      updatedMatch.innings[currentInnings].bowler = bowlingTeam.players[0];
      onMatchUpdate(updatedMatch);
    }
  }, [currentInnings, battingTeam, bowlingTeam]);

  const addBall = (runs, isWide = false, isNoBall = false, isBye = false, isLegBye = false, isWicket = false, wicketDetails = null) => {
    const ball = {
      id: Date.now(),
      runs,
      isWide,
      isNoBall,
      isBye,
      isLegBye,
      isWicket,
      wicketDetails,
      striker: currentInningsData.batsmen.striker,
      bowler: currentInningsData.bowler,
      over: Math.floor(currentInningsData.balls.length / 6),
      ballInOver: currentInningsData.balls.length % 6
    };

    const updatedMatch = { ...matchData };
    const innings = updatedMatch.innings[currentInnings];
    
    // Add ball to innings
    innings.balls.push(ball);
    
    // Update score
    innings.score += runs;
    if (isWide || isNoBall) innings.score += 1; // Extra run for wide/no-ball
    
    // Update wickets
    if (isWicket) innings.wickets += 1;
    
    // Update overs (only for legal deliveries)
    if (!isWide && !isNoBall) {
      const totalLegalBalls = innings.balls.filter(b => !b.isWide && !b.isNoBall).length;
      innings.overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 10;
    }
    
    // Update player stats
    const striker = innings.batsmen.striker;
    const bowler = innings.bowler;
    
    // Update batsman stats
    if (!isBye && !isLegBye && !isWicket) {
      striker.stats.batting.runs += runs;
    }
    if (!isWide && !isNoBall) {
      striker.stats.batting.balls += 1;
    }
    if (runs === 4) striker.stats.batting.fours += 1;
    if (runs === 6) striker.stats.batting.sixes += 1;
    striker.stats.batting.strikeRate = striker.stats.batting.balls > 0 ? 
      (striker.stats.batting.runs / striker.stats.batting.balls * 100).toFixed(2) : 0;
    
    // Update bowler stats
    const bowlerOvers = innings.balls.filter(b => b.bowler.id === bowler.id && !b.isWide && !b.isNoBall).length;
    bowler.stats.bowling.overs = Math.floor(bowlerOvers / 6) + (bowlerOvers % 6) / 10;
    bowler.stats.bowling.runs += runs + (isWide || isNoBall ? 1 : 0);
    if (isWicket) bowler.stats.bowling.wickets += 1;
    bowler.stats.bowling.economy = bowler.stats.bowling.overs > 0 ? 
      (bowler.stats.bowling.runs / (Math.floor(bowlerOvers / 6) + (bowlerOvers % 6) / 6)).toFixed(2) : 0;
    
    // Change strike on odd runs (and not wide/no-ball)
    if ((runs % 2 === 1) && !isWide && !isNoBall) {
      const temp = innings.batsmen.striker;
      innings.batsmen.striker = innings.batsmen.nonStriker;
      innings.batsmen.nonStriker = temp;
    }
    
    // Change strike at end of over
    if (!isWide && !isNoBall && (innings.balls.filter(b => !b.isWide && !b.isNoBall).length % 6 === 0)) {
      const temp = innings.batsmen.striker;
      innings.batsmen.striker = innings.batsmen.nonStriker;
      innings.batsmen.nonStriker = temp;
    }
    
    setBallHistory(prev => [ball, ...prev.slice(0, 9)]); // Keep last 10 balls
    
    // Check if innings is complete
    const maxOvers = matchData.matchFormat.overs;
    const totalLegalBalls = innings.balls.filter(b => !b.isWide && !b.isNoBall).length;
    
    if (innings.wickets >= 10 || totalLegalBalls >= maxOvers * 6) {
      innings.completed = true;
      
      if (currentInnings === 0) {
        // Start second innings
        setCurrentInnings(1);
      } else {
        // Match complete
        updatedMatch.status = 'completed';
        onMatchComplete(updatedMatch);
        return;
      }
    }
    
    onMatchUpdate(updatedMatch);
  };

  const handleRunScored = (runs) => {
    addBall(runs);
  };

  const handleExtra = (type) => {
    switch (type) {
      case 'wide':
        addBall(0, true);
        break;
      case 'noball':
        addBall(0, false, true);
        break;
      case 'bye':
        addBall(1, false, false, true);
        break;
      case 'legbye':
        addBall(1, false, false, false, true);
        break;
    }
  };

  const handleWicket = (type, fielderName = '') => {
    const wicketDetails = {
      type,
      fielder: fielderName,
      batsman: currentInningsData.batsmen.striker.name
    };
    
    addBall(0, false, false, false, false, true, wicketDetails);
    setShowBatsmanDialog(true);
  };

  const handleNewBatsman = (batsmanId) => {
    const newBat = battingTeam.players.find(p => p.id === batsmanId);
    if (newBat) {
      const updatedMatch = { ...matchData };
      updatedMatch.innings[currentInnings].batsmen.striker = newBat;
      onMatchUpdate(updatedMatch);
    }
    setShowBatsmanDialog(false);
  };

  const handleBowlerChange = (bowlerId) => {
    const newBowl = bowlingTeam.players.find(p => p.id === bowlerId);
    if (newBowl) {
      const updatedMatch = { ...matchData };
      updatedMatch.innings[currentInnings].bowler = newBowl;
      onMatchUpdate(updatedMatch);
    }
    setShowBowlerDialog(false);
  };

  const undoLastBall = () => {
    if (currentInningsData.balls.length === 0) return;
    
    const updatedMatch = { ...matchData };
    const innings = updatedMatch.innings[currentInnings];
    const lastBall = innings.balls.pop();
    
    // Reverse score changes
    innings.score -= lastBall.runs;
    if (lastBall.isWide || lastBall.isNoBall) innings.score -= 1;
    
    // Reverse wicket
    if (lastBall.isWicket) innings.wickets -= 1;
    
    // Recalculate overs
    const totalLegalBalls = innings.balls.filter(b => !b.isWide && !b.isNoBall).length;
    innings.overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 10;
    
    setBallHistory(prev => prev.slice(1));
    onMatchUpdate(updatedMatch);
  };

  const getTarget = () => {
    if (currentInnings === 1) {
      return matchData.innings[0].score + 1;
    }
    return null;
  };

  const getRemainingBalls = () => {
    const totalLegalBalls = currentInningsData.balls.filter(b => !b.isWide && !b.isNoBall).length;
    return (matchData.matchFormat.overs * 6) - totalLegalBalls;
  };

  const getCurrentRunRate = () => {
    const totalLegalBalls = currentInningsData.balls.filter(b => !b.isWide && !b.isNoBall).length;
    const overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 6;
    return overs > 0 ? (currentInningsData.score / overs).toFixed(2) : '0.00';
  };

  const getRequiredRunRate = () => {
    if (currentInnings === 0) return null;
    const target = getTarget();
    const remainingRuns = target - currentInningsData.score;
    const remainingOvers = getRemainingBalls() / 6;
    return remainingOvers > 0 ? (remainingRuns / remainingOvers).toFixed(2) : '0.00';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Match Status Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {currentInningsData.score}/{currentInningsData.wickets}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                {currentInningsData.overs.toFixed(1)} overs
              </div>
              <Badge variant="outline" className="mt-2">
                {battingTeam.name} - Innings {currentInnings + 1}
              </Badge>
            </div>
            
            {/* Target/Run Rate */}
            <div className="text-center">
              {getTarget() ? (
                <>
                  <div className="text-2xl font-semibold">
                    Target: {getTarget()}
                  </div>
                  <div className="text-lg text-blue-600">
                    Need {getTarget() - currentInningsData.score} runs
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    RRR: {getRequiredRunRate()}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-semibold">
                    Run Rate: {getCurrentRunRate()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Balls remaining: {getRemainingBalls()}
                  </div>
                </>
              )}
            </div>
            
            {/* Current Players */}
            <div className="text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="default">*</Badge>
                  <span className="font-medium">
                    {currentInningsData.batsmen.striker?.name} ({currentInningsData.batsmen.striker?.stats.batting.runs})
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="outline"> </Badge>
                  <span>
                    {currentInningsData.batsmen.nonStriker?.name} ({currentInningsData.batsmen.nonStriker?.stats.batting.runs})
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Bowler: {currentInningsData.bowler?.name}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Run Scoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Runs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 6].map((runs) => (
                <Button
                  key={runs}
                  size="lg"
                  className={`h-16 text-xl font-bold ${
                    runs === 0 ? 'bg-gray-500 hover:bg-gray-600' :
                    runs === 4 ? 'bg-blue-500 hover:bg-blue-600' :
                    runs === 6 ? 'bg-purple-500 hover:bg-purple-600' :
                    'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={() => handleRunScored(runs)}
                >
                  {runs}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Extras & Wickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Extras & Wickets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Extras */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-12 bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
                  onClick={() => handleExtra('wide')}
                >
                  Wide
                </Button>
                <Button
                  variant="outline"
                  className="h-12 bg-orange-50 hover:bg-orange-100 border-orange-300"
                  onClick={() => handleExtra('noball')}
                >
                  No Ball
                </Button>
                <Button
                  variant="outline"
                  className="h-12 bg-blue-50 hover:bg-blue-100 border-blue-300"
                  onClick={() => handleExtra('bye')}
                >
                  Bye
                </Button>
                <Button
                  variant="outline"
                  className="h-12 bg-indigo-50 hover:bg-indigo-100 border-indigo-300"
                  onClick={() => handleExtra('legbye')}
                >
                  Leg Bye
                </Button>
              </div>
              
              {/* Wicket */}
              <Dialog open={showWicketDialog} onOpenChange={setShowWicketDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    WICKET
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How was the batsman dismissed?</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => { handleWicket('bowled'); setShowWicketDialog(false); }}>
                      Bowled
                    </Button>
                    <Button onClick={() => { handleWicket('lbw'); setShowWicketDialog(false); }}>
                      LBW
                    </Button>
                    <Button onClick={() => { setWicketType('caught'); }}>
                      Caught
                    </Button>
                    <Button onClick={() => { setWicketType('runout'); }}>
                      Run Out
                    </Button>
                    <Button onClick={() => { handleWicket('hitwicket'); setShowWicketDialog(false); }}>
                      Hit Wicket
                    </Button>
                    <Button onClick={() => { handleWicket('stumped'); setShowWicketDialog(false); }}>
                      Stumped
                    </Button>
                  </div>
                  
                  {(wicketType === 'caught' || wicketType === 'runout') && (
                    <div className="mt-4">
                      <Select value={fielder} onValueChange={setFielder}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fielder" />
                        </SelectTrigger>
                        <SelectContent>
                          {bowlingTeam.players.map((player) => (
                            <SelectItem key={player.id} value={player.name}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        className="w-full mt-2"
                        onClick={() => {
                          handleWicket(wicketType, fielder);
                          setShowWicketDialog(false);
                          setWicketType('');
                          setFielder('');
                        }}
                        disabled={!fielder}
                      >
                        Confirm Wicket
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={undoLastBall}
          disabled={currentInningsData.balls.length === 0}
          className="h-12"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Undo Last Ball
        </Button>
        
        <Dialog open={showBatsmanDialog} onOpenChange={setShowBatsmanDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12">
              <Users className="w-4 h-4 mr-2" />
              Change Batsman
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select New Batsman</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {battingTeam.players
                .filter(p => p.id !== currentInningsData.batsmen.striker?.id && 
                           p.id !== currentInningsData.batsmen.nonStriker?.id)
                .map((player) => (
                <Button
                  key={player.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleNewBatsman(player.id)}
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showBowlerDialog} onOpenChange={setShowBowlerDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12">
              <Activity className="w-4 h-4 mr-2" />
              Change Bowler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select New Bowler</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {bowlingTeam.players.map((player) => (
                <Button
                  key={player.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBowlerChange(player.id)}
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ball History */}
      {ballHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Balls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ballHistory.map((ball, index) => (
                <Badge
                  key={ball.id}
                  variant={
                    ball.isWicket ? 'destructive' :
                    ball.runs === 4 ? 'default' :
                    ball.runs === 6 ? 'secondary' :
                    ball.isWide || ball.isNoBall ? 'outline' :
                    'secondary'
                  }
                  className="text-sm"
                >
                  {ball.isWicket ? 'W' :
                   ball.isWide ? `${ball.runs}W` :
                   ball.isNoBall ? `${ball.runs}NB` :
                   ball.isBye ? `${ball.runs}B` :
                   ball.isLegBye ? `${ball.runs}LB` :
                   ball.runs}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveScoring;

