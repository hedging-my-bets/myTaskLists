
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
      'Home Screen Widgets ✅',
      'PetProgress supports iOS home screen widgets!\n\n' +
      '📱 Small Widget: Shows your pet and current hour\n' +
      '📱 Medium Widget: Shows your pet, current task, and action buttons (✓/✕/‹/›)\n\n' +
      '✅ Widgets update hourly and respect your grace minutes setting.\n' +
      '✅ Deep links work to open the app and perform actions.\n' +
      '✅ Shared state via App Groups keeps everything in sync.\n\n' +
      'To add a widget:\n' +
      '1. Long press on your home screen\n' +
      '2. Tap the + button\n' +
      '3. Search for "PetProgress"\n' +
      '4. Choose Small or Medium size\n\n' +
      'Note: Interactive buttons in widgets require a native build with WidgetKit. The widget will display your current task and pet, and tapping it will open the app.',
      [{ text: 'Got it!' }]
    );
  };

  if (!state) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <Text style={[styles.loadingText, { color: isDark ? colors.dark.text : colors.light.text }]}>
          Loading settings...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDark ? colors.dark.text : colors.light.text }]}>
          Settings
        </Text>

        {/* Grace Minutes Setting */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="clock.fill" size={24} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Grace Minutes
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            Tasks remain &quot;current&quot; for this many minutes into the next hour. This also affects rollover timing at midnight.
          </Text>
          <View style={styles.graceControl}>
            <TouchableOpacity
              style={[styles.graceButton, { backgroundColor: isDark ? colors.dark.primary : colors.light.primary }]}
              onPress={() => handleGraceMinutesChange(-5)}
              disabled={state.settings.graceMinutes <= 0}
            >
              <Text style={styles.graceButtonText}>-5</Text>
            </TouchableOpacity>
            <View style={[styles.graceValue, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}>
              <Text style={[styles.graceValueText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                {state.settings.graceMinutes} min
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.graceButton, { backgroundColor: isDark ? colors.dark.primary : colors.light.primary }]}
              onPress={() => handleGraceMinutesChange(5)}
              disabled={state.settings.graceMinutes >= 30}
            >
              <Text style={styles.graceButtonText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Widget Information */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="square.grid.2x2.fill" size={24} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Home Screen Widgets ✅
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            Add PetProgress widgets to your home screen to see your pet and tasks at a glance. Widgets are fully functional and update hourly!
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? colors.dark.primary : colors.light.primary }]}
            onPress={showWidgetInfo}
          >
            <Text style={styles.buttonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Stages Info */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star.fill" size={24} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Pet Evolution
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            Your pet evolves through 30 stages as you complete tasks. Each completed task awards +25 XP. First level requires 100 XP, then 200 XP, 400 XP, etc. (doubling each time). Missing tasks at rollover deducts XP based on your current level (1× at level 1, up to 3× at level 30).
          </Text>
          <View style={styles.stagesInfo}>
            <Text style={[styles.stagesText, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Current Stage: {PET_STAGES[state.petState.stageIndex].name} (Level {state.petState.stageIndex + 1})
            </Text>
            <Text style={[styles.stagesText, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Total XP: {state.petState.xp}
            </Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="lock.fill" size={24} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Privacy
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            PetProgress is fully offline. All your data stays on your device.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? colors.dark.primary : colors.light.primary }]}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Deep Links Info */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="link" size={24} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Deep Links
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
            PetProgress supports deep links for quick actions:
          </Text>
          <View style={styles.deepLinksInfo}>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
              • petprogress://complete - Complete current task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
              • petprogress://skip - Skip current task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
              • petprogress://miss - Mark task as missed
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
              • petprogress://next - Next task
            </Text>
            <Text style={[styles.deepLinkText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
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
    fontSize: typography.body.fontSize,
  },
  title: {
    fontSize: typography.h1.fontSize,
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
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.body.fontSize,
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
    fontSize: typography.body.fontSize,
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
    fontSize: typography.h3.fontSize,
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
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  stagesInfo: {
    marginTop: spacing.sm,
  },
  stagesText: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  deepLinksInfo: {
    marginTop: spacing.sm,
  },
  deepLinkText: {
    fontSize: typography.bodySmall.fontSize,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
});

export default SettingsScreen;
