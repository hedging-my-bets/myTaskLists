
import { PetState, Task } from '@/types';
import { PET_STAGES, XP_THRESHOLDS, XP_PER_TASK, XP_PENALTY_BASE } from '@/constants/petStages';

/**
 * Calculate pet stage based on XP
 */
export const calculatePetStage = (xp: number): number => {
  console.log(`🐾 [petLogic] Calculating stage for ${xp} XP...`);
  
  let stageIndex = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      stageIndex = i;
      break;
    }
  }
  
  const stage = PET_STAGES[stageIndex];
  console.log(`   Result: Stage ${stageIndex} - ${stage.name} (${stage.minXP} XP threshold)`);
  
  return stageIndex;
};

/**
 * Get pet stage data by index
 */
export const getPetStage = (stageIndex: number) => {
  const stage = PET_STAGES[stageIndex] || PET_STAGES[0];
  console.log(`🐾 [petLogic] Getting stage ${stageIndex}: ${stage.name} (${stage.image})`);
  return stage;
};

/**
 * Calculate miss penalty based on level
 * penalty(level) = 1 + 2*(level−1)/29  → 1× at L1 → 3× at L30
 */
export const calculateMissPenalty = (level: number): number => {
  const normalizedLevel = Math.max(1, Math.min(30, level));
  const multiplier = 1 + (2 * (normalizedLevel - 1)) / 29;
  
  console.log(`🐾 [petLogic] Miss penalty for level ${level}: ${multiplier.toFixed(2)}x`);
  
  return multiplier;
};

/**
 * Complete a task and award XP
 */
export const completeTask = (petState: PetState, xpGain: number = XP_PER_TASK): PetState => {
  console.log(`✅ [petLogic] Completing task...`);
  console.log(`   Current XP: ${petState.xp}`);
  console.log(`   Current Stage: ${petState.stageIndex}`);
  console.log(`   XP Gain: +${xpGain}`);
  
  const newXP = petState.xp + xpGain;
  const newStageIndex = calculatePetStage(newXP);
  
  const newState = {
    xp: newXP,
    stageIndex: newStageIndex,
  };
  
  if (newStageIndex > petState.stageIndex) {
    console.log(`🎉 [petLogic] LEVEL UP! ${petState.stageIndex} → ${newStageIndex}`);
  }
  
  console.log(`   New XP: ${newXP}`);
  console.log(`   New Stage: ${newStageIndex}`);
  
  return newState;
};

/**
 * Apply penalty for missed tasks with level-scaled penalty
 */
export const penalizeMissedTasks = (petState: PetState, missedCount: number, xpGainPerTask: number = XP_PER_TASK): PetState => {
  console.log(`❌ [petLogic] Penalizing ${missedCount} missed tasks...`);
  console.log(`   Current XP: ${petState.xp}`);
  console.log(`   Current Stage: ${petState.stageIndex}`);
  
  const currentLevel = petState.stageIndex + 1; // Level is 1-indexed
  const penaltyMultiplier = calculateMissPenalty(currentLevel);
  const penalty = Math.round(xpGainPerTask * penaltyMultiplier * missedCount);
  const newXP = Math.max(0, petState.xp - penalty);
  const newStageIndex = calculatePetStage(newXP);
  
  const newState = {
    xp: newXP,
    stageIndex: newStageIndex,
  };
  
  console.log(`   Penalty multiplier: ${penaltyMultiplier.toFixed(2)}x`);
  console.log(`   Total penalty: -${penalty} XP`);
  console.log(`   New XP: ${newXP}`);
  console.log(`   New Stage: ${newStageIndex}`);
  
  if (newStageIndex < petState.stageIndex) {
    console.log(`📉 [petLogic] DE-EVOLVED! ${petState.stageIndex} → ${newStageIndex}`);
  }
  
  return newState;
};

/**
 * Apply penalty for a single missed task
 */
export const missTask = (petState: PetState, xpGainPerTask: number = XP_PER_TASK): PetState => {
  console.log(`❌ [petLogic] Missing single task...`);
  return penalizeMissedTasks(petState, 1, xpGainPerTask);
};

/**
 * Get progress percentage to next stage
 */
export const getProgressToNextStage = (xp: number, stageIndex: number): number => {
  const currentStage = PET_STAGES[stageIndex];
  const nextStage = PET_STAGES[stageIndex + 1];
  
  if (!nextStage) {
    console.log(`🐾 [petLogic] Progress: 100% (MAX LEVEL)`);
    return 100; // Max level
  }
  
  const xpInCurrentStage = xp - currentStage.minXP;
  const xpNeededForNextStage = nextStage.minXP - currentStage.minXP;
  const progress = (xpInCurrentStage / xpNeededForNextStage) * 100;
  
  console.log(`🐾 [petLogic] Progress to next stage: ${progress.toFixed(1)}% (${xpInCurrentStage}/${xpNeededForNextStage} XP)`);
  
  return progress;
};

/**
 * Check if XP is below current stage threshold (for de-evolution)
 */
export const shouldDeEvolve = (xp: number, currentStageIndex: number): boolean => {
  if (currentStageIndex === 0) return false;
  
  const shouldDeEvolve = xp < XP_THRESHOLDS[currentStageIndex];
  
  console.log(`🐾 [petLogic] Should de-evolve? ${shouldDeEvolve} (XP: ${xp}, Threshold: ${XP_THRESHOLDS[currentStageIndex]})`);
  
  return shouldDeEvolve;
};
