
import { PetState, Task } from '@/types';
import { PET_STAGES, XP_PER_TASK, XP_PENALTY_PER_MISSED } from '@/constants/petStages';

export const calculatePetStage = (xp: number): number => {
  let stageIndex = 0;
  for (let i = PET_STAGES.length - 1; i >= 0; i--) {
    if (xp >= PET_STAGES[i].minXP) {
      stageIndex = i;
      break;
    }
  }
  return stageIndex;
};

export const getPetStage = (stageIndex: number) => {
  return PET_STAGES[stageIndex] || PET_STAGES[0];
};

export const completeTask = (petState: PetState): PetState => {
  const newXP = petState.xp + XP_PER_TASK;
  const newStageIndex = calculatePetStage(newXP);
  console.log(`Task completed! XP: ${petState.xp} -> ${newXP}, Stage: ${petState.stageIndex} -> ${newStageIndex}`);
  return {
    xp: newXP,
    stageIndex: newStageIndex,
  };
};

export const penalizeMissedTasks = (petState: PetState, missedCount: number): PetState => {
  const penalty = missedCount * XP_PENALTY_PER_MISSED;
  const newXP = Math.max(0, petState.xp - penalty);
  const newStageIndex = calculatePetStage(newXP);
  console.log(`Missed ${missedCount} tasks. XP: ${petState.xp} -> ${newXP}, Stage: ${petState.stageIndex} -> ${newStageIndex}`);
  return {
    xp: newXP,
    stageIndex: newStageIndex,
  };
};

export const getProgressToNextStage = (xp: number, stageIndex: number): number => {
  const currentStage = PET_STAGES[stageIndex];
  const nextStage = PET_STAGES[stageIndex + 1];
  
  if (!nextStage) {
    return 100; // Max level
  }
  
  const xpInCurrentStage = xp - currentStage.minXP;
  const xpNeededForNextStage = nextStage.minXP - currentStage.minXP;
  
  return (xpInCurrentStage / xpNeededForNextStage) * 100;
};
