import React, { createContext, useContext, useReducer } from 'react';

const MatchContext = createContext();

const initialState = {
  match: null,
  teams: [],
  currentInnings: 1,
  currentBatsmen: { batsman1: null, batsman2: null },
  currentBowler: null,
  currentOver: [],
  ballCount: 0,
  overCount: 0,
  isDarkMode: true,
  matchStatus: 'setup', // setup, toss, playing, finished
  tossWinner: null,
  battingFirst: null,
  matchHistory: [],
  lastAction: null, // Store last action for undo
  showTossModal: false,
  showBowlerChangeModal: false,
  showRetiredBatsmanModal: false,
  showMatchEndModal: false,
  winner: null,
  winMargin: null,
  bestPerformer: null,
  bestBatsman: null,
  bestBowler: null
};

function matchReducer(state, action) {
  switch (action.type) {
    case 'SET_MATCH_SETUP':
      return {
        ...state,
        match: action.payload.match,
        teams: action.payload.teams,
        matchStatus: 'toss'
      };
    
    case 'SET_TOSS_RESULT':
      return {
        ...state,
        tossWinner: action.payload.tossWinner,
        battingFirst: action.payload.battingFirst,
        matchStatus: 'playing',
        showTossModal: false
      };
    
    case 'START_INNINGS':
      return {
        ...state,
        currentInnings: action.payload.innings,
        currentBatsmen: action.payload.batsmen,
        currentBowler: action.payload.bowler,
        ballCount: 0,
        overCount: 0,
        currentOver: []
      };
    
    case 'SCORE_RUNS':
      const newState = {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { 
                ...team, 
                score: team.score + action.payload.runs,
                players: team.players.map(player => 
                  player.id === state.currentBatsmen[action.payload.batsman]?.id
                    ? {
                        ...player,
                        runs: player.runs + action.payload.runs,
                        ballsFaced: player.ballsFaced + 1
                      }
                    : player
                )
              }
            : team
        ),
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.batsman]: {
            ...state.currentBatsmen[action.payload.batsman],
            runs: state.currentBatsmen[action.payload.batsman].runs + action.payload.runs,
            ballsFaced: state.currentBatsmen[action.payload.batsman].ballsFaced + 1
          }
        },
        currentOver: [...state.currentOver, action.payload],
        ballCount: state.ballCount + 1,
        lastAction: {
          type: 'SCORE_RUNS',
          payload: action.payload,
          previousState: {
            teams: state.teams,
            currentBatsmen: state.currentBatsmen,
            currentOver: state.currentOver,
            ballCount: state.ballCount
          }
        }
      };
      return newState;
    
    case 'SCORE_EXTRA':
      const ballCountIncrement = action.payload.extraType === 'wide' || action.payload.extraType === 'noball' ? 0 : 1;
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { ...team, score: team.score + action.payload.runs, extras: team.extras + action.payload.runs }
            : team
        ),
        currentOver: [...state.currentOver, action.payload],
        ballCount: state.ballCount + ballCountIncrement,
        lastAction: {
          type: 'SCORE_EXTRA',
          payload: action.payload,
          previousState: {
            teams: state.teams,
            currentOver: state.currentOver,
            ballCount: state.ballCount
          }
        }
      };
    
    case 'WICKET_TAKEN':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { 
                ...team, 
                wickets: team.wickets + 1,
                players: team.players.map(player => 
                  player.id === state.currentBatsmen[action.payload.batsman]?.id
                    ? {
                        ...player,
                        isOut: true,
                        ballsFaced: player.ballsFaced + 1
                      }
                    : player
                )
              }
            : team.id === action.payload.bowlingTeamId
            ? {
                ...team,
                players: team.players.map(player => 
                  player.id === state.currentBowler?.id
                    ? {
                        ...player,
                        wickets: player.wickets + 1,
                        oversBowled: player.oversBowled || 0
                      }
                    : player
                )
              }
            : team
        ),
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.batsman]: {
            ...state.currentBatsmen[action.payload.batsman],
            isOut: true,
            ballsFaced: state.currentBatsmen[action.payload.batsman].ballsFaced + 1
          }
        },
        currentOver: [...state.currentOver, action.payload],
        ballCount: state.ballCount + 1,
        lastAction: {
          type: 'WICKET_TAKEN',
          payload: action.payload,
          previousState: {
            teams: state.teams,
            currentBatsmen: state.currentBatsmen,
            currentOver: state.currentOver,
            ballCount: state.ballCount
          }
        }
      };
    
    case 'CHANGE_BOWLER':
      return {
        ...state,
        currentBowler: action.payload.bowler,
        showBowlerChangeModal: false
      };
    
    case 'RETIRE_BATSMAN':
      return {
        ...state,
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.position]: {
            ...state.currentBatsmen[action.payload.position],
            isRetired: true
          }
        },
        showRetiredBatsmanModal: false
      };
    
    case 'NEW_BATSMAN':
      return {
        ...state,
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.position]: action.payload.batsman
        }
      };
    
    case 'COMPLETE_OVER':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.players.some(player => player.id === state.currentBowler?.id)
            ? {
                ...team,
                players: team.players.map(player => 
                  player.id === state.currentBowler?.id
                    ? {
                        ...player,
                        oversBowled: (player.oversBowled || 0) + 1,
                        runsConceded: (player.runsConceded || 0) + state.currentOver.reduce((total, ball) => total + (ball.runs || 0), 0)
                      }
                    : player
                )
              }
            : team
        ),
        overCount: state.overCount + 1,
        ballCount: 0,
        currentOver: [],
        showBowlerChangeModal: true
      };
    
    case 'END_INNINGS':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === (state.currentInnings === 1 ? state.battingFirst : (state.battingFirst === state.teams[0].id ? state.teams[1].id : state.teams[0].id))
            ? { ...team, overs: state.overCount + (state.ballCount > 0 ? state.ballCount / 6 : 0) }
            : team
        ),
        currentInnings: state.currentInnings + 1,
        ballCount: 0,
        overCount: 0,
        currentOver: []
      };
    
    case 'END_MATCH':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === (state.currentInnings === 1 ? state.battingFirst : (state.battingFirst === state.teams[0].id ? state.teams[1].id : state.teams[0].id))
            ? { ...team, overs: state.overCount + (state.ballCount > 0 ? state.ballCount / 6 : 0) }
            : team
        ),
        matchStatus: 'finished',
        winner: action.payload.winner,
        winMargin: action.payload.winMargin,
        bestPerformer: action.payload.bestPerformer,
        bestBatsman: action.payload.bestBatsman,
        bestBowler: action.payload.bestBowler,
        showMatchEndModal: true
      };
    
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      };
    
    case 'SHOW_MODAL':
      return {
        ...state,
        [action.payload.modal]: true
      };
    
    case 'HIDE_MODAL':
      return {
        ...state,
        [action.payload.modal]: false
      };
    
    case 'UNDO_LAST_ACTION':
      if (!state.lastAction) return state;
      
      const { previousState } = state.lastAction;
      return {
        ...state,
        teams: previousState.teams,
        currentBatsmen: previousState.currentBatsmen || state.currentBatsmen,
        currentOver: previousState.currentOver,
        ballCount: previousState.ballCount,
        lastAction: null // Clear the last action after undo
      };
    
    case 'RESET_MATCH':
      return initialState;
    
    default:
      return state;
  }
}

export function MatchProvider({ children }) {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  
  return (
    <MatchContext.Provider value={{ state, dispatch }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
}

