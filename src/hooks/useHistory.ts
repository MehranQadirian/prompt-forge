import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;
const BATCH_DELAY_MS = 800;

interface EditorState {
  text: string;
  cursorStart: number;
  cursorEnd: number;
}

interface HistoryStore {
  undoStack: EditorState[];
  redoStack: EditorState[];
  current: EditorState;
}

export function useHistoryState(initialValue: string) {
  const storeRef = useRef<HistoryStore>({
    undoStack: [],
    redoStack: [],
    current: { text: initialValue, cursorStart: 0, cursorEnd: 0 },
  });

  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSnapshotRef = useRef<EditorState | null>(null);
  const isUndoRedoRef = useRef(false);
  const [, forceUpdate] = useState(0);

  const triggerUpdate = useCallback(() => forceUpdate((n) => n + 1), []);

  // Snapshot the state before a batch of changes begins
  const snapshotBeforeChange = useCallback((text: string, cursorStart: number, cursorEnd: number) => {
    if (!pendingSnapshotRef.current) {
      pendingSnapshotRef.current = {
        text,
        cursorStart,
        cursorEnd,
      };
    }
  }, []);

  // Push a snapshot to the undo stack
  const pushToUndo = useCallback((snapshot: EditorState) => {
    const store = storeRef.current;
    store.undoStack.push(snapshot);
    if (store.undoStack.length > MAX_HISTORY) {
      store.undoStack.shift();
    }
    // New change branch — clear redo
    store.redoStack = [];
  }, []);

  // Flush the pending batch: save the snapshot to undo stack
  const flushBatch = useCallback(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    if (pendingSnapshotRef.current) {
      pushToUndo(pendingSnapshotRef.current);
      pendingSnapshotRef.current = null;
      triggerUpdate();
    }
  }, [pushToUndo, triggerUpdate]);

  // Schedule a batch save
  const scheduleBatch = useCallback(
    (previousText: string, cursorStart: number, cursorEnd: number) => {
      snapshotBeforeChange(previousText, cursorStart, cursorEnd);

      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
      batchTimerRef.current = setTimeout(() => {
        flushBatch();
      }, BATCH_DELAY_MS);
    },
    [snapshotBeforeChange, flushBatch]
  );

  // Set text value (called on every keystroke)
  const setValue = useCallback(
    (newValue: string, cursorStart?: number, cursorEnd?: number) => {
      const store = storeRef.current;
      if (isUndoRedoRef.current) return;

      const cs = cursorStart ?? newValue.length;
      const ce = cursorEnd ?? cs;

      // Save previous text BEFORE updating
      const previousText = store.current.text;
      store.current = { text: newValue, cursorStart: cs, cursorEnd: ce };
      scheduleBatch(previousText, cs, ce);
    },
    [scheduleBatch]
  );

  // Set text value immediately (no batching) — for atomic actions
  const setValueImmediate = useCallback(
    (newValue: string, cursorStart?: number, cursorEnd?: number) => {
      const store = storeRef.current;
      if (isUndoRedoRef.current) return;

      // Flush any pending batch first
      flushBatch();

      const cs = cursorStart ?? newValue.length;
      const ce = cursorEnd ?? cs;

      // Push current state to undo before replacing
      pushToUndo({ ...store.current });
      store.current = { text: newValue, cursorStart: cs, cursorEnd: ce };
      triggerUpdate();
    },
    [flushBatch, pushToUndo, triggerUpdate]
  );

  // Commit final state (on keyboard dismiss, version save, etc.)
  const commitNow = useCallback(
    (value: string, cursorStart?: number, cursorEnd?: number) => {
      const store = storeRef.current;
      const cs = cursorStart ?? store.current.text.length;
      const ce = cursorEnd ?? cs;

      // Flush any pending batch
      flushBatch();

      // If value changed, ensure it's saved
      if (value !== store.current.text) {
        pushToUndo({ ...store.current });
        store.current = { text: value, cursorStart: cs, cursorEnd: ce };
        triggerUpdate();
      }
    },
    [flushBatch, pushToUndo, triggerUpdate]
  );

  // Undo
  const undo = useCallback(() => {
    const store = storeRef.current;
    if (store.undoStack.length === 0) return;

    // Flush any pending batch first
    flushBatch();

    isUndoRedoRef.current = true;

    // Push current to redo
    store.redoStack.push({ ...store.current });

    // Pop from undo
    const previous = store.undoStack.pop()!;
    store.current = previous;

    isUndoRedoRef.current = false;
    triggerUpdate();
  }, [flushBatch, triggerUpdate]);

  // Redo
  const redo = useCallback(() => {
    const store = storeRef.current;
    if (store.redoStack.length === 0) return;

    isUndoRedoRef.current = true;

    // Push current to undo
    store.undoStack.push({ ...store.current });

    // Pop from redo
    const next = store.redoStack.pop()!;
    store.current = next;

    isUndoRedoRef.current = false;
    triggerUpdate();
  }, [triggerUpdate]);

  // Record an atomic action (paste, formatting, AI replace)
  const recordAtomic = useCallback(
    (newValue: string, cursorStart?: number, cursorEnd?: number) => {
      setValueImmediate(newValue, cursorStart, cursorEnd);
    },
    [setValueImmediate]
  );

  // Get current cursor position for restoring after undo/redo
  const getCursor = useCallback(() => {
    const { cursorStart, cursorEnd } = storeRef.current.current;
    return { cursorStart, cursorEnd };
  }, []);

  const store = storeRef.current;

  return {
    present: store.current.text,
    canUndo: store.undoStack.length > 0,
    canRedo: store.redoStack.length > 0,
    setValue,
    undo,
    redo,
    commitNow,
    recordAtomic,
    getCursor,
  };
}
