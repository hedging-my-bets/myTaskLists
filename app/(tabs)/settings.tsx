
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '@/hooks/useAppState';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { PET_STAGES } from '@/constants/petStages';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  
  const { state, updateGraceMinutes } = useAppState();

  const handleGraceMinutesChange = (delta: number) => {
    if (!state) return;
    const newValue = state.settings.graceMinutes + delta;
    if (newValue >= 0 && newValue <= 30) {
      updateGraceMinutes(newValue);
    }
  };

  const handlePrivacyPolicy = () => {
    if (state?.settings.privacyPolicyURL) {
      Linking.openURL(state.settings.privacyPolicyURL);
    }
  };

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Settings
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Grace Period
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Tasks remain &quot;current&quot; for this many minutes after their hour ends. 
            At midnight + grace period, incomplete tasks become missed and XP is deducted.
          </Text>
          
          <View style={styles.graceControl}>
            <TouchableOpacity
              onPress={() => handleGraceMinutesChange(-5)}
              style={[styles.graceButton, { backgroundColor: theme.accent }]}
              disabled={state.settings.graceMinutes <= 0}
            >
              <IconSymbol name="minus" size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <View style={[styles.graceValue, { backgroundColor: theme.accent }]}>
              <Text style={[styles.graceValueText, { color: theme.primary }]}>
                {state.settings.graceMinutes}
              </Text>
              <Text style={[styles.graceLabel, { color: theme.textSecondary }]}>
                minutes
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => handleGraceMinutesChange(5)}
              style={[styles.graceButton, { backgroundColor: theme.accent }]}
              disabled={state.settings.graceMinutes >= 30}
            >
              <IconSymbol name="plus" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Pet Evolution Stages
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Your pet evolves through these stages as you earn XP
          </Text>
          
          <View style={styles.stagesList}>
            {PET_STAGES.map((stage) => {
              const isCurrentStage = stage.index === state.petState.stageIndex;
              const isUnlocked = state.petState.xp >= stage.minXP;
              
              return (
                <View
                  key={stage.index}
                  style={[
                    styles.stageItem,
                    { 
                      backgroundColor: isCurrentStage ? theme.accent : 'transparent',
                      borderColor: theme.border,
                    }
                  ]}
                >
                  <Text style={styles.stageEmoji}>
                    {stage.image}
                  </Text>
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageName, { color: theme.text }]}>
                      {stage.name}
                    </Text>
                    <Text style={[styles.stageXP, { color: theme.textSecondary }]}>
                      {stage.minXP} XP
                    </Text>
                  </View>
                  {isCurrentStage && (
                    <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                  {!isUnlocked && (
                    <IconSymbol name="lock.fill" size={20} color={theme.textSecondary} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            About
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            PetProgress helps you build habits by gamifying your daily tasks. 
            Complete tasks to earn XP and watch your pet evolve!
          </Text>
          
          <TouchableOpacity
            onPress={handlePrivacyPolicy}
            style={[styles.linkButton, { backgroundColor: theme.accent }]}
          >
            <IconSymbol name="doc.text" size={20} color={theme.primary} />
            <Text style={[styles.linkButtonText, { color: theme.primary }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How It Works
          </Text>
          <View style={styles.howItWorks}>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Complete tasks to earn +5 XP per task
            </Text>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Skip tasks if you can&apos;t complete them (no XP penalty)
            </Text>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Missed tasks at midnight cost -3 XP each
            </Text>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Your pet evolves at XP thresholds
            </Text>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Long press task titles to edit them
            </Text>
            <Text style={[styles.howItWorksItem, { color: theme.textSecondary }]}>
              - Use ‹ › buttons to navigate between tasks
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    boxShadow: '0px 4px 12px rgba(139, 127, 214, 0.15)',
    elevation: 4,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  graceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  graceButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graceValue: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  graceValueText: {
    ...typography.h2,
    fontWeight: '700',
  },
  graceLabel: {
    ...typography.caption,
  },
  stagesList: {
    gap: spacing.sm,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  stageEmoji: {
    fontSize: 32,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    ...typography.body,
    fontWeight: '600',
  },
  stageXP: {
    ...typography.caption,
  },
  currentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  linkButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  howItWorks: {
    gap: spacing.sm,
  },
  howItWorksItem: {
    ...typography.bodySmall,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
