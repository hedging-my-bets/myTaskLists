
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
          <View style={styles.progressBarBackground}>
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
    boxShadow: '0px 4px 12px rgba(139, 127, 214, 0.15)',
    elevation: 4,
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
    backgroundColor: 'rgba(139, 127, 214, 0.2)',
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
