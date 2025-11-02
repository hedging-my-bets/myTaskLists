
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Task } from '@/types';
import React from 'react';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';

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
    if (task.isDone) return '#4CAF50'; // Green for completed
    if (task.isSkipped) return '#FF9800';
    if (task.isMissed) return '#F44336';
    return isDark ? colors.textSecondaryDark : colors.textSecondaryLight;
  };

  const getTaskBackgroundColor = (task: Task) => {
    if (task.id === currentTaskId) {
      return isDark ? colors.primaryDark : colors.primaryLight;
    }
    if (task.isDone) {
      return isDark ? '#1b3a1b' : '#e8f5e9'; // Green tint for completed
    }
    return isDark ? '#2a2a2a' : '#f5f5f5';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? colors.textDark : colors.textLight }]}>
        Today&apos;s Tasks
      </Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {tasks.map((task) => (
          <View
            key={task.id}
            style={[
              styles.taskItem,
              {
                backgroundColor: getTaskBackgroundColor(task),
              },
            ]}
          >
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.statusIcon,
                  { color: getStatusColor(task) },
                ]}
              >
                {getStatusIcon(task)}
              </Text>
              <View style={styles.taskDetails}>
                <Text
                  style={[
                    styles.taskTitle,
                    {
                      color: task.id === currentTaskId
                        ? '#fff'
                        : isDark
                        ? colors.textDark
                        : colors.textLight,
                    },
                    task.isDone && styles.completedText,
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                {!task.isAnytime && (
                  <Text
                    style={[
                      styles.taskTime,
                      {
                        color: task.id === currentTaskId
                          ? 'rgba(255, 255, 255, 0.8)'
                          : isDark
                          ? colors.textSecondaryDark
                          : colors.textSecondaryLight,
                      },
                    ]}
                  >
                    {task.dueHour}:00
                  </Text>
                )}
                {task.isAnytime && (
                  <Text
                    style={[
                      styles.taskTime,
                      {
                        color: task.id === currentTaskId
                          ? 'rgba(255, 255, 255, 0.8)'
                          : isDark
                          ? colors.textSecondaryDark
                          : colors.textSecondaryLight,
                      },
                    ]}
                  >
                    Anytime
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  list: {
    maxHeight: 300,
  },
  taskItem: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: typography.lg,
    fontWeight: '700',
    marginRight: spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedText: {
    opacity: 0.8,
  },
  taskTime: {
    fontSize: typography.sm,
  },
});

export default TaskList;
