
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Task } from '@/types';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string;
  onTaskPress?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, currentTaskId, onTaskPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const getStatusIcon = (task: Task) => {
    if (task.isDone) return '✓';
    if (task.isSkipped) return '→';
    if (task.isMissed) return '✕';
    return '○';
  };

  const getStatusColor = (task: Task) => {
    if (task.isDone) return colors.dark.reward; // #22C55E
    if (task.isSkipped) return colors.dark.warning; // #FBBF24
    if (task.isMissed) return colors.dark.error; // #F87171
    return theme.textSecondary;
  };

  const getTaskBackgroundColor = (task: Task) => {
    if (task.id === currentTaskId) {
      return isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(96, 165, 250, 0.1)'; // Primary tint
    }
    if (task.isDone) {
      return isDark ? 'rgba(34, 197, 94, 0.1)' : '#e8f5e9'; // Success tint
    }
    return theme.card; // #121826 in dark mode
  };

  const handleTaskPress = (task: Task) => {
    // Allow reopening skipped tasks
    if (task.isSkipped && onTaskPress) {
      onTaskPress(task);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tasks.map((task, index) => (
        <TouchableOpacity
          key={task.id}
          onPress={() => handleTaskPress(task)}
          activeOpacity={task.isSkipped ? 0.7 : 1}
          disabled={!task.isSkipped}
        >
          <Animated.View
            entering={FadeInDown.delay(index * 50).duration(300)}
            layout={Layout.springify().damping(15).stiffness(100)}
            style={[
              styles.taskItem,
              {
                backgroundColor: getTaskBackgroundColor(task),
                borderLeftWidth: task.id === currentTaskId ? 4 : 0,
                borderLeftColor: theme.primary, // #60A5FA
                borderWidth: task.isSkipped ? 2 : 0,
                borderColor: task.isSkipped ? colors.dark.warning : 'transparent', // #FBBF24
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
                    { color: theme.text },
                    (task.isDone || task.isSkipped || task.isMissed) && styles.completedText,
                  ]}
                >
                  {task.title}
                </Text>
                {task.description && (
                  <Text
                    style={[
                      styles.taskDescription,
                      { color: theme.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                )}
                {task.isSkipped && (
                  <Text
                    style={[
                      styles.tapToReopen,
                      { color: colors.dark.warning }, // #FBBF24
                    ]}
                  >
                    Tap to reopen
                  </Text>
                )}
              </View>
              {!task.isAnytime && (
                <Text
                  style={[
                    styles.taskTime,
                    { color: theme.textSecondary },
                  ]}
                >
                  {task.dueHour}:00
                </Text>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
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
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  completedText: {
    opacity: 0.6,
  },
  taskTime: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  tapToReopen: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default TaskList;
