
import { PetState, Task } from '@/types';
import { PET_STAGES, XP_THRESHOLDS, XP_PER_TASK, XP_PENALTY_BASE } from '@/constants/petStages';

/**
 * Calculate pet stage based on XP
 */
export const calculatePetStage = (xp: number): number => {
  let stageIndex = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      stageIndex = i;
      break;
    }
  }
  return stageIndex;
};

/**
 * Get pet stage data by index
 */
export const getPetStage = (stageIndex: number) => {
  return PET_STAGES[stageIndex] || PET_STAGES[0];
};

/**
 * Calculate miss penalty based on level
 * penalty(level) = 1 + 2*(level−1)/29  → 1× at L1 → 3× at L30
 */
export const calculateMissPenalty = (level: number): number => {
  const normalizedLevel = Math.max(1, Math.min(30, level));
  return 1 + (2 * (normalizedLevel - 1)) / 29;
};

/**
 * Complete a task and award XP
 */
export const completeTask = (petState: PetState, xpGain: number = XP_PER_TASK): PetState => {
  const newXP = petState.xp + xpGain;
  const newStageIndex = calculatePetStage(newXP);
  console.log(`Task completed! XP: ${petState.xp} -> ${newXP}, Stage: ${petState.stageIndex} -> ${newStageIndex}`);
  return {
    xp: newXP,
    stageIndex: newStageIndex,
  };
};

/**
 * Apply penalty for missed tasks with level-scaled penalty
 */
export const penalizeMissedTasks = (petState: PetState, missedCount: number, xpGainPerTask: number = XP_PER_TASK): PetState => {
  const currentLevel = petState.stageIndex + 1; // Level is 1-indexed
  const penaltyMultiplier = calculateMissPenalty(currentLevel);
  const penalty = Math.round(xpGainPerTask * penaltyMultiplier * missedCount);
  const newXP = Math.max(0, petState.xp - penalty);
  const newStageIndex = calculatePetStage(newXP);
  
  console.log(`Missed ${missedCount} tasks at level ${currentLevel}. Penalty multiplier: ${penaltyMultiplier.toFixed(2)}x, XP: ${petState.xp} -> ${newXP}, Stage: ${petState.stageIndex} -> ${newStageIndex}`);
  
  return {
    xp: newXP,
    stageIndex: newStageIndex,
  };
};

/**
 * Apply penalty for a single missed task
 */
export const missTask = (petState: PetState, xpGainPerTask: number = XP_PER_TASK): PetState => {
  return penalizeMissedTasks(petState, 1, xpGainPerTask);
};

/**
 * Get progress percentage to next stage
 */
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

/**
 * Check if XP is below current stage threshold (for de-evolution)
 */
export const shouldDeEvolve = (xp: number, currentStageIndex: number): boolean => {
  if (currentStageIndex === 0) return false;
  return xp < XP_THRESHOLDS[currentStageIndex];
};
