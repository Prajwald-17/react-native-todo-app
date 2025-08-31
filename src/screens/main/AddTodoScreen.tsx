// src/screens/main/AddTodoScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTodos } from '../../contexts/TodoContext';
import { Priority } from '../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'AddTodo'>;

const AddTodoScreen: React.FC = () => {
  const { addTodo } = useTodos();
  const navigation = useNavigation<NavigationProp>();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [category, setCategory] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

  const handleSaveTodo = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (deadline < new Date()) {
      Alert.alert('Error', 'Deadline cannot be in the past');
      return;
    }

    addTodo({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      deadline,
      priority,
      completed: false,
      category: category.trim() || undefined,
    });

    Alert.alert('Success', 'Task added successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priorityLevel: Priority): string => {
    switch (priorityLevel) {
      case Priority.LOW: return '#10b981';
      case Priority.MEDIUM: return '#f59e0b';
      case Priority.HIGH: return '#f97316';
      case Priority.URGENT: return '#ef4444';
    }
  };

  const getPriorityText = (priorityLevel: Priority): string => {
    switch (priorityLevel) {
      case Priority.LOW: return 'Low';
      case Priority.MEDIUM: return 'Medium';
      case Priority.HIGH: return 'High';
      case Priority.URGENT: return 'Urgent';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add description (optional)..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Due Date & Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerMode('date');
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>📅 {formatDateTime(dueDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Deadline */}
        <View style={styles.section}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerMode('date');
              setShowDeadlinePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>⏰ {formatDateTime(deadline)}</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {[Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  { backgroundColor: priority === p ? getPriorityColor(p) : '#f1f5f9' }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityButtonText,
                  { color: priority === p ? 'white' : '#666' }
                ]}>
                  {getPriorityText(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Work, Personal, Shopping..."
            value={category}
            onChangeText={setCategory}
            maxLength={50}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveTodo}
          >
            <Text style={styles.saveButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode={datePickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              if (datePickerMode === 'date') {
                setDueDate(selectedDate);
                // After selecting date, show time picker
                setTimeout(() => {
                  setDatePickerMode('time');
                  setShowDatePicker(true);
                }, 100);
              } else {
                // Time selected, update the date with new time
                const updatedDate = new Date(dueDate);
                updatedDate.setHours(selectedDate.getHours());
                updatedDate.setMinutes(selectedDate.getMinutes());
                setDueDate(updatedDate);
              }
            }
          }}
        />
      )}

      {showDeadlinePicker && (
        <DateTimePicker
          value={deadline}
          mode={datePickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDeadlinePicker(false);
            if (selectedDate) {
              if (datePickerMode === 'date') {
                setDeadline(selectedDate);
                // After selecting date, show time picker
                setTimeout(() => {
                  setDatePickerMode('time');
                  setShowDeadlinePicker(true);
                }, 100);
              } else {
                // Time selected, update the deadline with new time
                const updatedDate = new Date(deadline);
                updatedDate.setHours(selectedDate.getHours());
                updatedDate.setMinutes(selectedDate.getMinutes());
                setDeadline(updatedDate);
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddTodoScreen;
