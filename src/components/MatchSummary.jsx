import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Activity, 
  Users, 
  Download,
  Share,
  Plus,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';

const MatchSummary = ({ matchHistory, onNewMatch }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Calculate star performers for a match
  const calculateStarPerformers = (match) => {
    if (!match || !match.innings) return null;

    const allPlayers = [...match.teams.team1.players, ...match.teams.team2.players];
    
    // Player of the Match calculation
    const playerScores = allPlayers.map(player => {
      let score = 0;
      
      // Batting contribution (runs/strike rate)
      if (player.stats.batting.runs > 0) {
        score += player.stats.batting.runs * 1.5;
        if (player.stats.batting.strikeRate > 120) score += 10;
        if (player.stats.batting.runs >= 50) score += 25;
        if (player.stats.batting.runs >= 100) score += 50;
      }
      
      // Bowling contribution
      if (player.stats.bowling.wickets > 0) {
        score += player.stats.bowling.wickets * 20;
        if (player.stats.bowling.economy < 6) score += 15;
        if (player.stats.bowling.wickets >= 3) score += 20;
        if (player.stats.bowling.wickets >= 5) score += 40;
      }
      
      // Fielding contribution
      score += player.stats.fielding.catches * 10;
      score += player.stats.fielding.runouts * 15;
      
      // Special bonus for players named Rohit (as requested)
      if (player.name.toLowerCase().includes('rohit')) {
        score += 25;
      }
      
      return { ...player, performanceScore: score };
    });

    // Sort by performance score
    playerScores.sort((a, b) => b.performanceScore - a.performanceScore);

    // Star Batsman (highest runs with decent strike rate)
    const starBatsman = allPlayers
      .filter(p => p.stats.batting.runs > 0)
      .sort((a, b) => {
        const aScore = a.stats.batting.runs + (a.stats.batting.strikeRate / 10);
        const bScore = b.stats.batting.runs + (b.stats.batting.strikeRate / 10);
        return bScore - aScore;
      })[0];

    // Star Bowler (best bowling figures)
    const starBowler = allPlayers
      .filter(p => p.stats.bowling.wickets > 0)
      .sort((a, b) => {
        const aScore = (a.stats.bowling.wickets * 10) - parseFloat(a.stats.bowling.economy);
        const bScore = (b.stats.bowling.wickets * 10) - parseFloat(b.stats.bowling.economy);
        return bScore - aScore;
      })[0];

    // Star Fielder (most dismissals)
    const starFielder = allPlayers
      .filter(p => p.stats.fielding.catches > 0 || p.stats.fielding.runouts > 0)
      .sort((a, b) => {
        const aDismissals = a.stats.fielding.catches + a.stats.fielding.runouts;
        const bDismissals = b.stats.fielding.catches + b.stats.fielding.runouts;
        return bDismissals - aDismissals;
      })[0];

    return {
      playerOfMatch: playerScores[0],
      starBatsman,
      starBowler,
      starFielder
    };
  };

  // Determine match result
  const getMatchResult = (match) => {
    if (!match || !match.innings || match.innings.length < 2) return 'Match in progress';
    
    const innings1 = match.innings[0];
    const innings2 = match.innings[1];
    
    if (innings2.score > innings1.score) {
      const margin = innings2.score - innings1.score;
      const wicketsLeft = 10 - innings2.wickets;
      return `${innings2.team} won by ${wicketsLeft} wickets`;
    } else if (innings1.score > innings2.score) {
      const margin = innings1.score - innings2.score;
      return `${innings1.team} won by ${margin} runs`;
    } else {
      return 'Match tied';
    }
  };

  // Generate match summary text for sharing
  const generateMatchSummary = (match) => {
    const result = getMatchResult(match);
    const stars = calculateStarPerformers(match);
    
    let summary = `🏏 CRICKET MATCH SUMMARY 🏏\n\n`;
    summary += `${match.teams.team1.name} vs ${match.teams.team2.name}\n`;
    summary += `${match.matchFormat.overs} overs per side\n\n`;
    
    // Innings details
    match.innings.forEach((innings, index) => {
      summary += `${innings.team}: ${innings.score}/${innings.wickets} (${innings.overs.toFixed(1)} overs)\n`;
    });
    
    summary += `\n${result}\n\n`;
    
    // Star performers
    if (stars) {
      summary += `⭐ STAR PERFORMERS ⭐\n`;
      if (stars.playerOfMatch) {
        summary += `🏆 Player of the Match: ${stars.playerOfMatch.name}\n`;
      }
      if (stars.starBatsman) {
        summary += `🏏 Star Batsman: ${stars.starBatsman.name} (${stars.starBatsman.stats.batting.runs} runs)\n`;
      }
      if (stars.starBowler) {
        summary += `⚡ Star Bowler: ${stars.starBowler.name} (${stars.starBowler.stats.bowling.wickets} wickets)\n`;
      }
      if (stars.starFielder) {
        summary += `🥅 Star Fielder: ${stars.starFielder.name}\n`;
      }
    }
    
    summary += `\n📱 Scored with Cricket Scorer App`;
    
    return summary;
  };

  const shareMatch = (match) => {
    const summary = generateMatchSummary(match);
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Match Summary',
        text: summary
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(summary).then(() => {
        alert('Match summary copied to clipboard!');
      });
    }
  };

  const downloadMatchPDF = (match) => {
    // This would integrate with a PDF generation library
    // For now, we'll create a simple text file
    const summary = generateMatchSummary(match);
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket-match-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (matchHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
              No matches completed yet
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Complete your first match to see the summary and star performers here
            </p>
            <Button onClick={onNewMatch} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Start New Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestMatch = matchHistory[matchHistory.length - 1];
  const stars = calculateStarPerformers(latestMatch);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Latest Match Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Latest Match Result</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">
                {latestMatch.teams.team1.name} vs {latestMatch.teams.team2.name}
              </h3>
              <div className="space-y-2">
                {latestMatch.innings.map((innings, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">{innings.team}</span>
                    <Badge variant="outline" className="text-lg">
                      {innings.score}/{innings.wickets} ({innings.overs.toFixed(1)})
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {getMatchResult(latestMatch)}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareMatch(latestMatch)}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMatchPDF(latestMatch)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Star Performers */}
      {stars && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Player of the Match */}
          {stars.playerOfMatch && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm">Player of the Match</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold">{stars.playerOfMatch.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {stars.playerOfMatch.stats.batting.runs > 0 && 
                      `${stars.playerOfMatch.stats.batting.runs} runs`}
                    {stars.playerOfMatch.stats.batting.runs > 0 && stars.playerOfMatch.stats.bowling.wickets > 0 && ', '}
                    {stars.playerOfMatch.stats.bowling.wickets > 0 && 
                      `${stars.playerOfMatch.stats.bowling.wickets} wickets`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Star Batsman */}
          {stars.starBatsman && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <Target className="w-5 h-5" />
                  <span className="text-sm">Star Batsman</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold">{stars.starBatsman.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stars.starBatsman.stats.batting.runs} runs
                  </div>
                  <div className="text-xs text-gray-500">
                    SR: {stars.starBatsman.stats.batting.strikeRate}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Star Bowler */}
          {stars.starBowler && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">Star Bowler</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold">{stars.starBowler.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stars.starBowler.stats.bowling.wickets} wickets
                  </div>
                  <div className="text-xs text-gray-500">
                    Econ: {stars.starBowler.stats.bowling.economy}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Star Fielder */}
          {stars.starFielder && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Star Fielder</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold">{stars.starFielder.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stars.starFielder.stats.fielding.catches} catches, {stars.starFielder.stats.fielding.runouts} run-outs
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Match History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Match History</span>
            </div>
            <Button onClick={onNewMatch} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Match
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matchHistory.slice().reverse().map((match, index) => {
              const matchStars = calculateStarPerformers(match);
              return (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {match.teams.team1.name} vs {match.teams.team2.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getMatchResult(match)}
                      </p>
                      {matchStars?.playerOfMatch && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          <Award className="w-3 h-3 inline mr-1" />
                          Player of the Match: {matchStars.playerOfMatch.name}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareMatch(match)}
                      >
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadMatchPDF(match)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchSummary;

