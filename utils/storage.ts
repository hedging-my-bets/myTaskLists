
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
  const tasks: Task[] = [];
  const dayOfWeek = new Date(dayKey).getDay();

  templates.forEach((template) => {
    // For recurring tasks, only create if today is one of the selected days
    if (template.isRecurring) {
      if (!template.recurringDays.includes(dayOfWeek)) {
        return; // Skip this template for today
      }
    }

    tasks.push({
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
    });
  });

  return tasks;
};

export const getDefaultTasks = (dayKey: string): Task[] => {
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
  
  return tasks;
};

export const loadAppState = async (): Promise<AppState> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      console.log('Loaded app state:', parsed);
      
      // Ensure taskTemplates exists
      if (!parsed.taskTemplates) {
        parsed.taskTemplates = [];
      }
      
      return parsed;
    }
  } catch (error) {
    console.error('Error loading app state:', error);
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
  
  await saveAppState(defaultState);
  return defaultState;
};

export const saveAppState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('Saved app state');
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

export const getTodayKey = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getCurrentHour = (): number => {
  return new Date().getHours();
};
