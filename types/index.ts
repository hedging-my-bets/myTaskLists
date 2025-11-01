
export interface Task {
  id: string;
  title: string;
  dueHour: number; // 0-23, or -1 for anytime tasks
  dayKey: string; // YYYY-MM-DD
  isDone: boolean;
  isSkipped: boolean;
  isMissed: boolean;
  isAnytime: boolean; // true if task can be done anytime during the day
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
  currentTaskIndex: number;
  lastRolloverDate: string; // YYYY-MM-DD
}

export interface PetStage {
  index: number;
  name: string;
  minXP: number;
  image: string;
  color: string;
}
