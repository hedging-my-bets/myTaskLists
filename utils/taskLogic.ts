
import { Task, AppState, Settings } from '@/types';
import { getTodayKey, getCurrentHour, getDefaultTasks } from './storage';

export const getNearestTaskIndex = (tasks: Task[], graceMinutes: number): number => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Find tasks for today
  const todayKey = getTodayKey();
  const todayTasks = tasks.filter(t => t.dayKey === todayKey);
  
  if (todayTasks.length === 0) {
    return 0;
  }
  
  // Find the nearest task considering grace period
  let nearestIndex = 0;
  let minDiff = Infinity;
  
  todayTasks.forEach((task, index) => {
    const taskHour = task.dueHour;
    let diff = 0;
    
    if (taskHour === currentHour) {
      diff = 0; // Current hour
    } else if (taskHour === currentHour - 1 && currentMinutes < graceMinutes) {
      diff = 0; // Previous hour within grace period
    } else if (taskHour < currentHour) {
      diff = currentHour - taskHour; // Past task
    } else {
      diff = taskHour - currentHour; // Future task
    }
    
    if (diff < minDiff) {
      minDiff = diff;
      nearestIndex = index;
    }
  });
  
  return nearestIndex;
};

export const shouldRollover = (lastRolloverDate: string, graceMinutes: number): boolean => {
  const today = getTodayKey();
  if (lastRolloverDate === today) {
    return false;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Check if we're past midnight + grace period
  if (currentHour === 0 && currentMinutes < graceMinutes) {
    return false; // Still in grace period
  }
  
  return true;
};

export const performRollover = (state: AppState): AppState => {
  console.log('Performing rollover...');
  
  const today = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === state.lastRolloverDate);
  
  // Count missed tasks (not done and not skipped)
  const missedTasks = todayTasks.filter(t => !t.isDone && !t.isSkipped);
  const missedCount = missedTasks.length;
  
  console.log(`Found ${missedCount} missed tasks from ${state.lastRolloverDate}`);
  
  // Mark missed tasks
  const updatedOldTasks = state.tasks.map(t => {
    if (t.dayKey === state.lastRolloverDate && !t.isDone && !t.isSkipped) {
      return { ...t, isMissed: true };
    }
    return t;
  });
  
  // Create new tasks for today
  const newTasks = getDefaultTasks(today);
  
  // Apply XP penalty
  const { penalizeMissedTasks } = require('./petLogic');
  const newPetState = penalizeMissedTasks(state.petState, missedCount);
  
  return {
    ...state,
    tasks: [...updatedOldTasks, ...newTasks],
    petState: newPetState,
    lastRolloverDate: today,
    currentTaskIndex: 0,
  };
};

export const updateTaskTitle = (tasks: Task[], taskId: string, newTitle: string): Task[] => {
  return tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t);
};
