
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { getTodayKey } from '@/utils/storage';
import { colors, spacing, typography } from '@/styles/commonStyles';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import TaskCard from '@/components/TaskCard';
import PetDisplay from '@/components/PetDisplay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import TaskList from '@/components/TaskList';
import { useAppState } from '@/hooks/useAppState';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  debugButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
  },
});

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    state,
    loading,
    completeCurrentTask,
    skipCurrentTask,
    missCurrentTask,
    reopenTask,
    nextTask,
    prevTask,
    editTaskTitle,
    editTaskDescription,
    refreshState,
  } = useAppState();

  useEffect(() => {
    console.log('🏠 [HomeScreen] Component mounted');
  }, []);

  const todayKey = getTodayKey();
  const todayTasks = useMemo(() => {
    if (!state) return [];
    return state.tasks.filter(t => t.dayKey === todayKey);
  }, [state, todayKey]);

  const currentTask = useMemo(() => {
    if (todayTasks.length === 0) return null;
    const validIndex = Math.min(state?.currentTaskIndex || 0, todayTasks.length - 1);
    return todayTasks[validIndex];
  }, [todayTasks, state?.currentTaskIndex]);

  const showDebugInfo = () => {
    if (!state) return;
    
    const debugInfo = `
🐾 PetProgress Debug Info

📊 App State:
- Total tasks: ${state.tasks.length}
- Today's tasks: ${todayTasks.length}
- Current index: ${state.currentTaskIndex}
- Pet XP: ${state.petState.xp}
- Pet Stage: ${state.petState.stageIndex + 1}
- Grace minutes: ${state.settings.graceMinutes}

📝 Current Task:
${currentTask ? `
- Title: ${currentTask.title}
- Hour: ${currentTask.dueHour >= 0 ? currentTask.dueHour : 'Anytime'}
- Done: ${currentTask.isDone}
- Skipped: ${currentTask.isSkipped}
- Missed: ${currentTask.isMissed}
` : '- No current task'}

🔧 Widget Setup:
1. Long press on home screen
2. Tap the + button (top left)
3. Search for "PetProgress"
4. Select widget size (Small or Medium)
5. Add to home screen

⚠️ If you see a different widget:
- Remove the incorrect widget
- Add the PetProgress widget
- Make sure the app is running
    `.trim();
    
    Alert.alert('Debug Info', debugInfo, [
      { text: 'Copy to Clipboard', onPress: () => console.log(debugInfo) },
      { text: 'OK' }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? colors.dark.text : colors.light.text }]}>
              Failed to load app state
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshState}
              tintColor={colors.primary}
            />
          }
        >
          {/* Pet Display */}
          <Animated.View entering={FadeIn} layout={Layout} style={styles.section}>
            <PetDisplay
              xp={state.petState.xp}
              stageIndex={state.petState.stageIndex}
            />
          </Animated.View>

          {/* Debug Button */}
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}
            onPress={showDebugInfo}
          >
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <Text style={[styles.debugButtonText, { color: colors.primary }]}>
              Widget Setup & Debug Info
            </Text>
          </TouchableOpacity>

          {/* Current Task */}
          {currentTask && (
            <Animated.View entering={FadeIn} layout={Layout} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
                Current Task
              </Text>
              <TaskCard
                task={currentTask}
                onComplete={completeCurrentTask}
                onSkip={skipCurrentTask}
                onMiss={missCurrentTask}
                onPrev={prevTask}
                onNext={nextTask}
                onEditTitle={editTaskTitle}
                onEditDescription={editTaskDescription}
                onReopenTask={reopenTask}
                taskNumber={state.currentTaskIndex + 1}
                totalTasks={todayTasks.length}
              />
            </Animated.View>
          )}

          {/* All Tasks */}
          {todayTasks.length > 0 && (
            <Animated.View entering={FadeIn} layout={Layout} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
                Today&apos;s Tasks ({todayTasks.length})
              </Text>
              <TaskList
                tasks={todayTasks}
                currentTaskId={currentTask?.id || ''}
              />
            </Animated.View>
          )}

          {todayTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 60 }}>🎉</Text>
              <Text style={[styles.emptyText, { color: isDark ? colors.dark.text : colors.light.text }]}>
                No tasks for today!
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
