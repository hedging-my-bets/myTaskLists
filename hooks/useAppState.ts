
import { useState, useEffect, useCallback } from 'react';
import { AppState, TaskTemplate, Task } from '@/types';
import { loadAppState, saveAppState, getTodayKey, generateTasksFromTemplates } from '@/utils/storage';
import { shouldRollover, performRollover, getNearestTaskIndex, updateTaskTitle, updateTaskDescription } from '@/utils/taskLogic';
import { completeTask, missTask } from '@/utils/petLogic';
import { syncWidgetState, requestWidgetReload } from '@/shared/WidgetStateStore';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { handleDeepLink } from '@/navigation/deeplinks';

export const useAppState = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 [useAppState] Initializing app state...');
    loadState();
  }, []);

  // Set up deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔗 [useAppState] Deep link received:', url);
      if (state) {
        handleDeepLink(url, state, updateState);
      } else {
        console.log('⚠️  [useAppState] State not ready, ignoring deep link');
      }
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url && state) {
        console.log('🔗 [useAppState] Initial deep link:', url);
        handleDeepLink(url, state, updateState);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [state]);

  const loadState = async () => {
    console.log('📖 [useAppState] Loading state...');
    
    try {
      let loadedState = await loadAppState();
      
      console.log('🔍 [useAppState] Checking rollover...');
      // Check if rollover is needed
      if (shouldRollover(loadedState.lastRolloverDate, loadedState.settings.graceMinutes)) {
        console.log('🔄 [useAppState] Rollover needed, performing...');
        loadedState = performRollover(loadedState);
        await saveAppState(loadedState);
      }
      
      // Update current task index to nearest task
      console.log('🎯 [useAppState] Finding nearest task...');
      const nearestIndex = getNearestTaskIndex(loadedState.tasks, loadedState.settings.graceMinutes);
      loadedState.currentTaskIndex = nearestIndex;
      
      setState(loadedState);
      
      console.log('🔄 [useAppState] Syncing widget state...');
      // Sync widget state
      await syncWidgetState(
        loadedState.tasks,
        loadedState.currentTaskIndex,
        loadedState.petState,
        loadedState.settings,
        loadedState.lastRolloverDate
      );
      
      console.log('✅ [useAppState] State loaded and synced successfully');
    } catch (error) {
      console.error('❌ [useAppState] Error loading state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = useCallback(async (newState: AppState) => {
    console.log('💾 [useAppState] Updating state...');
    console.log(`   Tasks: ${newState.tasks.length}`);
    console.log(`   Pet XP: ${newState.petState.xp}`);
    console.log(`   Pet Stage: ${newState.petState.stageIndex}`);
    console.log(`   Current index: ${newState.currentTaskIndex}`);
    
    setState(newState);
    await saveAppState(newState);
    
    console.log('🔄 [useAppState] Syncing widget after state update...');
    // Sync widget state after every update
    await syncWidgetState(
      newState.tasks,
      newState.currentTaskIndex,
      newState.petState,
      newState.settings,
      newState.lastRolloverDate
    );
    
    console.log('✅ [useAppState] State updated and synced');
  }, []);

  const completeCurrentTask = useCallback(async () => {
    console.log('✅ [useAppState] ========== COMPLETE TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    console.log(`   Today's tasks: ${todayTasks.length}`);
    
    // Find the first pending task
    const currentTask = todayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    
    if (!currentTask) {
      console.log('⚠️  [useAppState] No pending task to complete');
      return;
    }
    
    console.log(`   Completing: "${currentTask.title}" (${currentTask.dueHour >= 0 ? `${currentTask.dueHour}:00` : 'anytime'})`);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isDone: true, isSkipped: false, isMissed: false } : t
    );
    
    console.log('🐾 [useAppState] Calculating XP gain...');
    const newPetState = completeTask(state.petState);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK COMPLETED ==========');
  }, [state, updateState]);

  const skipCurrentTask = useCallback(async () => {
    console.log('⏭️  [useAppState] ========== SKIP TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    // Find the first pending task
    const currentTask = todayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    
    if (!currentTask) {
      console.log('⚠️  [useAppState] No pending task to skip');
      return;
    }
    
    console.log(`   Skipping: "${currentTask.title}" (${currentTask.dueHour >= 0 ? `${currentTask.dueHour}:00` : 'anytime'})`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isSkipped: true, isDone: false, isMissed: false } : t
    );
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK SKIPPED ==========');
  }, [state, updateState]);

  const missCurrentTask = useCallback(async () => {
    console.log('❌ [useAppState] ========== MISS TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    // Find the first pending task
    const currentTask = todayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    
    if (!currentTask) {
      console.log('⚠️  [useAppState] No pending task to miss');
      return;
    }
    
    console.log(`   Missing: "${currentTask.title}" (${currentTask.dueHour >= 0 ? `${currentTask.dueHour}:00` : 'anytime'})`);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isMissed: true, isDone: false, isSkipped: false } : t
    );
    
    console.log('🐾 [useAppState] Applying XP penalty...');
    const newPetState = missTask(state.petState);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK MISSED ==========');
  }, [state, updateState]);

  const reopenTask = useCallback(async (taskId: string) => {
    console.log(`🔓 [useAppState] Reopening task: ${taskId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, isSkipped: false, isDone: false, isMissed: false } : t
    );
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task reopened');
  }, [state, updateState]);

  const nextTask = useCallback(async () => {
    console.log('➡️  [useAppState] Moving to next task...');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const newIndex = (state.currentTaskIndex + 1) % todayTasks.length;
    
    console.log(`   Index: ${state.currentTaskIndex} → ${newIndex}`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskIndex: newIndex,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Moved to next task');
  }, [state, updateState]);

  const prevTask = useCallback(async () => {
    console.log('⬅️  [useAppState] Moving to previous task...');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const newIndex = state.currentTaskIndex === 0 ? todayTasks.length - 1 : state.currentTaskIndex - 1;
    
    console.log(`   Index: ${state.currentTaskIndex} → ${newIndex}`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskIndex: newIndex,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Moved to previous task');
  }, [state, updateState]);

  const updateGraceMinutes = useCallback(async (minutes: number) => {
    console.log(`⏰ [useAppState] Updating grace minutes: ${state?.settings.graceMinutes} → ${minutes}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    await updateState({
      ...state,
      settings: {
        ...state.settings,
        graceMinutes: Math.max(0, Math.min(30, minutes)),
      },
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Grace minutes updated');
  }, [state, updateState]);

  const editTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    console.log(`✏️  [useAppState] Editing task title: ${taskId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const updatedTasks = updateTaskTitle(state.tasks, taskId, newTitle);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task title updated');
  }, [state, updateState]);

  const editTaskDescription = useCallback(async (taskId: string, newDescription: string) => {
    console.log(`✏️  [useAppState] Editing task description: ${taskId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const updatedTasks = updateTaskDescription(state.tasks, taskId, newDescription);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task description updated');
  }, [state, updateState]);

  const addTaskTemplate = useCallback(async (template: Omit<TaskTemplate, 'id'>, targetDate?: string) => {
    console.log('➕ [useAppState] Adding task template...');
    console.log(`   Title: "${template.title}"`);
    console.log(`   Hour: ${template.dueHour >= 0 ? `${template.dueHour}:00` : 'anytime'}`);
    console.log(`   Recurring: ${template.isRecurring}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }

    const newTemplate: TaskTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    console.log(`   Template ID: ${newTemplate.id}`);

    const updatedTemplates = [...(state.taskTemplates || []), newTemplate];

    // Generate tasks for the target date (or today if not specified)
    const taskDate = targetDate || getTodayKey();
    const dayOfWeek = new Date(taskDate).getDay();
    
    console.log(`   Target date: ${taskDate} (day ${dayOfWeek})`);
    
    let newTasks = [...state.tasks];
    
    // Only add task if it's not recurring or if the target date is one of the selected days
    if (!template.isRecurring || template.recurringDays.includes(dayOfWeek)) {
      const newTask = {
        id: `${taskDate}-${newTemplate.id}`,
        title: template.title,
        description: template.description,
        dueHour: template.dueHour,
        dayKey: taskDate,
        isDone: false,
        isSkipped: false,
        isMissed: false,
        isAnytime: template.isAnytime,
        isRecurring: template.isRecurring,
        recurringDays: template.recurringDays,
        templateId: newTemplate.id,
      };
      newTasks.push(newTask);
      console.log(`   ✅ Created task for ${taskDate}`);
    } else {
      console.log(`   ⏭️  Skipped task creation (not scheduled for day ${dayOfWeek})`);
    }

    await updateState({
      ...state,
      taskTemplates: updatedTemplates,
      tasks: newTasks,
    });

    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task template added');
  }, [state, updateState]);

  const deleteTaskTemplate = useCallback(async (templateId: string) => {
    console.log(`🗑️  [useAppState] Deleting task template: ${templateId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }

    const updatedTemplates = state.taskTemplates.filter(t => t.id !== templateId);

    // Remove all tasks associated with this template
    const tasksToRemove = state.tasks.filter(t => t.templateId === templateId);
    console.log(`   Removing ${tasksToRemove.length} associated tasks`);
    
    const updatedTasks = state.tasks.filter(t => t.templateId !== templateId);

    await updateState({
      ...state,
      taskTemplates: updatedTemplates,
      tasks: updatedTasks,
    });

    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task template deleted');
  }, [state, updateState]);

  return {
    state,
    loading,
    completeCurrentTask,
    skipCurrentTask,
    missCurrentTask,
    reopenTask,
    nextTask,
    prevTask,
    updateGraceMinutes,
    editTaskTitle,
    editTaskDescription,
    addTaskTemplate,
    deleteTaskTemplate,
    refreshState: loadState,
  };
};
