
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
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useAppState } from '@/hooks/useAppState';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { state, addTaskTemplate, deleteTaskTemplate } = useAppState();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnytime, setIsAnytime] = useState(false);
  const [dueHour, setDueHour] = useState(9);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (isRecurring && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for recurring tasks');
      return;
    }

    addTaskTemplate({
      title: title.trim(),
      description: description.trim(),
      dueHour: isAnytime ? -1 : dueHour,
      isAnytime,
      isRecurring,
      recurringDays: isRecurring ? selectedDays : [0, 1, 2, 3, 4, 5, 6], // All days if not recurring
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsAnytime(false);
    setDueHour(9);
    setIsRecurring(false);
    setSelectedDays([]);

    Alert.alert('Success', 'Task template added successfully!');
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueHour(selectedDate.getHours());
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this task template? This will remove all associated tasks.',
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.textLight }]}>
            Add New Task
          </Text>

          {/* Task Title */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
              Task Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? colors.textDark : colors.textLight,
                  backgroundColor: isDark ? colors.dark.card : colors.light.card,
                  borderColor: isDark ? '#444' : '#ddd',
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          {/* Task Description */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: isDark ? colors.textDark : colors.textLight,
                  backgroundColor: isDark ? colors.dark.card : colors.light.card,
                  borderColor: isDark ? '#444' : '#ddd',
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description (optional)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Time Selection */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
              Time
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isAnytime
                    ? (isDark ? colors.dark.primary : colors.light.primary)
                    : (isDark ? colors.dark.card : colors.light.card),
                  borderColor: isDark ? '#444' : '#ddd',
                },
              ]}
              onPress={() => setIsAnytime(!isAnytime)}
            >
              <IconSymbol
                name={isAnytime ? 'checkmark.circle.fill' : 'circle'}
                size={24}
                color={isAnytime ? '#fff' : (isDark ? colors.textDark : colors.textLight)}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: isAnytime ? '#fff' : (isDark ? colors.textDark : colors.textLight) },
                ]}
              >
                Anytime during the day
              </Text>
            </TouchableOpacity>

            {!isAnytime && (
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: isDark ? colors.dark.card : colors.light.card,
                    borderColor: isDark ? '#444' : '#ddd',
                  },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <IconSymbol name="clock" size={24} color={isDark ? colors.textDark : colors.textLight} />
                <Text style={[styles.timeText, { color: isDark ? colors.textDark : colors.textLight }]}>
                  {dueHour.toString().padStart(2, '0')}:00
                </Text>
              </TouchableOpacity>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={new Date(2024, 0, 1, dueHour, 0)}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Recurring Toggle */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
              Recurring
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isRecurring
                    ? (isDark ? colors.dark.primary : colors.light.primary)
                    : (isDark ? colors.dark.card : colors.light.card),
                  borderColor: isDark ? '#444' : '#ddd',
                },
              ]}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <IconSymbol
                name={isRecurring ? 'checkmark.circle.fill' : 'circle'}
                size={24}
                color={isRecurring ? '#fff' : (isDark ? colors.textDark : colors.textLight)}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: isRecurring ? '#fff' : (isDark ? colors.textDark : colors.textLight) },
                ]}
              >
                Repeat on selected days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Day Selection */}
          {isRecurring && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? colors.textDark : colors.textLight }]}>
                Select Days *
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: selectedDays.includes(index)
                          ? (isDark ? colors.dark.primary : colors.light.primary)
                          : (isDark ? colors.dark.card : colors.light.card),
                        borderColor: isDark ? '#444' : '#ddd',
                      },
                    ]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: selectedDays.includes(index)
                            ? '#fff'
                            : (isDark ? colors.textDark : colors.textLight),
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: isDark ? colors.dark.primary : colors.light.primary },
            ]}
            onPress={handleAddTask}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>

          {/* Existing Templates */}
          {state?.taskTemplates && state.taskTemplates.length > 0 && (
            <View style={styles.templatesContainer}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
                Task Templates
              </Text>
              {state.taskTemplates.map((template) => (
                <Animated.View
                  key={template.id}
                  entering={SlideInRight.duration(300)}
                  style={[
                    styles.templateCard,
                    { backgroundColor: isDark ? colors.dark.card : colors.light.card },
                  ]}
                >
                  <View style={styles.templateContent}>
                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateTitle, { color: isDark ? colors.textDark : colors.textLight }]}>
                        {template.title}
                      </Text>
                      {template.description && (
                        <Text style={[styles.templateDescription, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
                          {template.description}
                        </Text>
                      )}
                      <View style={styles.templateMeta}>
                        <Text style={[styles.templateMetaText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
                          {template.isAnytime ? 'Anytime' : `${template.dueHour}:00`}
                        </Text>
                        {template.isRecurring && (
                          <Text style={[styles.templateMetaText, { color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }]}>
                            • {template.recurringDays.map(d => DAYS_OF_WEEK[d]).join(', ')}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTemplate(template.id)}
                    >
                      <IconSymbol name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  toggleText: {
    fontSize: typography.md,
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  timeText: {
    fontSize: typography.lg,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  dayText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.lg,
    fontWeight: '700',
  },
  templatesContainer: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  templateCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  templateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: typography.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  templateDescription: {
    fontSize: typography.sm,
    marginBottom: spacing.xs,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  templateMetaText: {
    fontSize: typography.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});

export default CalendarScreen;
