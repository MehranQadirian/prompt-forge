import { useReducer, useCallback, useRef, useEffect } from 'react';

const MAX_HISTORY = 50;

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

type HistoryAction =
  | { type: 'SET'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'SET': {
      const newPast = [...state.past, state.present].slice(-MAX_HISTORY);
      return { past: newPast, present: action.payload, future: [] };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [...state.future, state.present],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[state.future.length - 1];
      const newFuture = state.future.slice(0, -1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    default:
      return state;
  }
}

export function useHistoryState(initialValue: string) {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialValue,
    future: [],
  });

  const lastCommitted = useRef(initialValue);
  const presentRef = useRef(initialValue);

  presentRef.current = state.present;

  const setValue = useCallback((newValue: string) => {
    presentRef.current = newValue;
    if (newValue !== lastCommitted.current) {
      lastCommitted.current = newValue;
      dispatch({ type: 'SET', payload: newValue });
    }
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const commitNow = useCallback((value: string) => {
    presentRef.current = value;
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      dispatch({ type: 'SET', payload: value });
    }
  }, []);

  return {
    present: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setValue,
    undo,
    redo,
    commitNow,
  };
}
