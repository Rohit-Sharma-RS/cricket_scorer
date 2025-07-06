// Utility functions for cricket match calculations and statistics

export const calculateStrikeRate = (runs, balls) => {
  if (balls === 0) return 0;
  return ((runs / balls) * 100).toFixed(2);
};

export const calculateEconomyRate = (runs, overs) => {
  if (overs === 0) return 0;
  return (runs / overs).toFixed(2);
};

export const calculateRunRate = (runs, overs, balls) => {
  const totalBalls = (overs * 6) + balls;
  if (totalBalls === 0) return 0;
  return ((runs / totalBalls) * 6).toFixed(2);
};

export const calculateRequiredRunRate = (target, currentScore, ballsRemaining) => {
  const runsRequired = target - currentScore;
  if (ballsRemaining === 0) return 0;
  return ((runsRequired / ballsRemaining) * 6).toFixed(2);
};

export const findBestBatsman = (players) => {
  return players.reduce((best, player) => {
    if (player.runs > best.runs) return player;
    if (player.runs === best.runs && player.balls < best.balls) return player;
    return best;
  }, { runs: 0, balls: Infinity });
};

export const findBestBowler = (players) => {
  return players.reduce((best, player) => {
    if (player.wickets > best.wickets) return player;
    if (player.wickets === best.wickets) {
      const bestEconomy = calculateEconomyRate(best.runsConceded || 0, best.overs || 0);
      const playerEconomy = calculateEconomyRate(player.runsConceded || 0, player.overs || 0);
      if (parseFloat(playerEconomy) < parseFloat(bestEconomy)) return player;
    }
    return best;
  }, { wickets: 0, runsConceded: Infinity, overs: 0 });
};

export const findBestPerformer = (players) => {
  return players.reduce((best, player) => {
    const playerPoints = (player.runs || 0) + (player.wickets || 0) * 20;
    const bestPoints = (best.runs || 0) + (best.wickets || 0) * 20;
    return playerPoints > bestPoints ? player : best;
  }, { runs: 0, wickets: 0 });
};

export const generateOverByOverData = (matchHistory) => {
  const data = [];
  const maxOvers = Math.max(
    matchHistory.team1?.overs || 0,
    matchHistory.team2?.overs || 0
  );

  for (let i = 1; i <= maxOvers; i++) {
    const team1Over = matchHistory.team1?.overData?.[i - 1] || { runs: 0, wickets: 0 };
    const team2Over = matchHistory.team2?.overData?.[i - 1] || { runs: 0, wickets: 0 };
    
    data.push({
      over: i,
      [`${matchHistory.team1?.name || 'Team 1'} Runs`]: team1Over.runs,
      [`${matchHistory.team2?.name || 'Team 2'} Runs`]: team2Over.runs,
      [`${matchHistory.team1?.name || 'Team 1'} Wickets`]: team1Over.wickets,
      [`${matchHistory.team2?.name || 'Team 2'} Wickets`]: team2Over.wickets
    });
  }

  return data;
};

export const calculateMatchResult = (team1, team2, currentInnings) => {
  if (currentInnings === 1) {
    // First innings completed
    return null;
  }

  const battingFirst = team1.score > team2.score ? team2 : team1;
  const battingSecond = team1.score > team2.score ? team1 : team2;

  if (battingSecond.score > battingFirst.score) {
    const wicketsRemaining = 10 - battingSecond.wickets;
    return `${battingSecond.name} won by ${wicketsRemaining} wickets`;
  } else if (battingFirst.score > battingSecond.score) {
    const runsMargin = battingFirst.score - battingSecond.score;
    return `${battingFirst.name} won by ${runsMargin} runs`;
  } else {
    return "Match tied";
  }
};

export const isMatchFinished = (team, oversPerInnings, currentInnings, target = null) => {
  // Check if all overs completed
  if (team.overs >= oversPerInnings) return true;
  
  // Check if all out (considering one-man standing and dynamic team size)
  const totalPlayers = team.players.length;
  if (team.wickets >= totalPlayers - 1) return true; // One-man standing rule
  
  // Check if target reached (second innings only)
  if (currentInnings === 2 && target && team.score >= target) return true;
  
  return false;
};

export const getManOfTheMatch = (team1, team2) => {
  const allPlayers = [...team1.players, ...team2.players];
  
  // Calculate performance score for each player
  const playerPerformances = allPlayers.map(player => {
    let score = 0;
    
    // Batting performance (runs scored)
    score += player.runs * 1;
    
    // Bowling performance (wickets taken)
    score += player.wickets * 20;
    
    // Strike rate bonus (for batsmen who scored 10+ runs)
    if (player.runs >= 10 && player.ballsFaced > 0) {
      const strikeRate = (player.runs / player.ballsFaced) * 100;
      if (strikeRate > 150) score += 15;
      else if (strikeRate > 120) score += 10;
      else if (strikeRate > 100) score += 5;
    }
    
    // Economy rate bonus (for bowlers who bowled 1+ overs)
    if (player.oversBowled >= 1) {
      const economy = player.runsConceded / player.oversBowled;
      if (economy < 4) score += 15;
      else if (economy < 6) score += 10;
      else if (economy < 8) score += 5;
    }
    
    // Bonus for match-winning performance
    const playerTeam = team1.players.includes(player) ? team1 : team2;
    const isWinningTeam = getMatchResult(team1, team2).includes(playerTeam.name);
    if (isWinningTeam) score += 10;
    
    return {
      ...player,
      performanceScore: score,
      teamName: playerTeam.name
    };
  });
  
  // Sort by performance score and return the best performer
  playerPerformances.sort((a, b) => b.performanceScore - a.performanceScore);
  return playerPerformances[0];
};

export const getAvailableBatsmen = (team, currentBatsmen) => {
  return team.players.filter(player => 
    !player.isOut && 
    player.id !== currentBatsmen.batsman1?.id &&
    player.id !== currentBatsmen.batsman2?.id
  );
};

export const getAvailableBowlers = (team, currentBowler) => {
  return team.players.filter(player => 
    player.id !== currentBowler?.id
  );
};

export const updatePlayerStats = (player, action) => {
  const updatedPlayer = { ...player };
  
  switch (action.type) {
    case 'RUNS_SCORED':
      updatedPlayer.runs = (updatedPlayer.runs || 0) + action.runs;
      updatedPlayer.balls = (updatedPlayer.balls || 0) + 1;
      break;
    case 'WICKET_TAKEN':
      updatedPlayer.balls = (updatedPlayer.balls || 0) + 1;
      updatedPlayer.isOut = true;
      break;
    case 'BOWLER_RUNS_CONCEDED':
      updatedPlayer.runsConceded = (updatedPlayer.runsConceded || 0) + action.runs;
      updatedPlayer.ballsBowled = (updatedPlayer.ballsBowled || 0) + 1;
      break;
    case 'BOWLER_WICKET':
      updatedPlayer.wickets = (updatedPlayer.wickets || 0) + 1;
      updatedPlayer.ballsBowled = (updatedPlayer.ballsBowled || 0) + 1;
      break;
    case 'COMPLETE_OVER':
      updatedPlayer.overs = Math.floor((updatedPlayer.ballsBowled || 0) / 6);
      break;
    default:
      break;
  }
  
  return updatedPlayer;
};

