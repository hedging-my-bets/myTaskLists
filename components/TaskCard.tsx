
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';
import { IconSymbol } from './IconSymbol';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput, Alert, Platform } from 'react-native';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
  onMiss: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEditTitle: (newTitle: string) => void;
  onEditDescription?: (newDescription: string) => void;
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
  onEditDescription,
  taskNumber,
  totalTasks,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onEditTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (onEditDescription && editedDescription !== task.description) {
      onEditDescription(editedDescription.trim());
    }
    setIsEditingDescription(false);
  };

  const getStatusIcon = () => {
    if (task.isDone) return 'checkmark.circle.fill';
    if (task.isSkipped) return 'arrow.right.circle.fill';
    if (task.isMissed) return 'xmark.circle.fill';
    return 'circle';
  };

  const getStatusColor = () => {
    if (task.isDone) return '#4CAF50'; // Green for completed
    if (task.isSkipped) return '#FF9800';
    if (task.isMissed) return '#F44336';
    return isDark ? colors.dark.text : colors.light.text;
  };

  const getCardBackgroundColor = () => {
    if (task.isDone) {
      return isDark ? '#1b3a1b' : '#e8f5e9'; // Green tint for completed
    }
    return isDark ? colors.dark.card : colors.light.card;
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
      style={[
        styles.container,
        { backgroundColor: getCardBackgroundColor() },
      ]}
    >
      {/* Header with task number and hour */}
      <View style={styles.header}>
        <Text style={[styles.taskNumber, { color: isDark ? colors.dark.text : colors.light.text }]}>
          Task {taskNumber} of {totalTasks}
        </Text>
        {!task.isAnytime && (
          <View style={[styles.hourBadge, { backgroundColor: isDark ? colors.dark.primary : colors.light.primary }]}>
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
      {isEditingTitle ? (
        <TextInput
          style={[
            styles.titleInput,
            {
              color: isDark ? colors.dark.text : colors.light.text,
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
        <TouchableOpacity onPress={() => setIsEditingTitle(true)} activeOpacity={0.7}>
          <Text style={[styles.title, { color: isDark ? colors.dark.text : colors.light.text }]}>
            {task.title}
          </Text>
        </TouchableOpacity>
      )}

      {/* Task description */}
      {isEditingDescription ? (
        <TextInput
          style={[
            styles.descriptionInput,
            {
              color: isDark ? colors.dark.text : colors.light.text,
              backgroundColor: isDark ? '#333' : '#f5f5f5',
            },
          ]}
          value={editedDescription}
          onChangeText={setEditedDescription}
          onBlur={handleSaveDescription}
          onSubmitEditing={handleSaveDescription}
          placeholder="Add a description..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          autoFocus
          multiline
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditingDescription(true)} activeOpacity={0.7}>
          <Text style={[
            styles.description,
            { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }
          ]}>
            {task.description || 'Tap to add description...'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <IconSymbol name={getStatusIcon()} size={24} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {task.isDone && 'Completed ✓'}
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
          <IconSymbol name="chevron.left" size={24} color={isDark ? colors.dark.text : colors.light.text} />
        </TouchableOpacity>

        {/* Complete button - ALWAYS GREEN */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            { 
              backgroundColor: '#4CAF50', // Always green
              opacity: task.isDone ? 0.6 : 1, // Slightly dimmed when already completed
            },
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
          <IconSymbol name="chevron.right" size={24} color={isDark ? colors.dark.text : colors.light.text} />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  hourBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  hourText: {
    color: '#fff',
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  titleInput: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    lineHeight: 28,
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  descriptionInput: {
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 60,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusText: {
    marginLeft: spacing.sm,
    fontSize: typography.body.fontSize,
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
