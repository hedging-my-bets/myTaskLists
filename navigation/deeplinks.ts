
import * as Linking from 'expo-linking';
import { AppState } from '@/types';
import { completeTask, missTask } from '@/utils/petLogic';
import { getTodayKey } from '@/utils/storage';
import { syncWidgetState, requestWidgetReload } from '@/shared/WidgetStateStore';
import * as Haptics from 'expo-haptics';

export type DeepLinkAction = 'complete' | 'skip' | 'prev' | 'next' | 'miss';

/**
 * Parse deep link URL and extract action
 */
export const parseDeepLink = (url: string): DeepLinkAction | null => {
  const parsed = Linking.parse(url);
  
  if (parsed.hostname === 'complete') {
    return 'complete';
  } else if (parsed.hostname === 'skip') {
    return 'skip';
  } else if (parsed.hostname === 'prev') {
    return 'prev';
  } else if (parsed.hostname === 'next') {
    return 'next';
  } else if (parsed.hostname === 'miss') {
    return 'miss';
  }
  
  return null;
};

/**
 * Handle complete action
 */
export const handleCompleteAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  if (!currentTask || currentTask.isDone) {
    console.log('No task to complete or already done');
    return;
  }
  
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isDone: true } : t
  );
  
  const newPetState = completeTask(state.petState);
  
  const newState = {
    ...state,
    tasks: updatedTasks,
    petState: newPetState,
  };
  
  await updateState(newState);
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  await requestWidgetReload();
};

/**
 * Handle skip action
 */
export const handleSkipAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  if (!currentTask || currentTask.isSkipped) {
    console.log('No task to skip or already skipped');
    return;
  }
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isSkipped: true } : t
  );
  
  const newState = {
    ...state,
    tasks: updatedTasks,
  };
  
  await updateState(newState);
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  await requestWidgetReload();
};

/**
 * Handle miss action (manually mark as missed and lose XP)
 */
export const handleMissAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  if (!currentTask || currentTask.isMissed) {
    console.log('No task to miss or already missed');
    return;
  }
  
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isMissed: true } : t
  );
  
  const newPetState = missTask(state.petState);
  
  const newState = {
    ...state,
    tasks: updatedTasks,
    petState: newPetState,
  };
  
  await updateState(newState);
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  await requestWidgetReload();
};

/**
 * Handle next action
 */
export const handleNextAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const newIndex = (state.currentTaskIndex + 1) % todayTasks.length;
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const newState = {
    ...state,
    currentTaskIndex: newIndex,
  };
  
  await updateState(newState);
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  await requestWidgetReload();
};

/**
 * Handle prev action
 */
export const handlePrevAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const newIndex = state.currentTaskIndex === 0 ? todayTasks.length - 1 : state.currentTaskIndex - 1;
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const newState = {
    ...state,
    currentTaskIndex: newIndex,
  };
  
  await updateState(newState);
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  await requestWidgetReload();
};

/**
 * Handle deep link action
 */
export const handleDeepLink = async (
  url: string,
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  const action = parseDeepLink(url);
  
  if (!action) {
    console.log('Unknown deep link action:', url);
    return;
  }
  
  console.log('Handling deep link action:', action);
  
  switch (action) {
    case 'complete':
      await handleCompleteAction(state, updateState);
      break;
    case 'skip':
      await handleSkipAction(state, updateState);
      break;
    case 'miss':
      await handleMissAction(state, updateState);
      break;
    case 'next':
      await handleNextAction(state, updateState);
      break;
    case 'prev':
      await handlePrevAction(state, updateState);
      break;
  }
};

/**
 * Create deep link URL
 */
export const createDeepLink = (action: DeepLinkAction): string => {
  return Linking.createURL(action);
};
