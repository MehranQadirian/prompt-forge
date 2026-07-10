import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { BottomSheet, BottomSheetRef } from './BottomSheet';

interface BottomSheetContextValue {
  showBottomSheet: (content: React.ReactNode) => void;
  hideBottomSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue>({
  showBottomSheet: () => {},
  hideBottomSheet: () => {},
});

export function useBottomSheet() {
  return useContext(BottomSheetContext);
}

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<React.ReactNode>(null);
  const sheetRef = useRef<BottomSheetRef>(null);

  const showBottomSheet = useCallback((sheetContent: React.ReactNode) => {
    setContent(sheetContent);
    // Small delay to ensure content is rendered before opening
    requestAnimationFrame(() => {
      sheetRef.current?.present();
    });
  }, []);

  const hideBottomSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  return (
    <BottomSheetContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
      {children}
      <BottomSheet ref={sheetRef} onClose={() => setContent(null)}>
        {content}
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
}
