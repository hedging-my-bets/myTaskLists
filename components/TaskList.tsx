
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Task } from '@/types';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string | null;
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
    if (task.isMissed) {
      return isDark ? 'rgba(248, 113, 113, 0.1)' : '#ffebee'; // Error tint
    }
    if (task.isSkipped) {
      return isDark ? 'rgba(251, 191, 36, 0.1)' : '#fff3e0'; // Warning tint
    }
    return theme.card; // #121826 in dark mode
  };

  const handleTaskPress = (task: Task) => {
    console.log(`📋 [TaskList] Task pressed: ${task.id} - "${task.title}"`);
    if (onTaskPress) {
      onTaskPress(task);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {tasks.map((task, index) => (
        <TouchableOpacity
          key={task.id}
          onPress={() => handleTaskPress(task)}
          activeOpacity={0.7}
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
                {task.id === currentTaskId && (
                  <Text
                    style={[
                      styles.currentTaskLabel,
                      { color: theme.primary },
                    ]}
                  >
                    Current Task
                  </Text>
                )}
                {(task.isDone || task.isSkipped || task.isMissed) && (
                  <Text
                    style={[
                      styles.tapToChange,
                      { color: theme.primary },
                    ]}
                  >
                    Tap to change status
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
  currentTaskLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tapToChange: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default TaskList;
