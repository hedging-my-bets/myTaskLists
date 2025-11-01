
import { useState, useEffect, useCallback } from 'react';
import { AppState } from '@/types';
import { loadAppState, saveAppState, getTodayKey } from '@/utils/storage';
import { shouldRollover, performRollover, getNearestTaskIndex, updateTaskTitle } from '@/utils/taskLogic';
import { completeTask } from '@/utils/petLogic';
import * as Haptics from 'expo-haptics';

export const useAppState = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

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
    } catch (error) {
      console.error('Error loading state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = useCallback(async (newState: AppState) => {
    setState(newState);
    await saveAppState(newState);
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
      t.id === currentTask.id ? { ...t, isDone: true } : t
    );
    
    const newPetState = completeTask(state.petState);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
      petState: newPetState,
    });
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
      t.id === currentTask.id ? { ...t, isSkipped: true } : t
    );
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
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
  }, [state, updateState]);

  const editTaskTitle = useCallback(async (taskId: string, newTitle: string) => {
    if (!state) return;
    
    const updatedTasks = updateTaskTitle(state.tasks, taskId, newTitle);
    
    await updateState({
      ...state,
      tasks: updatedTasks,
    });
  }, [state, updateState]);

  return {
    state,
    loading,
    completeCurrentTask,
    skipCurrentTask,
    nextTask,
    prevTask,
    updateGraceMinutes,
    editTaskTitle,
    refreshState: loadState,
  };
};
