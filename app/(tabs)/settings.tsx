
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useAppState } from '@/hooks/useAppState';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { PET_STAGES } from '@/constants/petStages';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Linking, Alert } from 'react-native';

const SettingsScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state, updateGraceMinutes } = useAppState();

  const handleGraceMinutesChange = (delta: number) => {
    if (!state) return;
    const newValue = state.settings.graceMinutes + delta;
    updateGraceMinutes(newValue);
  };

  const handlePrivacyPolicy = () => {
    if (state?.settings.privacyPolicyURL) {
      Linking.openURL(state.settings.privacyPolicyURL);
    }
  };

  const showWidgetInfo = () => {
    Alert.alert(
      'Home Screen Widgets',
      'PetProgress supports home screen widgets!\n\n' +
      '📱 Small Widget: Shows your pet and current hour\n' +
      '📱 Medium Widget: Shows your pet, current task, and action buttons (✓/✕/‹/›)\n\n' +
      'Widgets update hourly and respect your grace minutes setting.\n\n' +
      'Note: Native iOS widgets with interactive buttons require a native build. ' +
      'In React Native/Expo, widgets can display information and deep link to the app.',
      [{ text: 'Got it!' }]
    );
  };

  if (!state) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}>
        <Text style={[styles.loadingText, { color: isDark ? colors.textDark : colors.textLight }]}>
          Loading settings...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDark ? colors.textDark : colors.textLight }]}>
          Settings
        </Text>

        {/* Grace Minutes Setting */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="clock.fill" size={24} color={isDark ? colors.primaryDark : colors.primaryLight} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
              Grace Minutes
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            Tasks remain &quot;current&quot; for this many minutes into the next hour. This also affects rollover timing at midnight.
          </Text>
          <View style={styles.graceControl}>
            <TouchableOpacity
              style={[styles.graceButton, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
              onPress={() => handleGraceMinutesChange(-5)}
              disabled={state.settings.graceMinutes <= 0}
            >
              <Text style={styles.graceButtonText}>-5</Text>
            </TouchableOpacity>
            <View style={[styles.graceValue, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
              <Text style={[styles.graceValueText, { color: isDark ? colors.textDark : colors.textLight }]}>
                {state.settings.graceMinutes} min
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.graceButton, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
              onPress={() => handleGraceMinutesChange(5)}
              disabled={state.settings.graceMinutes >= 30}
            >
              <Text style={styles.graceButtonText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Widget Information */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="square.grid.2x2.fill" size={24} color={isDark ? colors.primaryDark : colors.primaryLight} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
              Home Screen Widgets
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            Add PetProgress widgets to your home screen to see your pet and tasks at a glance.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
            onPress={showWidgetInfo}
          >
            <Text style={styles.buttonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Stages Info */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star.fill" size={24} color={isDark ? colors.primaryDark : colors.primaryLight} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
              Pet Evolution
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            Your pet evolves through 30 stages as you complete tasks. Each completed task awards +10 XP. Missing tasks at rollover deducts XP based on your current level (1× at level 1, up to 3× at level 30).
          </Text>
          <View style={styles.stagesInfo}>
            <Text style={[styles.stagesText, { color: isDark ? colors.textDark : colors.textLight }]}>
              Current Stage: {PET_STAGES[state.petState.stageIndex].name} (Level {state.petState.stageIndex + 1})
            </Text>
            <Text style={[styles.stagesText, { color: isDark ? colors.textDark : colors.textLight }]}>
              Total XP: {state.petState.xp}
            </Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="lock.fill" size={24} color={isDark ? colors.primaryDark : colors.primaryLight} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
              Privacy
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            PetProgress is fully offline. All your data stays on your device.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Deep Links Info */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="link" size={24} color={isDark ? colors.primaryDark : colors.primaryLight} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
              Deep Links
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            PetProgress supports deep links for quick actions:
          </Text>
          <View style={styles.deepLinksInfo}>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
              • petprogress://complete - Complete current task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
              • petprogress://skip - Skip current task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
              • petprogress://miss - Mark task as missed
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
              • petprogress://next - Next task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
              • petprogress://prev - Previous task
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.md,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  section: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  graceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  graceButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  graceButtonText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: '700',
  },
  graceValue: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  graceValueText: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: '600',
  },
  stagesInfo: {
    marginTop: spacing.sm,
  },
  stagesText: {
    fontSize: typography.md,
    marginBottom: spacing.xs,
  },
  deepLinksInfo: {
    marginTop: spacing.sm,
  },
  deepLinkText: {
    fontSize: typography.sm,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
});

export default SettingsScreen;
