
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import TaskCard from '@/components/TaskCard';
import { colors, spacing, typography } from '@/styles/commonStyles';
import React, { useEffect, useMemo } from 'react';
import PetDisplay from '@/components/PetDisplay';
import { useAppState } from '@/hooks/useAppState';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskList from '@/components/TaskList';
import { Stack } from 'expo-router';
import { getTodayKey } from '@/utils/storage';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

const HomeScreen = () => {
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
    refreshState 
  } = useAppState();

  useEffect(() => {
    refreshState();
  }, []);

  // Get only pending tasks for the main card view
  const pendingTasks = useMemo(() => {
    if (!state) return [];
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    // Filter to only show pending tasks (not completed, skipped, or missed)
    const pending = todayTasks.filter(t => !t.isDone && !t.isSkipped && !t.isMissed);
    
    // Sort pending tasks: time-specific first (by hour), then anytime tasks
    return pending.sort((a, b) => {
      if (a.isAnytime && !b.isAnytime) return 1;
      if (!a.isAnytime && b.isAnytime) return -1;
      if (!a.isAnytime && !b.isAnytime) return a.dueHour - b.dueHour;
      return 0;
    });
  }, [state?.tasks]);

  // Sort all tasks for the list view: pending first, then completed/skipped/missed
  const sortedTodayTasks = useMemo(() => {
    if (!state) return [];
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    return [...todayTasks].sort((a, b) => {
      const aIsPending = !a.isDone && !a.isSkipped && !a.isMissed;
      const bIsPending = !b.isDone && !b.isSkipped && !b.isMissed;
      
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;
      
      if (aIsPending && bIsPending) {
        if (a.isAnytime && !b.isAnytime) return 1;
        if (!a.isAnytime && b.isAnytime) return -1;
        if (!a.isAnytime && !b.isAnytime) return a.dueHour - b.dueHour;
      }
      
      return 0;
    });
  }, [state?.tasks]);

  if (loading || !state) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? colors.dark.primary : colors.light.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.dark.text : colors.light.text }]}>
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get the current pending task to display
  const currentTask = pendingTasks[0]; // Always show the first pending task

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
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
        <PetDisplay petState={state.petState} />

        {/* Current Task Card - Only show if there are pending tasks */}
        {currentTask ? (
          <Animated.View 
            key={currentTask.id}
            layout={Layout.springify().damping(15).stiffness(100)}
          >
            <TaskCard
              task={currentTask}
              onComplete={completeCurrentTask}
              onSkip={skipCurrentTask}
              onMiss={missCurrentTask}
              onPrev={prevTask}
              onNext={nextTask}
              onEditTitle={(newTitle) => editTaskTitle(currentTask.id, newTitle)}
              onEditDescription={(newDescription) => editTaskDescription(currentTask.id, newDescription)}
              taskNumber={1}
              totalTasks={pendingTasks.length}
            />
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeIn.duration(400)}
            style={[
              styles.noTasksCard,
              { backgroundColor: isDark ? colors.dark.card : colors.light.card }
            ]}
          >
            <Text style={[styles.noTasksText, { color: isDark ? colors.dark.text : colors.light.text }]}>
              🎉 All tasks completed!
            </Text>
            <Text style={[styles.noTasksSubtext, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
              Great job! Check back tomorrow for new tasks.
            </Text>
          </Animated.View>
        )}

        {/* Task List Overview */}
        <View style={styles.taskListContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.dark.text : colors.light.text }]}>
            Today&apos;s Tasks
          </Text>
          <TaskList 
            tasks={sortedTodayTasks} 
            currentTaskId={currentTask?.id || ''} 
            onTaskPress={(task) => {
              if (task.isSkipped) {
                reopenTask(task.id);
              }
            }}
          />
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
  },
  noTasksCard: {
    padding: spacing.xl,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  noTasksText: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noTasksSubtext: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
  taskListContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
