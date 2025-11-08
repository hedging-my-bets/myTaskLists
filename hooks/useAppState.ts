
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
      
      // Migrate from currentTaskIndex to currentTaskId if needed
      if ('currentTaskIndex' in loadedState && !loadedState.currentTaskId) {
        const todayKey = getTodayKey();
        const todayTasks = loadedState.tasks.filter(t => t.dayKey === todayKey);
        const index = (loadedState as any).currentTaskIndex || 0;
        if (todayTasks.length > 0 && index < todayTasks.length) {
          loadedState.currentTaskId = todayTasks[index].id;
        } else {
          loadedState.currentTaskId = todayTasks[0]?.id || null;
        }
        console.log('🔄 [useAppState] Migrated from currentTaskIndex to currentTaskId');
      }
      
      // Set current task to first pending task if not set or invalid
      const todayKey = getTodayKey();
      const todayTasks = loadedState.tasks.filter(t => t.dayKey === todayKey);
      
      if (!loadedState.currentTaskId || !todayTasks.find(t => t.id === loadedState.currentTaskId)) {
        const firstPendingTask = todayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
        loadedState.currentTaskId = firstPendingTask?.id || todayTasks[0]?.id || null;
        console.log('🎯 [useAppState] Set current task to first pending task');
      }
      
      setState(loadedState);
      
      console.log('🔄 [useAppState] Syncing widget state...');
      // Sync widget state
      const currentTaskIndex = todayTasks.findIndex(t => t.id === loadedState.currentTaskId);
      await syncWidgetState(
        loadedState.tasks,
        Math.max(0, currentTaskIndex),
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
    console.log(`   Current task ID: ${newState.currentTaskId}`);
    
    setState(newState);
    await saveAppState(newState);
    
    console.log('🔄 [useAppState] Syncing widget after state update...');
    // Sync widget state after every update
    const todayKey = getTodayKey();
    const todayTasks = newState.tasks.filter(t => t.dayKey === todayKey);
    const currentTaskIndex = todayTasks.findIndex(t => t.id === newState.currentTaskId);
    
    await syncWidgetState(
      newState.tasks,
      Math.max(0, currentTaskIndex),
      newState.petState,
      newState.settings,
      newState.lastRolloverDate
    );
    
    console.log('✅ [useAppState] State updated and synced');
  }, []);

  const moveTaskToBottom = (tasks: Task[], taskId: string): Task[] => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return tasks;
    
    const task = tasks[taskIndex];
    const otherTasks = tasks.filter(t => t.id !== taskId);
    
    return [...otherTasks, task];
  };

  const selectTask = useCallback(async (taskId: string) => {
    console.log(`🎯 [useAppState] Selecting task: ${taskId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskId: taskId,
    });
    
    console.log('✅ [useAppState] Task selected');
  }, [state, updateState]);

  const completeTaskById = useCallback(async (taskId: string) => {
    console.log('✅ [useAppState] ========== COMPLETE TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const targetTask = todayTasks.find(t => t.id === taskId);
    
    if (!targetTask) {
      console.log('⚠️  [useAppState] Target task not found');
      return;
    }
    
    console.log(`   Completing: "${targetTask.title}" (${targetTask.dueHour >= 0 ? `${targetTask.dueHour}:00` : 'anytime'})`);
    
    // Calculate XP change based on previous state
    let newPetState = state.petState;
    
    // If task was previously missed, we need to add back the penalty AND the reward
    if (targetTask.isMissed) {
      console.log('🐾 [useAppState] Task was missed, reversing penalty and adding reward...');
      // Reverse the miss penalty (add back the XP that was deducted)
      newPetState = completeTask(newPetState);
      // Add the completion reward
      newPetState = completeTask(newPetState);
    } 
    // If task was not done before, just add the reward
    else if (!targetTask.isDone) {
      console.log('🐾 [useAppState] Calculating XP gain...');
      newPetState = completeTask(state.petState);
    }
    // If task was already done, no XP change
    else {
      console.log('🐾 [useAppState] Task already completed, no XP change');
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Mark task as done
    let updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, isDone: true, isSkipped: false, isMissed: false } : t
    );
    
    // Move completed task to bottom
    const todayTaskIds = todayTasks.map(t => t.id);
    const todayTasksUpdated = updatedTasks.filter(t => todayTaskIds.includes(t.id));
    const otherTasks = updatedTasks.filter(t => !todayTaskIds.includes(t.id));
    const reorderedTodayTasks = moveTaskToBottom(todayTasksUpdated, taskId);
    updatedTasks = [...otherTasks, ...reorderedTodayTasks];
    
    // Find next pending task or keep current if it's still valid
    const nextPendingTask = reorderedTodayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newCurrentTaskId = nextPendingTask?.id || reorderedTodayTasks[0]?.id || null;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskId: newCurrentTaskId,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK COMPLETED ==========');
  }, [state, updateState]);

  const skipTaskById = useCallback(async (taskId: string) => {
    console.log('⏭️  [useAppState] ========== SKIP TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const targetTask = todayTasks.find(t => t.id === taskId);
    
    if (!targetTask) {
      console.log('⚠️  [useAppState] Target task not found');
      return;
    }
    
    console.log(`   Skipping: "${targetTask.title}" (${targetTask.dueHour >= 0 ? `${targetTask.dueHour}:00` : 'anytime'})`);
    
    // Calculate XP change based on previous state
    let newPetState = state.petState;
    
    // If task was previously completed, we need to remove the reward
    if (targetTask.isDone) {
      console.log('🐾 [useAppState] Task was completed, reversing reward...');
      // Reverse the completion reward (subtract the XP that was added)
      newPetState = missTask(newPetState);
    }
    // If task was previously missed, we need to add back the penalty
    else if (targetTask.isMissed) {
      console.log('🐾 [useAppState] Task was missed, reversing penalty...');
      // Reverse the miss penalty (add back the XP that was deducted)
      newPetState = completeTask(newPetState);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark task as skipped
    let updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, isSkipped: true, isDone: false, isMissed: false } : t
    );
    
    // Move skipped task to bottom
    const todayTaskIds = todayTasks.map(t => t.id);
    const todayTasksUpdated = updatedTasks.filter(t => todayTaskIds.includes(t.id));
    const otherTasks = updatedTasks.filter(t => !todayTaskIds.includes(t.id));
    const reorderedTodayTasks = moveTaskToBottom(todayTasksUpdated, taskId);
    updatedTasks = [...otherTasks, ...reorderedTodayTasks];
    
    // Find next pending task or keep current if it's still valid
    const nextPendingTask = reorderedTodayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newCurrentTaskId = nextPendingTask?.id || reorderedTodayTasks[0]?.id || null;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskId: newCurrentTaskId,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK SKIPPED ==========');
  }, [state, updateState]);

  const missTaskById = useCallback(async (taskId: string) => {
    console.log('❌ [useAppState] ========== MISS TASK ==========');
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const targetTask = todayTasks.find(t => t.id === taskId);
    
    if (!targetTask) {
      console.log('⚠️  [useAppState] Target task not found');
      return;
    }
    
    console.log(`   Missing: "${targetTask.title}" (${targetTask.dueHour >= 0 ? `${targetTask.dueHour}:00` : 'anytime'})`);
    
    // Calculate XP change based on previous state
    let newPetState = state.petState;
    
    // If task was previously completed, we need to remove the reward AND add the penalty
    if (targetTask.isDone) {
      console.log('🐾 [useAppState] Task was completed, reversing reward and adding penalty...');
      // Reverse the completion reward
      newPetState = missTask(newPetState);
      // Add the miss penalty
      newPetState = missTask(newPetState);
    }
    // If task was not missed before, just add the penalty
    else if (!targetTask.isMissed) {
      console.log('🐾 [useAppState] Applying XP penalty...');
      newPetState = missTask(state.petState);
    }
    // If task was already missed, no XP change
    else {
      console.log('🐾 [useAppState] Task already missed, no XP change');
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Mark task as missed
    let updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, isMissed: true, isDone: false, isSkipped: false } : t
    );
    
    // Move missed task to bottom
    const todayTaskIds = todayTasks.map(t => t.id);
    const todayTasksUpdated = updatedTasks.filter(t => todayTaskIds.includes(t.id));
    const otherTasks = updatedTasks.filter(t => !todayTaskIds.includes(t.id));
    const reorderedTodayTasks = moveTaskToBottom(todayTasksUpdated, taskId);
    updatedTasks = [...otherTasks, ...reorderedTodayTasks];
    
    // Find next pending task or keep current if it's still valid
    const nextPendingTask = reorderedTodayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newCurrentTaskId = nextPendingTask?.id || reorderedTodayTasks[0]?.id || null;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskId: newCurrentTaskId,
    });
    
    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] ========== TASK MISSED ==========');
  }, [state, updateState]);

  // Legacy functions for backward compatibility
  const completeCurrentTask = useCallback(async () => {
    if (!state?.currentTaskId) return;
    await completeTaskById(state.currentTaskId);
  }, [state?.currentTaskId, completeTaskById]);

  const skipCurrentTask = useCallback(async () => {
    if (!state?.currentTaskId) return;
    await skipTaskById(state.currentTaskId);
  }, [state?.currentTaskId, skipTaskById]);

  const missCurrentTask = useCallback(async () => {
    if (!state?.currentTaskId) return;
    await missTaskById(state.currentTaskId);
  }, [state?.currentTaskId, missTaskById]);

  const reopenTask = useCallback(async (taskId: string) => {
    console.log(`🔓 [useAppState] Reopening task: ${taskId}`);
    
    if (!state) {
      console.log('❌ [useAppState] No state available');
      return;
    }
    
    const targetTask = state.tasks.find(t => t.id === taskId);
    if (!targetTask) {
      console.log('⚠️  [useAppState] Target task not found');
      return;
    }
    
    // Calculate XP change based on previous state
    let newPetState = state.petState;
    
    // If task was completed, reverse the reward
    if (targetTask.isDone) {
      console.log('🐾 [useAppState] Task was completed, reversing reward...');
      newPetState = missTask(newPetState);
    }
    // If task was missed, reverse the penalty
    else if (targetTask.isMissed) {
      console.log('🐾 [useAppState] Task was missed, reversing penalty...');
      newPetState = completeTask(newPetState);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, isSkipped: false, isDone: false, isMissed: false } : t
    );
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskId: taskId, // Set reopened task as current
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
    
    if (todayTasks.length === 0) {
      console.log('⚠️  [useAppState] No tasks available');
      return;
    }
    
    const currentIndex = todayTasks.findIndex(t => t.id === state.currentTaskId);
    const nextIndex = (currentIndex + 1) % todayTasks.length;
    const nextTaskId = todayTasks[nextIndex].id;
    
    console.log(`   Task: ${state.currentTaskId} → ${nextTaskId}`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskId: nextTaskId,
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
    
    if (todayTasks.length === 0) {
      console.log('⚠️  [useAppState] No tasks available');
      return;
    }
    
    const currentIndex = todayTasks.findIndex(t => t.id === state.currentTaskId);
    const prevIndex = currentIndex === 0 ? todayTasks.length - 1 : currentIndex - 1;
    const prevTaskId = todayTasks[prevIndex].id;
    
    console.log(`   Task: ${state.currentTaskId} → ${prevTaskId}`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskId: prevTaskId,
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
      
      // Set as current task if it's the first task for today
      const todayKey = getTodayKey();
      if (taskDate === todayKey && !state.currentTaskId) {
        await updateState({
          ...state,
          taskTemplates: updatedTemplates,
          tasks: newTasks,
          currentTaskId: newTask.id,
        });
        console.log('🔄 [useAppState] Requesting widget reload...');
        await requestWidgetReload();
        console.log('✅ [useAppState] Task template added');
        return;
      }
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
    
    // If current task was deleted, select a new one
    let newCurrentTaskId = state.currentTaskId;
    if (tasksToRemove.some(t => t.id === state.currentTaskId)) {
      const todayKey = getTodayKey();
      const todayTasks = updatedTasks.filter(t => t.dayKey === todayKey);
      const firstPendingTask = todayTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
      newCurrentTaskId = firstPendingTask?.id || todayTasks[0]?.id || null;
      console.log(`   Current task was deleted, selecting new task: ${newCurrentTaskId}`);
    }

    await updateState({
      ...state,
      taskTemplates: updatedTemplates,
      tasks: updatedTasks,
      currentTaskId: newCurrentTaskId,
    });

    console.log('🔄 [useAppState] Requesting widget reload...');
    await requestWidgetReload();
    
    console.log('✅ [useAppState] Task template deleted');
  }, [state, updateState]);

  return {
    state,
    loading,
    selectTask,
    completeTaskById,
    skipTaskById,
    missTaskById,
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
