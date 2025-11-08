
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { getTodayKey } from '@/utils/storage';
import { colors, spacing, typography, borderRadius } from '@/styles/commonStyles';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import TaskCard from '@/components/TaskCard';
import PetDisplay from '@/components/PetDisplay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import TaskList from '@/components/TaskList';
import { useAppState } from '@/hooks/useAppState';
import { IconSymbol } from '@/components/IconSymbol';
import { Task } from '@/types';

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
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  debugButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  debugButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
});

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    state,
    loading,
    selectTask,
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
    if (!state || !state.currentTaskId) return null;
    return todayTasks.find(t => t.id === state.currentTaskId) || null;
  }, [todayTasks, state?.currentTaskId]);

  const handleTaskPress = (task: Task) => {
    console.log(`🎯 [HomeScreen] Task selected: ${task.id} - "${task.title}"`);
    
    // If task is skipped, reopen it
    if (task.isSkipped) {
      reopenTask(task.id);
    } else {
      // Otherwise, just select it as the current task
      selectTask(task.id);
    }
  };

  const showDebugInfo = () => {
    if (!state) return;
    
    const debugInfo = `
🐾 PetProgress Debug Info

📊 App State:
- Total tasks: ${state.tasks.length}
- Today's tasks: ${todayTasks.length}
- Current task ID: ${state.currentTaskId || 'None'}
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
        <ActivityIndicator size="large" color={isDark ? colors.dark.primary : colors.light.primary} />
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
              tintColor={isDark ? colors.dark.primary : colors.light.primary}
            />
          }
        >
          {/* Pet Display */}
          <Animated.View entering={FadeIn} layout={Layout} style={styles.section}>
            <PetDisplay petState={state.petState} />
          </Animated.View>

          {/* Debug Button */}
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: isDark ? colors.dark.card : colors.light.card }]}
            onPress={showDebugInfo}
          >
            <IconSymbol name="info.circle" size={20} color={isDark ? colors.dark.primary : colors.light.primary} />
            <Text style={[styles.debugButtonText, { color: isDark ? colors.dark.primary : colors.light.primary }]}>
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
                taskNumber={todayTasks.findIndex(t => t.id === currentTask.id) + 1}
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
                currentTaskId={state.currentTaskId}
                onTaskPress={handleTaskPress}
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
