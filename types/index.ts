
export interface Task {
  id: string;
  title: string;
  dueHour: number; // 0-23
  dayKey: string; // YYYY-MM-DD
  isDone: boolean;
  isSkipped: boolean;
  isMissed: boolean;
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
