
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { IconSymbol } from './IconSymbol';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput, Alert } from 'react-native';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
  onMiss: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEditTitle: (newTitle: string) => void;
  taskNumber: number;
  totalTasks: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onSkip,
  onMiss,
  onPrev,
  onNext,
  onEditTitle,
  taskNumber,
  totalTasks,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onEditTitle(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    if (task.isDone) return 'checkmark.circle.fill';
    if (task.isSkipped) return 'arrow.right.circle.fill';
    if (task.isMissed) return 'xmark.circle.fill';
    return 'circle';
  };

  const getStatusColor = () => {
    if (task.isDone) return '#4CAF50';
    if (task.isSkipped) return '#FF9800';
    if (task.isMissed) return '#F44336';
    return isDark ? colors.textDark : colors.textLight;
  };

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.cardDark : colors.cardLight },
      ]}
    >
      {/* Header with task number and hour */}
      <View style={styles.header}>
        <Text style={[styles.taskNumber, { color: isDark ? colors.textDark : colors.textLight }]}>
          Task {taskNumber} of {totalTasks}
        </Text>
        {!task.isAnytime && (
          <View style={[styles.hourBadge, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}>
            <Text style={styles.hourText}>{task.dueHour}:00</Text>
          </View>
        )}
        {task.isAnytime && (
          <View style={[styles.hourBadge, { backgroundColor: isDark ? '#555' : '#ddd' }]}>
            <Text style={styles.hourText}>Anytime</Text>
          </View>
        )}
      </View>

      {/* Task title */}
      {isEditing ? (
        <TextInput
          style={[
            styles.titleInput,
            {
              color: isDark ? colors.textDark : colors.textLight,
              backgroundColor: isDark ? '#333' : '#f5f5f5',
            },
          ]}
          value={editedTitle}
          onChangeText={setEditedTitle}
          onBlur={handleSaveTitle}
          onSubmitEditing={handleSaveTitle}
          autoFocus
          multiline
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.textLight }]}>
            {task.title}
          </Text>
        </TouchableOpacity>
      )}

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <IconSymbol name={getStatusIcon()} size={24} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {task.isDone && 'Completed'}
          {task.isSkipped && 'Skipped'}
          {task.isMissed && 'Missed'}
          {!task.isDone && !task.isSkipped && !task.isMissed && 'Pending'}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Previous button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}
          onPress={onPrev}
        >
          <IconSymbol name="chevron.left" size={24} color={isDark ? colors.textDark : colors.textLight} />
        </TouchableOpacity>

        {/* Complete button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            { backgroundColor: task.isDone ? '#4CAF50' : (isDark ? colors.primaryDark : colors.primaryLight) },
          ]}
          onPress={onComplete}
          disabled={task.isDone}
        >
          <IconSymbol name="checkmark" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Miss button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: task.isMissed ? '#F44336' : (isDark ? '#5a2a2a' : '#ffebee') },
          ]}
          onPress={() => {
            Alert.alert(
              'Mark as Missed',
              'This will deduct XP from your pet. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Miss', style: 'destructive', onPress: onMiss },
              ]
            );
          }}
          disabled={task.isMissed}
        >
          <IconSymbol name="xmark" size={28} color={task.isMissed ? '#fff' : '#F44336'} />
        </TouchableOpacity>

        {/* Skip button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: task.isSkipped ? '#FF9800' : (isDark ? '#4a3a1a' : '#fff3e0') },
          ]}
          onPress={onSkip}
          disabled={task.isSkipped}
        >
          <IconSymbol name="arrow.right" size={28} color={task.isSkipped ? '#fff' : '#FF9800'} />
        </TouchableOpacity>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}
          onPress={onNext}
        >
          <IconSymbol name="chevron.right" size={24} color={isDark ? colors.textDark : colors.textLight} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskNumber: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  hourBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  hourText: {
    color: '#fff',
    fontSize: typography.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  titleInput: {
    fontSize: typography.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    lineHeight: 28,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusText: {
    marginLeft: spacing.sm,
    fontSize: typography.md,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    flex: 1.5,
  },
});

export default TaskCard;
