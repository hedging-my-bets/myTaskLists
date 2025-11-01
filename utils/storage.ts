
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Task, PetState, Settings } from '@/types';

const STORAGE_KEY = '@PetProgress:appState';

const DEFAULT_SETTINGS: Settings = {
  graceMinutes: 15,
  privacyPolicyURL: 'https://example.com/privacy',
};

const DEFAULT_PET_STATE: PetState = {
  xp: 0,
  stageIndex: 0,
};

export const getDefaultTasks = (dayKey: string): Task[] => {
  const tasks: Task[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    tasks.push({
      id: `${dayKey}-${hour}`,
      title: `Task at ${hour}:00`,
      dueHour: hour,
      dayKey,
      isDone: false,
      isSkipped: false,
      isMissed: false,
    });
  }
  return tasks;
};

export const loadAppState = async (): Promise<AppState> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      console.log('Loaded app state:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading app state:', error);
  }

  const today = getTodayKey();
  const defaultState: AppState = {
    tasks: getDefaultTasks(today),
    petState: DEFAULT_PET_STATE,
    settings: DEFAULT_SETTINGS,
    currentTaskIndex: 0,
    lastRolloverDate: today,
  };
  
  await saveAppState(defaultState);
  return defaultState;
};

export const saveAppState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('Saved app state');
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

export const getTodayKey = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getCurrentHour = (): number => {
  return new Date().getHours();
};
