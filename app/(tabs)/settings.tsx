
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { PET_STAGES } from '@/constants/petStages';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppState } from '@/hooks/useAppState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
  },
  value: {
    fontSize: typography.sizes.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    minWidth: 60,
    textAlign: 'center',
  },
  infoText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stageItem: {
    width: '30%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  stageEmoji: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  stageName: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  stageXP: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  widgetSetupCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  widgetSetupTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
  },
  widgetStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  widgetStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  widgetStepNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold as any,
  },
  widgetStepText: {
    flex: 1,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  warningBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state, updateGraceMinutes } = useAppState();

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: isDark ? colors.dark.text : colors.light.text }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleGraceMinutesChange = (delta: number) => {
    const newValue = state.settings.graceMinutes + delta;
    if (newValue >= 0 && newValue <= 30) {
      updateGraceMinutes(newValue);
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(state.settings.privacyPolicyURL);
  };

  const showWidgetInfo = () => {
    Alert.alert(
      'Widget Setup',
      'To add the PetProgress widget:\n\n1. Long press on your home screen\n2. Tap the + button (top left)\n3. Search for "PetProgress"\n4. Select widget size (Small or Medium)\n5. Add to home screen\n\nThe widget will show your current task and pet!',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Widget Setup Instructions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              📱 Widget Setup
            </Text>
            <View style={[styles.widgetSetupCard, { 
              backgroundColor: isDark ? colors.dark.card : colors.light.card,
              borderColor: colors.primary,
            }]}>
              <Text style={[styles.widgetSetupTitle, { color: colors.primary }]}>
                How to Add PetProgress Widget
              </Text>
              
              <View style={styles.widgetStep}>
                <View style={[styles.widgetStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.widgetStepNumberText, { color: '#FFFFFF' }]}>1</Text>
                </View>
                <Text style={[styles.widgetStepText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Long press on your home screen
                </Text>
              </View>

              <View style={styles.widgetStep}>
                <View style={[styles.widgetStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.widgetStepNumberText, { color: '#FFFFFF' }]}>2</Text>
                </View>
                <Text style={[styles.widgetStepText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Tap the + button in the top left corner
                </Text>
              </View>

              <View style={styles.widgetStep}>
                <View style={[styles.widgetStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.widgetStepNumberText, { color: '#FFFFFF' }]}>3</Text>
                </View>
                <Text style={[styles.widgetStepText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Search for &quot;PetProgress&quot;
                </Text>
              </View>

              <View style={styles.widgetStep}>
                <View style={[styles.widgetStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.widgetStepNumberText, { color: '#FFFFFF' }]}>4</Text>
                </View>
                <Text style={[styles.widgetStepText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Select widget size (Small or Medium)
                </Text>
              </View>

              <View style={styles.widgetStep}>
                <View style={[styles.widgetStepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.widgetStepNumberText, { color: '#FFFFFF' }]}>5</Text>
                </View>
                <Text style={[styles.widgetStepText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Tap &quot;Add Widget&quot; to add it to your home screen
                </Text>
              </View>

              <View style={[styles.warningBox, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }]}>
                <IconSymbol name="exclamationmark.triangle" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
                <Text style={[styles.warningText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                  If you see a widget showing &quot;Time&quot; and &quot;Favorite Emoji&quot;, that&apos;s NOT the PetProgress widget. Remove it and add the correct one!
                </Text>
              </View>
            </View>
          </View>

          {/* Grace Minutes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              ⏰ Grace Period
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? colors.dark.text : colors.light.text }]}>
                  Grace Minutes
                </Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}
                    onPress={() => handleGraceMinutesChange(-5)}
                  >
                    <IconSymbol name="minus" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: colors.primary }]}>
                    {state.settings.graceMinutes}
                  </Text>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}
                    onPress={() => handleGraceMinutesChange(5)}
                  >
                    <IconSymbol name="plus" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.infoText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
                Tasks remain &quot;current&quot; for this many minutes after their scheduled hour. 
                After the grace period ends, incomplete tasks are marked as missed.
              </Text>
            </View>
          </View>

          {/* Pet Stages */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              🐾 Pet Evolution Stages
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
              <Text style={[styles.infoText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary, marginTop: 0, marginBottom: spacing.md }]}>
                Your pet evolves through 31 stages as you complete tasks and earn XP!
              </Text>
              <View style={styles.stageGrid}>
                {PET_STAGES.map((stage, index) => (
                  <View
                    key={stage.name}
                    style={[
                      styles.stageItem,
                      {
                        backgroundColor: state.petState.stageIndex === index
                          ? colors.primary + '20'
                          : isDark ? colors.dark.background : colors.light.background,
                        borderWidth: state.petState.stageIndex === index ? 2 : 0,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.stageEmoji}>{stage.emoji}</Text>
                    <Text style={[styles.stageName, { 
                      color: isDark ? colors.dark.text : colors.light.text,
                      fontWeight: state.petState.stageIndex === index ? typography.weights.bold as any : typography.weights.regular as any,
                    }]}>
                      {stage.name}
                    </Text>
                    <Text style={[styles.stageXP, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
                      {stage.xpRequired} XP
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Privacy Policy */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
              📄 Legal
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handlePrivacyPolicy}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
