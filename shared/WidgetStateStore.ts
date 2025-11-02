
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, PetState, Settings } from '@/types';
import { getTodayKey } from '@/utils/storage';
import { Platform } from 'react-native';
import { saveToAppGroup, reloadWidget } from '@/modules/WidgetBridge';

const WIDGET_STATE_KEY = '@PetProgress:widgetState';

export interface WidgetState {
  todayTasks: Task[];
  currentIndex: number;
  petState: PetState;
  graceMinutes: number;
  lastRolloverAt: string;
  lastUpdated: number; // timestamp
}

/**
 * Save widget state to shared storage
 * On iOS with App Groups, this uses UserDefaults with suiteName via native bridge
 * Also saves to AsyncStorage for React Native access
 */
export const saveWidgetState = async (state: WidgetState): Promise<void> => {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now(),
    };
    
    const jsonString = JSON.stringify(stateWithTimestamp);
    
    // Save to AsyncStorage for React Native
    await AsyncStorage.setItem(WIDGET_STATE_KEY, jsonString);
    
    // On iOS, also save to App Group shared container
    if (Platform.OS === 'ios') {
      await saveToAppGroup(WIDGET_STATE_KEY, jsonString);
    }
    
    console.log('Widget state saved:', {
      taskCount: stateWithTimestamp.todayTasks.length,
      currentIndex: stateWithTimestamp.currentIndex,
      petXP: stateWithTimestamp.petState.xp,
      petStage: stateWithTimestamp.petState.stageIndex,
      timestamp: new Date(stateWithTimestamp.lastUpdated).toISOString(),
    });
  } catch (error) {
    console.error('Error saving widget state:', error);
  }
};

/**
 * Load widget state from shared storage
 */
export const loadWidgetState = async (): Promise<WidgetState | null> => {
  try {
    const stored = await AsyncStorage.getItem(WIDGET_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as WidgetState;
      console.log('Widget state loaded:', {
        taskCount: state.todayTasks.length,
        currentIndex: state.currentIndex,
        petXP: state.petState.xp,
        petStage: state.petState.stageIndex,
        timestamp: new Date(state.lastUpdated).toISOString(),
      });
      return state;
    }
  } catch (error) {
    console.error('Error loading widget state:', error);
  }
  return null;
};

/**
 * Update widget state from app state
 */
export const syncWidgetState = async (
  tasks: Task[],
  currentIndex: number,
  petState: PetState,
  settings: Settings,
  lastRolloverAt: string
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = tasks.filter(t => t.dayKey === todayKey);
  
  const widgetState: WidgetState = {
    todayTasks,
    currentIndex,
    petState,
    graceMinutes: settings.graceMinutes,
    lastRolloverAt,
    lastUpdated: Date.now(),
  };
  
  await saveWidgetState(widgetState);
};

/**
 * Request widget reload
 * Calls WidgetCenter.shared.reloadTimelines(ofKind:) via native bridge
 */
export const requestWidgetReload = async (): Promise<void> => {
  console.log('Widget reload requested - WidgetCenter.shared.reloadTimelines("PetProgressWidget")');
  
  if (Platform.OS === 'ios') {
    await reloadWidget('PetProgressWidget');
  }
};
