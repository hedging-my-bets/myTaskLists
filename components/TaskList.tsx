
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Task } from '@/types';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, currentTaskId }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusIcon = (task: Task) => {
    if (task.isDone) return '✓';
    if (task.isSkipped) return '→';
    if (task.isMissed) return '✕';
    return '○';
  };

  const getStatusColor = (task: Task) => {
    if (task.isDone) return '#4CAF50';
    if (task.isSkipped) return '#FF9800';
    if (task.isMissed) return '#F44336';
    return isDark ? colors.dark.textSecondary : colors.light.textSecondary;
  };

  const getTaskBackgroundColor = (task: Task) => {
    if (task.id === currentTaskId) {
      return isDark ? colors.dark.primary + '20' : colors.light.primary + '20';
    }
    if (task.isDone) {
      return isDark ? '#1b3a1b' : '#e8f5e9';
    }
    return isDark ? colors.dark.card : colors.light.card;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tasks.map((task, index) => (
        <Animated.View
          key={task.id}
          entering={FadeInDown.delay(index * 50).duration(300)}
          layout={Layout.springify().damping(15).stiffness(100)}
          style={[
            styles.taskItem,
            {
              backgroundColor: getTaskBackgroundColor(task),
              borderLeftWidth: task.id === currentTaskId ? 4 : 0,
              borderLeftColor: isDark ? colors.dark.primary : colors.light.primary,
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.statusIcon,
                { color: getStatusColor(task) },
              ]}
            >
              {getStatusIcon(task)}
            </Text>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  { color: isDark ? colors.dark.text : colors.light.text },
                  (task.isDone || task.isSkipped || task.isMissed) && styles.completedText,
                ]}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={[
                    styles.taskDescription,
                    { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
            </View>
            {!task.isAnytime && (
              <Text
                style={[
                  styles.taskTime,
                  { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary },
                ]}
              >
                {task.dueHour}:00
              </Text>
            )}
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  taskItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.sm,
    lineHeight: 18,
  },
  completedText: {
    opacity: 0.6,
  },
  taskTime: {
    fontSize: typography.sm,
    fontWeight: '500',
  },
});

export default TaskList;
