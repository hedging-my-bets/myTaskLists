
import { Task, AppState, Settings, TaskTemplate } from '@/types';
import { getTodayKey, getCurrentHour, getDefaultTasks, generateTasksFromTemplates } from './storage';
import { getActiveHour, isWithinGracePeriod } from './timeline';

export const getNearestTaskIndex = (tasks: Task[], graceMinutes: number): number => {
  const now = new Date();
  const activeHour = getActiveHour(now, graceMinutes);
  
  // Find tasks for today
  const todayKey = getTodayKey();
  const todayTasks = tasks.filter(t => t.dayKey === todayKey);
  
  if (todayTasks.length === 0) {
    return 0;
  }
  
  // Separate anytime and time-specific tasks
  const anytimeTasks = todayTasks.filter(t => t.isAnytime);
  const timeSpecificTasks = todayTasks.filter(t => !t.isAnytime);
  
  // Find the nearest time-specific task
  let nearestIndex = 0;
  let minDiff = Infinity;
  
  timeSpecificTasks.forEach((task, index) => {
    const taskHour = task.dueHour;
    
    // Check if task is within grace period
    if (isWithinGracePeriod(now, taskHour, graceMinutes)) {
      nearestIndex = todayTasks.indexOf(task);
      minDiff = 0;
      return;
    }
    
    let diff = 0;
    if (taskHour < activeHour) {
      diff = activeHour - taskHour; // Past task
    } else {
      diff = taskHour - activeHour; // Future task
    }
    
    if (diff < minDiff) {
      minDiff = diff;
      nearestIndex = todayTasks.indexOf(task);
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
  
  // Create new tasks for today from templates
  let newTasks: Task[] = [];
  if (state.taskTemplates && state.taskTemplates.length > 0) {
    newTasks = generateTasksFromTemplates(state.taskTemplates, today);
  } else {
    // Fallback to default tasks if no templates
    newTasks = getDefaultTasks(today);
  }
  
  // Apply XP penalty using the new level-scaled penalty
  const { penalizeMissedTasks } = require('./petLogic');
  const { XP_PER_TASK } = require('@/constants/petStages');
  const newPetState = penalizeMissedTasks(state.petState, missedCount, XP_PER_TASK);
  
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

export const getSortedTasks = (tasks: Task[]): Task[] => {
  // Sort tasks: time-specific tasks first (by hour), then anytime tasks
  return [...tasks].sort((a, b) => {
    if (a.isAnytime && !b.isAnytime) return 1;
    if (!a.isAnytime && b.isAnytime) return -1;
    if (!a.isAnytime && !b.isAnytime) {
      return a.dueHour - b.dueHour;
    }
    return 0;
  });
};
