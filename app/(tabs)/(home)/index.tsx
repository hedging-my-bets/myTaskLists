
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
    nextTask, 
    prevTask, 
    editTaskTitle,
    editTaskDescription,
    refreshState 
  } = useAppState();

  useEffect(() => {
    refreshState();
  }, []);

  // Sort tasks: incomplete first, then completed/skipped/missed
  const sortedTodayTasks = useMemo(() => {
    if (!state) return [];
    
    const todayKey = getTodayKey();
    const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
    
    // Sort: pending tasks first, then by status (completed, skipped, missed)
    return [...todayTasks].sort((a, b) => {
      // Pending tasks come first
      const aIsPending = !a.isDone && !a.isSkipped && !a.isMissed;
      const bIsPending = !b.isDone && !b.isSkipped && !b.isMissed;
      
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;
      
      // Among pending tasks, sort by hour (anytime tasks last)
      if (aIsPending && bIsPending) {
        if (a.isAnytime && !b.isAnytime) return 1;
        if (!a.isAnytime && b.isAnytime) return -1;
        if (!a.isAnytime && !b.isAnytime) return a.dueHour - b.dueHour;
      }
      
      // Among completed tasks, maintain original order
      return 0;
    });
  }, [state?.tasks]);

  if (loading || !state) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? colors.primaryDark : colors.primaryLight} />
          <Text style={[styles.loadingText, { color: isDark ? colors.textDark : colors.textLight }]}>
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = sortedTodayTasks[state.currentTaskIndex] || todayTasks[state.currentTaskIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshState}
            tintColor={isDark ? colors.primaryDark : colors.primaryLight}
          />
        }
      >
        {/* Pet Display */}
        <PetDisplay petState={state.petState} />

        {/* Current Task Card */}
        {currentTask && (
          <Animated.View layout={Layout.springify().damping(15).stiffness(100)}>
            <TaskCard
              task={currentTask}
              onComplete={completeCurrentTask}
              onSkip={skipCurrentTask}
              onMiss={missCurrentTask}
              onPrev={prevTask}
              onNext={nextTask}
              onEditTitle={(newTitle) => editTaskTitle(currentTask.id, newTitle)}
              onEditDescription={(newDescription) => editTaskDescription(currentTask.id, newDescription)}
              taskNumber={state.currentTaskIndex + 1}
              totalTasks={todayTasks.length}
            />
          </Animated.View>
        )}

        {/* Task List Overview */}
        <View style={styles.taskListContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
            Today&apos;s Tasks
          </Text>
          <TaskList tasks={sortedTodayTasks} currentTaskId={currentTask?.id || ''} />
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
    fontSize: typography.md,
  },
  taskListContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
