
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Task, PetState, Settings, TaskTemplate } from '@/types';

const STORAGE_KEY = '@PetProgress:appState';

const DEFAULT_SETTINGS: Settings = {
  graceMinutes: 15,
  privacyPolicyURL: 'https://example.com/privacy',
};

const DEFAULT_PET_STATE: PetState = {
  xp: 0,
  stageIndex: 0,
};

export const generateTasksFromTemplates = (templates: TaskTemplate[], dayKey: string): Task[] => {
  console.log(`📋 [storage] Generating tasks from ${templates.length} templates for ${dayKey}`);
  
  const tasks: Task[] = [];
  const dayOfWeek = new Date(dayKey).getDay();
  
  console.log(`   Day of week: ${dayOfWeek} (0=Sun, 6=Sat)`);

  templates.forEach((template, index) => {
    console.log(`   Template ${index + 1}: "${template.title}" (recurring: ${template.isRecurring}, days: ${template.recurringDays})`);
    
    // For recurring tasks, only create if today is one of the selected days
    if (template.isRecurring) {
      if (!template.recurringDays.includes(dayOfWeek)) {
        console.log(`   ⏭️  Skipping - not scheduled for day ${dayOfWeek}`);
        return; // Skip this template for today
      }
    }

    const newTask = {
      id: `${dayKey}-${template.id}`,
      title: template.title,
      dueHour: template.dueHour,
      dayKey,
      isDone: false,
      isSkipped: false,
      isMissed: false,
      isAnytime: template.isAnytime,
      isRecurring: template.isRecurring,
      recurringDays: template.recurringDays,
      templateId: template.id,
    };
    
    tasks.push(newTask);
    console.log(`   ✅ Created task: "${newTask.title}" at ${newTask.dueHour >= 0 ? `${newTask.dueHour}:00` : 'anytime'}`);
  });

  console.log(`✅ [storage] Generated ${tasks.length} tasks for ${dayKey}`);
  return tasks;
};

export const getDefaultTasks = (dayKey: string): Task[] => {
  console.log(`📋 [storage] Creating default tasks for ${dayKey}`);
  
  const tasks: Task[] = [];
  
  // Add some anytime tasks
  const anytimeTasks = [
    'Drink 8 glasses of water',
    'Exercise for 30 minutes',
    'Read for 20 minutes',
    'Meditate for 10 minutes',
  ];
  
  anytimeTasks.forEach((title, index) => {
    tasks.push({
      id: `${dayKey}-anytime-${index}`,
      title,
      dueHour: -1,
      dayKey,
      isDone: false,
      isSkipped: false,
      isMissed: false,
      isAnytime: true,
    });
  });
  
  // Add time-specific tasks
  const timeSpecificTasks = [
    { hour: 7, title: 'Morning routine' },
    { hour: 9, title: 'Start work tasks' },
    { hour: 12, title: 'Lunch break' },
    { hour: 15, title: 'Afternoon check-in' },
    { hour: 18, title: 'Evening workout' },
    { hour: 20, title: 'Dinner time' },
    { hour: 22, title: 'Night routine' },
  ];
  
  timeSpecificTasks.forEach(({ hour, title }) => {
    tasks.push({
      id: `${dayKey}-${hour}`,
      title,
      dueHour: hour,
      dayKey,
      isDone: false,
      isSkipped: false,
      isMissed: false,
      isAnytime: false,
    });
  });
  
  console.log(`✅ [storage] Created ${tasks.length} default tasks (${anytimeTasks.length} anytime, ${timeSpecificTasks.length} time-specific)`);
  return tasks;
};

export const loadAppState = async (): Promise<AppState> => {
  console.log('📖 [storage] Loading app state...');
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      console.log('✅ [storage] Loaded app state from storage:');
      console.log(`   - Tasks: ${parsed.tasks.length}`);
      console.log(`   - Pet XP: ${parsed.petState.xp}`);
      console.log(`   - Pet Stage: ${parsed.petState.stageIndex}`);
      console.log(`   - Current task index: ${parsed.currentTaskIndex}`);
      console.log(`   - Last rollover: ${parsed.lastRolloverDate}`);
      console.log(`   - Templates: ${parsed.taskTemplates?.length || 0}`);
      
      // Ensure taskTemplates exists
      if (!parsed.taskTemplates) {
        parsed.taskTemplates = [];
        console.log('⚠️  [storage] Added missing taskTemplates array');
      }
      
      return parsed;
    }
    
    console.log('⚠️  [storage] No stored state found, creating default state');
  } catch (error) {
    console.error('❌ [storage] Error loading app state:', error);
  }

  const today = getTodayKey();
  const defaultState: AppState = {
    tasks: getDefaultTasks(today),
    petState: DEFAULT_PET_STATE,
    settings: DEFAULT_SETTINGS,
    currentTaskIndex: 0,
    lastRolloverDate: today,
    taskTemplates: [],
  };
  
  console.log('💾 [storage] Saving default state...');
  await saveAppState(defaultState);
  return defaultState;
};

export const saveAppState = async (state: AppState): Promise<void> => {
  console.log('💾 [storage] Saving app state...');
  console.log(`   - Tasks: ${state.tasks.length}`);
  console.log(`   - Pet XP: ${state.petState.xp}`);
  console.log(`   - Pet Stage: ${state.petState.stageIndex}`);
  console.log(`   - Current task index: ${state.currentTaskIndex}`);
  console.log(`   - Last rollover: ${state.lastRolloverDate}`);
  
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('✅ [storage] App state saved successfully');
  } catch (error) {
    console.error('❌ [storage] Error saving app state:', error);
  }
};

export const getTodayKey = (): string => {
  const now = new Date();
  const key = now.toISOString().split('T')[0];
  console.log(`📅 [storage] Today key: ${key}`);
  return key;
};

export const getCurrentHour = (): number => {
  const hour = new Date().getHours();
  console.log(`🕐 [storage] Current hour: ${hour}`);
  return hour;
};
