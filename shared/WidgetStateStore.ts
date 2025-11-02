
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, PetState, Settings } from '@/types';
import { getTodayKey } from '@/utils/storage';

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
 * In a native implementation, this would use App Groups (UserDefaults with suiteName)
 * For React Native, we use AsyncStorage which can be accessed by both app and widget
 */
export const saveWidgetState = async (state: WidgetState): Promise<void> => {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now(),
    };
    await AsyncStorage.setItem(WIDGET_STATE_KEY, JSON.stringify(stateWithTimestamp));
    console.log('Widget state saved:', stateWithTimestamp);
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
      console.log('Widget state loaded:', state);
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
 * In native iOS, this would call WidgetCenter.shared.reloadTimelines(ofKind:)
 * For React Native, we'll use a notification or event system
 */
export const requestWidgetReload = async (): Promise<void> => {
  console.log('Widget reload requested');
  // In a native implementation, this would trigger widget refresh
  // For now, we just log it
};
