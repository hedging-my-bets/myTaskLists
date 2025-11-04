
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
  console.log(`🔗 [deeplinks] Parsing deep link: ${url}`);
  
  const parsed = Linking.parse(url);
  
  console.log(`   Hostname: ${parsed.hostname}`);
  console.log(`   Path: ${parsed.path}`);
  
  let action: DeepLinkAction | null = null;
  
  if (parsed.hostname === 'complete') {
    action = 'complete';
  } else if (parsed.hostname === 'skip') {
    action = 'skip';
  } else if (parsed.hostname === 'prev') {
    action = 'prev';
  } else if (parsed.hostname === 'next') {
    action = 'next';
  } else if (parsed.hostname === 'miss') {
    action = 'miss';
  }
  
  console.log(`   Action: ${action || 'UNKNOWN'}`);
  
  return action;
};

/**
 * Handle complete action
 */
export const handleCompleteAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('✅ [deeplinks] ========== HANDLE COMPLETE ACTION ==========');
  
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  console.log(`   Current task index: ${state.currentTaskIndex}`);
  console.log(`   Today's tasks: ${todayTasks.length}`);
  
  if (!currentTask) {
    console.log('⚠️  [deeplinks] No current task found');
    return;
  }
  
  if (currentTask.isDone) {
    console.log('⚠️  [deeplinks] Task already completed');
    return;
  }
  
  console.log(`   Completing: "${currentTask.title}"`);
  
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isDone: true } : t
  );
  
  console.log('🐾 [deeplinks] Calculating XP gain...');
  const newPetState = completeTask(state.petState);
  
  const newState = {
    ...state,
    tasks: updatedTasks,
    petState: newPetState,
  };
  
  console.log('💾 [deeplinks] Updating state...');
  await updateState(newState);
  
  console.log('🔄 [deeplinks] Syncing widget...');
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  
  console.log('🔄 [deeplinks] Requesting widget reload...');
  await requestWidgetReload();
  
  console.log('✅ [deeplinks] ========== COMPLETE ACTION DONE ==========');
};

/**
 * Handle skip action
 */
export const handleSkipAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('⏭️  [deeplinks] ========== HANDLE SKIP ACTION ==========');
  
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  console.log(`   Current task index: ${state.currentTaskIndex}`);
  console.log(`   Today's tasks: ${todayTasks.length}`);
  
  if (!currentTask) {
    console.log('⚠️  [deeplinks] No current task found');
    return;
  }
  
  if (currentTask.isSkipped) {
    console.log('⚠️  [deeplinks] Task already skipped');
    return;
  }
  
  console.log(`   Skipping: "${currentTask.title}"`);
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isSkipped: true } : t
  );
  
  const newState = {
    ...state,
    tasks: updatedTasks,
  };
  
  console.log('💾 [deeplinks] Updating state...');
  await updateState(newState);
  
  console.log('🔄 [deeplinks] Syncing widget...');
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  
  console.log('🔄 [deeplinks] Requesting widget reload...');
  await requestWidgetReload();
  
  console.log('✅ [deeplinks] ========== SKIP ACTION DONE ==========');
};

/**
 * Handle miss action (manually mark as missed and lose XP)
 */
export const handleMissAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('❌ [deeplinks] ========== HANDLE MISS ACTION ==========');
  
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];
  
  console.log(`   Current task index: ${state.currentTaskIndex}`);
  console.log(`   Today's tasks: ${todayTasks.length}`);
  
  if (!currentTask) {
    console.log('⚠️  [deeplinks] No current task found');
    return;
  }
  
  if (currentTask.isMissed) {
    console.log('⚠️  [deeplinks] Task already missed');
    return;
  }
  
  console.log(`   Missing: "${currentTask.title}"`);
  
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  
  const updatedTasks = state.tasks.map(t => 
    t.id === currentTask.id ? { ...t, isMissed: true } : t
  );
  
  console.log('🐾 [deeplinks] Applying XP penalty...');
  const newPetState = missTask(state.petState);
  
  const newState = {
    ...state,
    tasks: updatedTasks,
    petState: newPetState,
  };
  
  console.log('💾 [deeplinks] Updating state...');
  await updateState(newState);
  
  console.log('🔄 [deeplinks] Syncing widget...');
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  
  console.log('🔄 [deeplinks] Requesting widget reload...');
  await requestWidgetReload();
  
  console.log('✅ [deeplinks] ========== MISS ACTION DONE ==========');
};

/**
 * Handle next action
 */
export const handleNextAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('➡️  [deeplinks] ========== HANDLE NEXT ACTION ==========');
  
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const newIndex = (state.currentTaskIndex + 1) % todayTasks.length;
  
  console.log(`   Current index: ${state.currentTaskIndex}`);
  console.log(`   New index: ${newIndex}`);
  console.log(`   Total tasks: ${todayTasks.length}`);
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const newState = {
    ...state,
    currentTaskIndex: newIndex,
  };
  
  console.log('💾 [deeplinks] Updating state...');
  await updateState(newState);
  
  console.log('🔄 [deeplinks] Syncing widget...');
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  
  console.log('🔄 [deeplinks] Requesting widget reload...');
  await requestWidgetReload();
  
  console.log('✅ [deeplinks] ========== NEXT ACTION DONE ==========');
};

/**
 * Handle prev action
 */
export const handlePrevAction = async (
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('⬅️  [deeplinks] ========== HANDLE PREV ACTION ==========');
  
  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const newIndex = state.currentTaskIndex === 0 ? todayTasks.length - 1 : state.currentTaskIndex - 1;
  
  console.log(`   Current index: ${state.currentTaskIndex}`);
  console.log(`   New index: ${newIndex}`);
  console.log(`   Total tasks: ${todayTasks.length}`);
  
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const newState = {
    ...state,
    currentTaskIndex: newIndex,
  };
  
  console.log('💾 [deeplinks] Updating state...');
  await updateState(newState);
  
  console.log('🔄 [deeplinks] Syncing widget...');
  await syncWidgetState(
    newState.tasks,
    newState.currentTaskIndex,
    newState.petState,
    newState.settings,
    newState.lastRolloverDate
  );
  
  console.log('🔄 [deeplinks] Requesting widget reload...');
  await requestWidgetReload();
  
  console.log('✅ [deeplinks] ========== PREV ACTION DONE ==========');
};

/**
 * Handle deep link action
 */
export const handleDeepLink = async (
  url: string,
  state: AppState,
  updateState: (state: AppState) => Promise<void>
): Promise<void> => {
  console.log('🔗 [deeplinks] ========== HANDLING DEEP LINK ==========');
  console.log(`   URL: ${url}`);
  
  const action = parseDeepLink(url);
  
  if (!action) {
    console.log('❌ [deeplinks] Unknown deep link action');
    return;
  }
  
  console.log(`   Action: ${action}`);
  
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
  
  console.log('✅ [deeplinks] ========== DEEP LINK HANDLED ==========');
};

/**
 * Create deep link URL
 */
export const createDeepLink = (action: DeepLinkAction): string => {
  const url = Linking.createURL(action);
  console.log(`🔗 [deeplinks] Created deep link: ${url} (action: ${action})`);
  return url;
};
