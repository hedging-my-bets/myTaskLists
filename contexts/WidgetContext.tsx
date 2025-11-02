
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState as RNAppState } from 'react-native';
import { loadWidgetState, saveWidgetState, WidgetState } from '@/shared/WidgetStateStore';

interface WidgetContextType {
  widgetState: WidgetState | null;
  updateWidgetState: (state: WidgetState) => Promise<void>;
  refreshWidgetState: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgetState, setWidgetState] = useState<WidgetState | null>(null);

  useEffect(() => {
    refreshWidgetState();

    // Listen for app state changes to refresh widget state
    const subscription = RNAppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshWidgetState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const refreshWidgetState = async () => {
    const state = await loadWidgetState();
    setWidgetState(state);
  };

  const updateWidgetState = async (state: WidgetState) => {
    await saveWidgetState(state);
    setWidgetState(state);
  };

  return (
    <WidgetContext.Provider value={{ widgetState, updateWidgetState, refreshWidgetState }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};
