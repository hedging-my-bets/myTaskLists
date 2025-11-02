
import { useState, useEffect, useCallback } from 'react';
import { AppState, TaskTemplate } from '@/types';
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
    loadState();
  }, []);

  // Set up deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      if (state) {
        handleDeepLink(url, state, updateState);
      }
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url && state) {
        console.log('Initial deep link:', url);
        handleDeepLink(url, state, updateState);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [state]);

  const loadState = async () => {
    try {
      let loadedState = await loadAppState();
      
      // Check if rollover is needed
      if (shouldRollover(loadedState.lastRolloverDate, loadedState.settings.graceMinutes)) {
        loadedState = performRollover(loadedState);
        await saveAppState(loadedState);
      }
      
      // Update current task index to nearest task
      const nearestIndex = getNearestTaskIndex(loadedState.tasks, loadedState.settings.graceMinutes);
      loadedState.currentTaskIndex = nearestIndex;
      
      setState(loadedState);
      
      // Sync widget state
      await syncWidgetState(
        loadedState.tasks,
        loadedState.currentTaskIndex,
        loadedState.petState,
        loadedState.settings,
        loadedState.lastRolloverDate
      );
    } catch (error) {
      console.error('Error loading state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = useCallback(async (newState: AppState) => {
    setState(newState);
    await saveAppState(newState);
    
    // Sync widget state after every update
    await syncWidgetState(
      newState.tasks,
      newState.currentTaskIndex,
      newState.petState,
      newState.settings,
      newState.lastRolloverDate
    );
  }, []);

  const completeCurrentTask = useCallback(async () => {
    if (!state) return;
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const currentTask = todayTasks[state.currentTaskIndex];
    
    if (!currentTask || currentTask.isDone) {
      console.log('No task to complete or already done');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isDone: true, isSkipped: false, isMissed: false } : t
    );
    
    const newPetState = completeTask(state.petState);
    
    // Move to next pending task after completion
    const sortedTasks = [...updatedTasks]
      .filter(t => t.dayKey === todayKey)
      .sort((a, b) => {
        const aIsPending = !a.isDone && !a.isSkipped && !a.isMissed;
        const bIsPending = !b.isDone && !b.isSkipped && !b.isMissed;
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;
        return 0;
      });
    
    const nextPendingIndex = sortedTasks.findIndex(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newIndex = nextPendingIndex >= 0 ? nextPendingIndex : 0;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskIndex: newIndex,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const skipCurrentTask = useCallback(async () => {
    if (!state) return;
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const currentTask = todayTasks[state.currentTaskIndex];
    
    if (!currentTask || currentTask.isSkipped) {
      console.log('No task to skip or already skipped');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isSkipped: true, isDone: false, isMissed: false } : t
    );
    
    // Move to next pending task after skipping
    const sortedTasks = [...updatedTasks]
      .filter(t => t.dayKey === todayKey)
      .sort((a, b) => {
        const aIsPending = !a.isDone && !a.isSkipped && !a.isMissed;
        const bIsPending = !b.isDone && !b.isSkipped && !b.isMissed;
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;
        return 0;
      });
    
    const nextPendingIndex = sortedTasks.findIndex(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newIndex = nextPendingIndex >= 0 ? nextPendingIndex : 0;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      currentTaskIndex: newIndex,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const missCurrentTask = useCallback(async () => {
    if (!state) return;
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const currentTask = todayTasks[state.currentTaskIndex];
    
    if (!currentTask || currentTask.isMissed) {
      console.log('No task to miss or already missed');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    const updatedTasks = state.tasks.map(t => 
      t.id === currentTask.id ? { ...t, isMissed: true, isDone: false, isSkipped: false } : t
    );
    
    const newPetState = missTask(state.petState);
    
    // Move to next pending task after missing
    const sortedTasks = [...updatedTasks]
      .filter(t => t.dayKey === todayKey)
      .sort((a, b) => {
        const aIsPending = !a.isDone && !a.isSkipped && !a.isMissed;
        const bIsPending = !b.isDone && !b.isSkipped && !b.isMissed;
        if (aIsPending && !bIsPending) return -1;
        if (!aIsPending && bIsPending) return 1;
        return 0;
      });
    
    const nextPendingIndex = sortedTasks.findIndex(t => !t.isDone && !t.isSkipped && !t.isMissed);
    const newIndex = nextPendingIndex >= 0 ? nextPendingIndex : 0;
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
      currentTaskIndex: newIndex,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const nextTask = useCallback(async () => {
    if (!state) return;
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const newIndex = (state.currentTaskIndex + 1) % todayTasks.length;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskIndex: newIndex,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const prevTask = useCallback(async () => {
    if (!state) return;
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    const newIndex = state.currentTaskIndex === 0 ? todayTasks.length - 1 : state.currentTaskIndex - 1;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await updateState({
      ...state,
      currentTaskIndex: newIndex,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const updateGraceMinutes = useCallback(async (minutes: number) => {
    if (!state) return;
    
    await updateState({
      ...state,
      settings: {
        ...state.settings,
        graceMinutes: Math.max(0, Math.min(30, minutes)),
      },
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const editTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!state) return;
    
    const updatedTasks = updateTaskTitle(state.tasks, taskId, newTitle);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const editTaskDescription = useCallback(async (taskId: string, newDescription: string) => {
    if (!state) return;
    
    const updatedTasks = updateTaskDescription(state.tasks, taskId, newDescription);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
    
    await requestWidgetReload();
  }, [state, updateState]);

  const addTaskTemplate = useCallback(async (template: Omit<TaskTemplate, 'id'>) => {
    if (!state) return;

    const newTemplate: TaskTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedTemplates = [...(state.taskTemplates || []), newTemplate];

    // Generate tasks for today from the new template
    const todayKey = getTodayKey();
    const dayOfWeek = new Date(todayKey).getDay();
    
    let newTasks = [...state.tasks];
    
    // Only add task if it's not recurring or if today is one of the selected days
    if (!template.isRecurring || template.recurringDays.includes(dayOfWeek)) {
      const newTask = {
        id: `${todayKey}-${newTemplate.id}`,
        title: template.title,
        description: template.description,
        dueHour: template.dueHour,
        dayKey: todayKey,
        isDone: false,
        isSkipped: false,
        isMissed: false,
        isAnytime: template.isAnytime,
        isRecurring: template.isRecurring,
        recurringDays: template.recurringDays,
        templateId: newTemplate.id,
      };
      newTasks.push(newTask);
    }

    await updateState({
      ...state,
      taskTemplates: updatedTemplates,
      tasks: newTasks,
    });

    await requestWidgetReload();
  }, [state, updateState]);

  const deleteTaskTemplate = useCallback(async (templateId: string) => {
    if (!state) return;

    const updatedTemplates = state.taskTemplates.filter(t => t.id !== templateId);

    // Remove all tasks associated with this template
    const updatedTasks = state.tasks.filter(t => t.templateId !== templateId);

    await updateState({
      ...state,
      taskTemplates: updatedTemplates,
      tasks: updatedTasks,
    });

    await requestWidgetReload();
  }, [state, updateState]);

  return {
    state,
    loading,
    completeCurrentTask,
    skipCurrentTask,
    missCurrentTask,
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
