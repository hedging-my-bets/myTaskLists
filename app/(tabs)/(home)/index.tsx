
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '@/hooks/useAppState';
import { getTodayKey } from '@/utils/storage';
import PetDisplay from '@/components/PetDisplay';
import TaskCard from '@/components/TaskCard';
import TaskList from '@/components/TaskList';
import { colors, spacing, typography } from '@/styles/commonStyles';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  
  const {
    state,
    loading,
    completeCurrentTask,
    skipCurrentTask,
    nextTask,
    prevTask,
    editTaskTitle,
    refreshState,
  } = useAppState();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshState();
    setRefreshing(false);
  }, [refreshState]);

  useEffect(() => {
    // Check for rollover every minute
    const interval = setInterval(() => {
      refreshState();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshState]);

  if (loading || !state) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading PetProgress...
        </Text>
      </View>
    );
  }

  const todayKey = getTodayKey();
  const todayTasks = state.tasks.filter(t => t.dayKey === todayKey);
  const currentTask = todayTasks[state.currentTaskIndex];

  if (!currentTask) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          No tasks available
        </Text>
      </View>
    );
  }

  const completedCount = todayTasks.filter(t => t.isDone).length;
  const skippedCount = todayTasks.filter(t => t.isSkipped).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'PetProgress',
          headerShown: false,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            PetProgress
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Complete tasks to evolve your pet
          </Text>
        </View>

        <PetDisplay petState={state.petState} />

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {completedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completed
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              {skippedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Skipped
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {todayTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total
            </Text>
          </View>
        </View>

        <TaskCard
          task={currentTask}
          onComplete={completeCurrentTask}
          onSkip={skipCurrentTask}
          onPrev={prevTask}
          onNext={nextTask}
          onEditTitle={(newTitle) => editTaskTitle(currentTask.id, newTitle)}
          taskNumber={state.currentTaskIndex + 1}
          totalTasks={todayTasks.length}
        />

        <TaskList tasks={todayTasks} currentTaskId={currentTask.id} />

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            💡 Complete tasks to earn XP and evolve your pet
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            ⚠️ Missed tasks at midnight will reduce XP
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            ⚙️ Configure grace period in Settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.h3,
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(139, 127, 214, 0.1)',
    elevation: 2,
  },
  statValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  infoBox: {
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  infoText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});
