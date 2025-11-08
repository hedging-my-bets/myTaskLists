
export interface Task {
  id: string;
  title: string;
  description?: string; // Add description field
  dueHour: number; // 0-23, or -1 for anytime tasks
  dayKey: string; // YYYY-MM-DD
  isDone: boolean;
  isSkipped: boolean;
  isMissed: boolean;
  isAnytime: boolean; // true if task can be done anytime during the day
  isRecurring?: boolean; // true if task repeats
  recurringDays?: number[]; // 0-6 (Sunday-Saturday) for recurring tasks
  templateId?: string; // ID of the template task for recurring tasks
  order?: number; // Order in the list (for manual reordering)
}

export interface PetState {
  xp: number;
  stageIndex: number;
}

export interface Settings {
  graceMinutes: number; // 0-30
  privacyPolicyURL: string;
}

export interface AppState {
  tasks: Task[];
  petState: PetState;
  settings: Settings;
  currentTaskId: string | null; // Changed from currentTaskIndex to currentTaskId
  lastRolloverDate: string; // YYYY-MM-DD
  taskTemplates: TaskTemplate[]; // Templates for recurring tasks
}

export interface PetStage {
  index: number;
  name: string;
  minXP: number;
  image: string;
  color: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string; // Add description field
  dueHour: number; // 0-23, or -1 for anytime
  isAnytime: boolean;
  isRecurring: boolean;
  recurringDays: number[]; // 0-6 (Sunday-Saturday)
}
