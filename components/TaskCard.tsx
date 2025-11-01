
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput, Alert } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Task } from '@/types';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEditTitle: (newTitle: string) => void;
  taskNumber: number;
  totalTasks: number;
}

export default function TaskCard({
  task,
  onComplete,
  onSkip,
  onPrev,
  onNext,
  onEditTitle,
  taskNumber,
  totalTasks,
}: TaskCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onEditTitle(editedTitle.trim());
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Task title cannot be empty');
    }
  };

  const getStatusIcon = () => {
    if (task.isDone) return '✓';
    if (task.isSkipped) return '⊘';
    if (task.isMissed) return '✕';
    return '○';
  };

  const getStatusColor = () => {
    if (task.isDone) return theme.success;
    if (task.isSkipped) return theme.warning;
    if (task.isMissed) return theme.error;
    return theme.textSecondary;
  };

  return (
    <Animated.View 
      entering={SlideInRight.duration(400)}
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={[styles.hourBadge, { color: theme.primary }]}>
            {task.dueHour}:00
          </Text>
          <Text style={[styles.taskCounter, { color: theme.textSecondary }]}>
            {taskNumber} / {totalTasks}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
            {getStatusIcon()}
          </Text>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={editedTitle}
            onChangeText={setEditedTitle}
            autoFocus
            onSubmitEditing={handleSaveTitle}
            placeholder="Task title"
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.editButtons}>
            <TouchableOpacity 
              onPress={handleSaveTitle}
              style={[styles.editButton, { backgroundColor: theme.success }]}
            >
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setEditedTitle(task.title);
                setIsEditing(false);
              }}
              style={[styles.editButton, { backgroundColor: theme.textSecondary }]}
            >
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          onLongPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            {task.title}
          </Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Long press to edit
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onPrev}
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
        >
          <IconSymbol name="chevron.left" size={24} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onComplete}
          disabled={task.isDone}
          style={[
            styles.actionButton, 
            styles.primaryButton,
            { backgroundColor: task.isDone ? theme.border : theme.success }
          ]}
        >
          <IconSymbol 
            name="checkmark" 
            size={28} 
            color={task.isDone ? theme.textSecondary : '#FFFFFF'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onSkip}
          disabled={task.isSkipped}
          style={[
            styles.actionButton,
            { backgroundColor: task.isSkipped ? theme.border : theme.warning }
          ]}
        >
          <IconSymbol 
            name="xmark" 
            size={24} 
            color={task.isSkipped ? theme.textSecondary : '#FFFFFF'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onNext}
          style={[styles.actionButton, { backgroundColor: theme.accent }]}
        >
          <IconSymbol name="chevron.right" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    boxShadow: '0px 4px 12px rgba(139, 127, 214, 0.15)',
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourBadge: {
    ...typography.h3,
    fontWeight: '700',
  },
  taskCounter: {
    ...typography.bodySmall,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  editContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1.5,
  },
});
