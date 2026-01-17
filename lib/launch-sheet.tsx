import React, { createContext, useContext, useState, useCallback } from 'react';

type LaunchSheetContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const LaunchSheetContext = createContext<LaunchSheetContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function LaunchSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <LaunchSheetContext.Provider value={{ isOpen, open, close }}>
      {children}
    </LaunchSheetContext.Provider>
  );
}

export function useLaunchSheet() {
  return useContext(LaunchSheetContext);
}
