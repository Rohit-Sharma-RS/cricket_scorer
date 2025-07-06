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
    
    case 'SCORE_RUNS': {
      const updatedTeams = state.teams.map(team => {
        if (team.id !== action.payload.teamId) return team;

        return {
          ...team,
          score: team.score + action.payload.runs
        };
      });

      const updatedBowler = {
        ...state.currentBowler,
        runsConceded: (state.currentBowler.runsConceded || 0) + action.payload.runs,
        ballsBowled: (state.currentBowler.ballsBowled || 0) + 1
      };

      return {
        ...state,
        teams: updatedTeams,
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.batsman]: {
            ...state.currentBatsmen[action.payload.batsman],
            runs: state.currentBatsmen[action.payload.batsman].runs + action.payload.runs,
            balls: state.currentBatsmen[action.payload.batsman].balls + 1
          }
        },
        currentBowler: updatedBowler,
        currentOver: [...state.currentOver, action.payload],
        ballCount: state.ballCount + 1
      };
    }

    
    case 'SCORE_EXTRA':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { ...team, score: team.score + action.payload.runs, extras: team.extras + action.payload.runs }
            : team
        ),
        currentOver: [...state.currentOver, action.payload],
        ballCount: action.payload.extraType === 'wide' || action.payload.extraType === 'noball' 
          ? state.ballCount 
          : state.ballCount + 1
      };
    
    case 'WICKET_TAKEN':
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { ...team, wickets: team.wickets + 1 }
            : team
        ),
        currentBatsmen: {
          ...state.currentBatsmen,
          [action.payload.batsman]: {
            ...state.currentBatsmen[action.payload.batsman],
            isOut: true,
            balls: state.currentBatsmen[action.payload.batsman].balls + 1
          }
        },
        currentOver: [...state.currentOver, action.payload],
        ballCount: state.ballCount + 1
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
        overCount: state.overCount + 1,
        ballCount: 0,
        currentOver: [],
        currentBowler: {
          ...state.currentBowler,
          overs: (state.currentBowler.overs || 0) + 1
        },
        showBowlerChangeModal: true
      };

    
    case 'END_INNINGS':
      return {
        ...state,
        currentInnings: state.currentInnings + 1,
        ballCount: 0,
        overCount: 0,
        currentOver: []
      };
    
    case 'END_MATCH':
      return {
        ...state,
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

