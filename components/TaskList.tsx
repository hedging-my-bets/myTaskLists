
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
                borderLeftColor: isDark ? colors.dark.primary : colors.light.primary,
                borderWidth: task.isSkipped ? 2 : 0,
                borderColor: task.isSkipped ? '#FF9800' : 'transparent',
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
                {task.isSkipped && (
                  <Text
                    style={[
                      styles.tapToReopen,
                      { color: '#FF9800' },
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
                    { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary },
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
