
import { Task, AppState, Settings, TaskTemplate } from '@/types';
import { getTodayKey, getCurrentHour, getDefaultTasks, generateTasksFromTemplates } from './storage';
import { getActiveHour, isWithinGracePeriod } from './timeline';

export const getNearestTaskIndex = (tasks: Task[], graceMinutes: number): number => {
  console.log(`🎯 [taskLogic] Finding nearest task (grace: ${graceMinutes} min)...`);
  
  const now = new Date();
  const activeHour = getActiveHour(now, graceMinutes);
  
  console.log(`   Current time: ${now.toLocaleTimeString()}`);
  console.log(`   Active hour: ${activeHour}`);
  
  // Find tasks for today
  const todayKey = getTodayKey();
  const todayTasks = tasks.filter(t => t.dayKey === todayKey);
  
  console.log(`   Today's tasks: ${todayTasks.length}`);
  
  if (todayTasks.length === 0) {
    console.log(`   ⚠️  No tasks for today, returning index 0`);
    return 0;
  }
  
  // Separate anytime and time-specific tasks
  const anytimeTasks = todayTasks.filter(t => t.isAnytime);
  const timeSpecificTasks = todayTasks.filter(t => !t.isAnytime);
  
  console.log(`   Anytime tasks: ${anytimeTasks.length}`);
  console.log(`   Time-specific tasks: ${timeSpecificTasks.length}`);
  
  // Find the nearest time-specific task
  let nearestIndex = 0;
  let minDiff = Infinity;
  
  timeSpecificTasks.forEach((task, index) => {
    const taskHour = task.dueHour;
    
    // Check if task is within grace period
    if (isWithinGracePeriod(now, taskHour, graceMinutes)) {
      console.log(`   ✅ Task "${task.title}" (${taskHour}:00) is within grace period`);
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
    
    console.log(`   Task "${task.title}" (${taskHour}:00) - diff: ${diff} hours`);
    
    if (diff < minDiff) {
      minDiff = diff;
      nearestIndex = todayTasks.indexOf(task);
    }
  });
  
  console.log(`   Nearest task index: ${nearestIndex} (${todayTasks[nearestIndex]?.title || 'N/A'})`);
  
  return nearestIndex;
};

export const shouldRollover = (lastRolloverDate: string, graceMinutes: number): boolean => {
  console.log(`🔄 [taskLogic] Checking if rollover needed...`);
  console.log(`   Last rollover: ${lastRolloverDate}`);
  
  const today = getTodayKey();
  console.log(`   Today: ${today}`);
  
  if (lastRolloverDate === today) {
    console.log(`   ✅ Already rolled over today`);
    return false;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  console.log(`   Current time: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}`);
  console.log(`   Grace period: ${graceMinutes} minutes`);
  
  // Check if we're past midnight + grace period
  if (currentHour === 0 && currentMinutes < graceMinutes) {
    console.log(`   ⏳ Still in grace period (${currentMinutes}/${graceMinutes} min)`);
    return false; // Still in grace period
  }
  
  console.log(`   ✅ Rollover needed!`);
  return true;
};

export const performRollover = (state: AppState): AppState => {
  console.log('🔄 [taskLogic] ========== PERFORMING ROLLOVER ==========');
  
  const today = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === state.lastRolloverDate);
  
  console.log(`   Previous day: ${state.lastRolloverDate}`);
  console.log(`   New day: ${today}`);
  console.log(`   Tasks from previous day: ${todayTasks.length}`);
  
  // Count missed tasks (not done and not skipped)
  const missedTasks = todayTasks.filter(t => !t.isDone && !t.isSkipped);
  const missedCount = missedTasks.length;
  
  console.log(`   Missed tasks: ${missedCount}`);
  missedTasks.forEach((task, i) => {
    console.log(`      ${i + 1}. "${task.title}" (${task.dueHour >= 0 ? `${task.dueHour}:00` : 'anytime'})`);
  });
  
  // Mark missed tasks
  const updatedOldTasks = state.tasks.map(t => {
    if (t.dayKey === state.lastRolloverDate && !t.isDone && !t.isSkipped) {
      console.log(`   ❌ Marking as missed: "${t.title}"`);
      return { ...t, isMissed: true };
    }
    return t;
  });
  
  // Create new tasks for today from templates
  let newTasks: Task[] = [];
  if (state.taskTemplates && state.taskTemplates.length > 0) {
    console.log(`   Creating tasks from ${state.taskTemplates.length} templates...`);
    newTasks = generateTasksFromTemplates(state.taskTemplates, today);
  } else {
    console.log(`   No templates found, using default tasks...`);
    // Fallback to default tasks if no templates
    newTasks = getDefaultTasks(today);
  }
  
  console.log(`   New tasks created: ${newTasks.length}`);
  
  // Apply XP penalty using the new level-scaled penalty
  const { penalizeMissedTasks } = require('./petLogic');
  const { XP_PER_TASK } = require('@/constants/petStages');
  
  console.log(`   Applying XP penalty for ${missedCount} missed tasks...`);
  const newPetState = penalizeMissedTasks(state.petState, missedCount, XP_PER_TASK);
  
  // Set currentTaskId to first pending task of the new day
  const firstPendingTask = newTasks.find(t => !t.isDone && !t.isSkipped && !t.isMissed);
  const newCurrentTaskId = firstPendingTask?.id || newTasks[0]?.id || null;
  
  const newState = {
    ...state,
    tasks: [...updatedOldTasks, ...newTasks],
    petState: newPetState,
    lastRolloverDate: today,
    currentTaskId: newCurrentTaskId,
  };
  
  console.log('✅ [taskLogic] ========== ROLLOVER COMPLETE ==========');
  console.log(`   Total tasks: ${newState.tasks.length}`);
  console.log(`   Pet XP: ${state.petState.xp} → ${newPetState.xp}`);
  console.log(`   Pet Stage: ${state.petState.stageIndex} → ${newPetState.stageIndex}`);
  console.log(`   New current task ID: ${newCurrentTaskId}`);
  
  return newState;
};

export const updateTaskTitle = (tasks: Task[], taskId: string, newTitle: string): Task[] => {
  console.log(`✏️  [taskLogic] Updating task title: ${taskId} → "${newTitle}"`);
  return tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t);
};

export const updateTaskDescription = (tasks: Task[], taskId: string, newDescription: string): Task[] => {
  console.log(`✏️  [taskLogic] Updating task description: ${taskId} → "${newDescription}"`);
  return tasks.map(t => t.id === taskId ? { ...t, description: newDescription } : t);
};

export const getSortedTasks = (tasks: Task[]): Task[] => {
  console.log(`🔀 [taskLogic] Sorting ${tasks.length} tasks...`);
  
  // Sort tasks: time-specific tasks first (by hour), then anytime tasks
  const sorted = [...tasks].sort((a, b) => {
    if (a.isAnytime && !b.isAnytime) return 1;
    if (!a.isAnytime && b.isAnytime) return -1;
    if (!a.isAnytime && !b.isAnytime) {
      return a.dueHour - b.dueHour;
    }
    return 0;
  });
  
  console.log(`✅ [taskLogic] Tasks sorted`);
  
  return sorted;
};
