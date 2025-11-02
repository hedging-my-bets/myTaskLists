
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppState } from '@/hooks/useAppState';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state, addTaskTemplate, deleteTaskTemplate } = useAppState();

  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isAnytime, setIsAnytime] = useState(true);
  const [selectedHour, setSelectedHour] = useState(9);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (isRecurring && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for recurring tasks');
      return;
    }

    addTaskTemplate({
      title: taskTitle.trim(),
      dueHour: isAnytime ? -1 : selectedHour,
      isAnytime,
      isRecurring,
      recurringDays: isRecurring ? selectedDays : [],
    });

    // Reset form
    setTaskTitle('');
    setIsAnytime(true);
    setSelectedHour(9);
    setIsRecurring(false);
    setSelectedDays([]);
    setShowAddForm(false);

    Alert.alert('Success', 'Task template created!');
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Task Template',
      'Are you sure you want to delete this task template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTaskTemplate(templateId),
        },
      ]
    );
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedHour(selectedDate.getHours());
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}
      edges={['top']}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.textLight }]}>
            Task Templates
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
            Create and manage your daily tasks
          </Text>
        </View>

        {/* Add Task Button */}
        {!showAddForm && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
            onPress={() => setShowAddForm(true)}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>
        )}

        {/* Add Task Form */}
        {showAddForm && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.formCard, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
                New Task Template
              </Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={isDark ? colors.textDark : colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Task Title */}
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>Task Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? colors.textDark : colors.textLight,
                  backgroundColor: isDark ? '#333' : '#f5f5f5',
                  borderColor: isDark ? '#555' : '#ddd',
                },
              ]}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task title..."
              placeholderTextColor={isDark ? '#888' : '#999'}
            />

            {/* Timeframe Toggle */}
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>Timeframe</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isAnytime && { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight },
                  !isAnytime && { backgroundColor: isDark ? '#333' : '#f5f5f5' },
                ]}
                onPress={() => setIsAnytime(true)}
              >
                <Text style={[styles.toggleText, { color: isAnytime ? '#fff' : (isDark ? colors.textDark : colors.textLight) }]}>
                  Anytime
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isAnytime && { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight },
                  isAnytime && { backgroundColor: isDark ? '#333' : '#f5f5f5' },
                ]}
                onPress={() => setIsAnytime(false)}
              >
                <Text style={[styles.toggleText, { color: !isAnytime ? '#fff' : (isDark ? colors.textDark : colors.textLight) }]}>
                  Specific Time
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            {!isAnytime && (
              <View style={styles.timePickerContainer}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <IconSymbol name="clock.fill" size={20} color={isDark ? colors.primaryDark : colors.primaryLight} />
                  <Text style={[styles.timeText, { color: isDark ? colors.textDark : colors.textLight }]}>
                    {selectedHour.toString().padStart(2, '0')}:00
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={new Date(2024, 0, 1, selectedHour, 0)}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </View>
            )}

            {/* Recurring Toggle */}
            <View style={styles.recurringContainer}>
              <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
                Recurring Task
              </Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  { backgroundColor: isRecurring ? (isDark ? colors.primaryDark : colors.primaryLight) : (isDark ? '#333' : '#ddd') },
                ]}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View
                  style={[
                    styles.switchThumb,
                    { transform: [{ translateX: isRecurring ? 22 : 2 }] },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Day Selection */}
            {isRecurring && (
              <View style={styles.daysContainer}>
                <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
                  Select Days
                </Text>
                <View style={styles.daysGrid}>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(index) && {
                          backgroundColor: isDark ? colors.primaryDark : colors.primaryLight,
                        },
                        !selectedDays.includes(index) && {
                          backgroundColor: isDark ? '#333' : '#f5f5f5',
                          borderColor: isDark ? '#555' : '#ddd',
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: selectedDays.includes(index) ? '#fff' : (isDark ? colors.textDark : colors.textLight) },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={[styles.cancelButtonText, { color: isDark ? colors.textDark : colors.textLight }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}
                onPress={handleAddTask}
              >
                <Text style={styles.saveButtonText}>Save Task</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Task Templates List */}
        <View style={styles.templatesList}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
            Your Task Templates
          </Text>
          {state?.taskTemplates && state.taskTemplates.length > 0 ? (
            state.taskTemplates.map((template) => (
              <Animated.View
                key={template.id}
                entering={SlideInRight.duration(300)}
                style={[styles.templateCard, { backgroundColor: isDark ? colors.cardDark : colors.cardLight }]}
              >
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
                      {template.title}
                    </Text>
                    <View style={styles.templateMeta}>
                      {template.isAnytime ? (
                        <View style={[styles.badge, { backgroundColor: isDark ? '#555' : '#e0e0e0' }]}>
                          <Text style={[styles.badgeText, { color: isDark ? colors.textDark : colors.textLight }]}>
                            Anytime
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.badge, { backgroundColor: isDark ? colors.primaryDark : colors.primaryLight }]}>
                          <Text style={styles.badgeText}>
                            {template.dueHour.toString().padStart(2, '0')}:00
                          </Text>
                        </View>
                      )}
                      {template.isRecurring && (
                        <View style={[styles.badge, { backgroundColor: isDark ? '#4a3a1a' : '#fff3e0' }]}>
                          <IconSymbol name="arrow.clockwise" size={12} color="#FF9800" />
                          <Text style={[styles.badgeText, { color: '#FF9800', marginLeft: 4 }]}>
                            Recurring
                          </Text>
                        </View>
                      )}
                    </View>
                    {template.isRecurring && template.recurringDays.length > 0 && (
                      <View style={styles.recurringDays}>
                        {template.recurringDays.map((dayIndex) => (
                          <Text
                            key={dayIndex}
                            style={[styles.recurringDayText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}
                          >
                            {DAYS_OF_WEEK[dayIndex]}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteTemplate(template.id)}>
                    <IconSymbol name="trash.fill" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="calendar.badge.plus" size={64} color={isDark ? '#555' : '#ddd'} />
              <Text style={[styles.emptyText, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
                No task templates yet
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? colors.textSecondaryDark : colors.textSecondaryLight }]}>
                Create your first task template to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.lg,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
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
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.xl,
    fontWeight: '700',
  },
  label: {
    fontSize: typography.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.md,
    borderWidth: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: typography.md,
    fontWeight: '600',
  },
  timePickerContainer: {
    marginTop: spacing.sm,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  recurringContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  daysContainer: {
    marginTop: spacing.md,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.md,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: '600',
  },
  templatesList: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  templateCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
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
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: typography.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: '#fff',
  },
  recurringDays: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  recurringDayText: {
    fontSize: typography.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: typography.lg,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.md,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
