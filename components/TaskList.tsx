
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Task } from '@/types';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';

interface TaskListProps {
  tasks: Task[];
  currentTaskId: string;
}

export default function TaskList({ tasks, currentTaskId }: TaskListProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  const getStatusIcon = (task: Task) => {
    if (task.isDone) return '✓';
    if (task.isSkipped) return '⊘';
    if (task.isMissed) return '✕';
    return '○';
  };

  const getStatusColor = (task: Task) => {
    if (task.isDone) return theme.success;
    if (task.isSkipped) return theme.warning;
    if (task.isMissed) return theme.error;
    return theme.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        Today&apos;s Tasks
      </Text>
      
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {tasks.map((task) => {
          const isActive = task.id === currentTaskId;
          const statusColor = getStatusColor(task);
          
          return (
            <View
              key={task.id}
              style={[
                styles.taskItem,
                { 
                  backgroundColor: isActive ? theme.accent : 'transparent',
                  borderLeftColor: statusColor,
                }
              ]}
            >
              <View style={styles.taskHeader}>
                <Text style={[styles.taskTime, { color: theme.primary }]}>
                  {task.dueHour}:00
                </Text>
                <Text style={[styles.statusIcon, { color: statusColor }]}>
                  {getStatusIcon(task)}
                </Text>
              </View>
              <Text 
                style={[
                  styles.taskTitle, 
                  { color: isActive ? theme.text : theme.textSecondary }
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    boxShadow: '0px 4px 12px rgba(139, 127, 214, 0.15)',
    elevation: 4,
    maxHeight: 400,
  },
  header: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  taskItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskTime: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskTitle: {
    ...typography.bodySmall,
  },
});
