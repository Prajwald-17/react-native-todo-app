// src/screens/main/EditTodoScreen.tsx
import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditTodo'>;
type EditTodoRouteProp = RouteProp<MainStackParamList, 'EditTodo'>;

const EditTodoScreen: React.FC = () => {
  // Context and navigation hooks for state management and routing
  const { todos, updateTodo, deleteTodo } = useTodos();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditTodoRouteProp>();
  
  // Find the specific todo item based on the route parameter
  const todo = todos.find(t => t.id === route.params.todoId);
  
  // State management for form fields - using React's built-in state
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState(todo?.dueDate || new Date());
  const [deadline, setDeadline] = useState(todo?.deadline || new Date());
  const [priority, setPriority] = useState<Priority>(todo?.priority || Priority.MEDIUM);
  const [category, setCategory] = useState(todo?.category || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

  // Effect hook to handle navigation when todo is not found
  useEffect(() => {
    if (!todo) {
      Alert.alert('Error', 'Task not found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [todo, navigation]);

  // Handler for updating the todo item with form validation
  const handleUpdateTodo = () => {
    // Form validation - ensure title is provided
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!todo) return;

    // Update todo using context API state management
    updateTodo(todo.id, {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      deadline,
      priority,
      category: category.trim() || undefined,
    });

    // Success feedback and navigation back to list
    Alert.alert('Success', 'Task updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  // Handler for deleting todo with confirmation dialog
  const handleDeleteTodo = () => {
    if (!todo) return;
    
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            deleteTodo(todo.id);
            navigation.goBack();
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  // Utility function to format date and time display
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Utility functions for priority system with color coding
  const getPriorityColor = (priorityLevel: Priority): string => {
    switch (priorityLevel) {
      case Priority.LOW: return '#10b981';      // Green for low priority
      case Priority.MEDIUM: return '#f59e0b';   // Orange for medium priority  
      case Priority.HIGH: return '#f97316';     // Dark orange for high priority
      case Priority.URGENT: return '#ef4444';  // Red for urgent priority
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

  // Early return if todo not found
  if (!todo) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Input Section - Required field for task identification */}
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

        {/* Description Input Section - Optional detailed information */}
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

        {/* Due Date Selection - Date and time picker integration */}
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

        {/* Deadline Selection - Critical deadline management */}
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

        {/* Priority Selection System - Visual priority management */}
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

        {/* Category/Tags System - Task organization */}
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

        {/* Task Status Display - Current completion status */}
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: todo.completed ? '#22c55e' : '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {todo.completed ? '✓ Completed' : '⏳ Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons - Update and delete functionality */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteTodo}
          >
            <Text style={styles.deleteButtonText}>🗑 Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateTodo}
          >
            <Text style={styles.updateButtonText}>✓ Update Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date and Time Picker Components - Native date/time selection */}
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
                // Chain date picker with time picker for complete datetime selection
                setTimeout(() => {
                  setDatePickerMode('time');
                  setShowDatePicker(true);
                }, 100);
              } else {
                // Combine selected time with existing date
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
                // Chain date picker with time picker
                setTimeout(() => {
                  setDatePickerMode('time');
                  setShowDeadlinePicker(true);
                }, 100);
              } else {
                // Update deadline with selected time
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

// Styles for modern, visually appealing UI design
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
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  updateButton: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditTodoScreen;
