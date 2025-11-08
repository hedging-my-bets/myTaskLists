
import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { PetState } from '@/types';
import { getPetStage, getProgressToNextStage } from '@/utils/petLogic';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { PET_STAGES } from '@/constants/petStages';

interface PetDisplayProps {
  petState: PetState;
}

export default function PetDisplay({ petState }: PetDisplayProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  
  // Safety checks
  if (!petState) {
    console.error('❌ [PetDisplay] petState is undefined');
    return null;
  }
  
  if (petState.stageIndex === undefined || petState.stageIndex === null) {
    console.error('❌ [PetDisplay] petState.stageIndex is undefined or null:', petState);
    return null;
  }
  
  if (petState.xp === undefined || petState.xp === null) {
    console.error('❌ [PetDisplay] petState.xp is undefined or null:', petState);
    return null;
  }
  
  console.log('🐾 [PetDisplay] Rendering with petState:', { xp: petState.xp, stageIndex: petState.stageIndex });
  
  const currentStage = getPetStage(petState.stageIndex);
  const progress = getProgressToNextStage(petState.xp, petState.stageIndex);
  const nextStage = PET_STAGES[petState.stageIndex + 1];

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      <Animated.Text 
        entering={ZoomIn.duration(600).delay(200)}
        style={styles.petEmoji}
      >
        {currentStage.image}
      </Animated.Text>
      
      <Text style={[styles.stageName, { color: theme.text }]}>
        {currentStage.name}
      </Text>
      
      <Text style={[styles.xpText, { color: theme.textSecondary }]}>
        {petState.xp} XP
      </Text>
      
      {nextStage && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: colorScheme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(139, 127, 214, 0.2)' }]}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${progress}%`,
                  backgroundColor: theme.primary,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {Math.round(progress)}% to {nextStage.name}
          </Text>
        </View>
      )}
      
      {!nextStage && (
        <Text style={[styles.maxLevelText, { color: theme.primary }]}>
          ⭐ Max Level! ⭐
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  petEmoji: {
    fontSize: 120,
    marginBottom: spacing.md,
  },
  stageName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  xpText: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.bodySmall,
  },
  maxLevelText: {
    ...typography.h3,
    marginTop: spacing.md,
  },
});
