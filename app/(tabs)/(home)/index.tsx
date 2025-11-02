
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import TaskCard from '@/components/TaskCard';
import { colors, spacing, typography } from '@/styles/commonStyles';
import React, { useEffect } from 'react';
import PetDisplay from '@/components/PetDisplay';
import { useAppState } from '@/hooks/useAppState';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskList from '@/components/TaskList';
import { Stack } from 'expo-router';
import { getTodayKey } from '@/utils/storage';

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
    refreshState 
  } = useAppState();

  useEffect(() => {
    refreshState();
  }, []);

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
  const currentTask = todayTasks[state.currentTaskIndex];

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
          <TaskCard
            task={currentTask}
            onComplete={completeCurrentTask}
            onSkip={skipCurrentTask}
            onMiss={missCurrentTask}
            onPrev={prevTask}
            onNext={nextTask}
            onEditTitle={(newTitle) => editTaskTitle(currentTask.id, newTitle)}
            taskNumber={state.currentTaskIndex + 1}
            totalTasks={todayTasks.length}
          />
        )}

        {/* Task List Overview */}
        <View style={styles.taskListContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
            Today&apos;s Tasks
          </Text>
          <TaskList tasks={todayTasks} currentTaskId={currentTask?.id || ''} />
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
