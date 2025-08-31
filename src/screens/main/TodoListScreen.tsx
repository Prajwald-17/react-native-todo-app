// src/screens/main/TodoListScreen.tsx
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContex';
import { useTodos } from '../../contexts/TodoContext';
import { Todo, Priority, TodoFilter } from '../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'TodoList'>;

const TodoListScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { todos, toggleTodo, deleteTodo } = useTodos();
  const navigation = useNavigation<NavigationProp>();
  
  const [filter, setFilter] = useState<TodoFilter>({
    searchText: '',
    sortBy: 'dueDate',
    sortDirection: 'asc',
  });

  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(filter.searchText.toLowerCase()) ||
                          todo.description.toLowerCase().includes(filter.searchText.toLowerCase());
      const matchesPriority = filter.priority ? todo.priority === filter.priority : true;
      const matchesCompleted = filter.completed !== undefined ? todo.completed === filter.completed : true;
      const matchesCategory = filter.category ? todo.category === filter.category : true;

      return matchesSearch && matchesPriority && matchesCompleted && matchesCategory;
    });

    // Sort todos
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          comparison = b.priority - a.priority; // Higher priority first
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return filter.sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [todos, filter]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const handleDeleteTodo = (todo: Todo) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteTodo(todo.id), style: 'destructive' },
      ]
    );
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW: return '#10b981';
      case Priority.MEDIUM: return '#f59e0b';
      case Priority.HIGH: return '#f97316';
      case Priority.URGENT: return '#ef4444';
    }
  };

  const getPriorityText = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW: return 'Low';
      case Priority.MEDIUM: return 'Medium';
      case Priority.HIGH: return 'High';
      case Priority.URGENT: return 'Urgent';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={[styles.todoItem, item.completed && styles.completedTodo]}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => navigation.navigate('EditTodo', { todoId: item.id })}
      >
        <View style={styles.todoHeader}>
          <Text style={[styles.todoTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityText(item.priority)}</Text>
          </View>
        </View>
        
        {item.description ? (
          <Text style={[styles.todoDescription, item.completed && styles.completedText]}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.todoFooter}>
          <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
          {item.category && (
            <Text style={styles.category}>{item.category}</Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.todoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => toggleTodo(item.id)}
        >
          <Text style={styles.actionButtonText}>
            {item.completed ? '↶' : '✓'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTodo(item)}
        >
          <Text style={styles.actionButtonText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={filter.searchText}
          onChangeText={(text) => setFilter(prev => ({ ...prev, searchText: text }))}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.completed === undefined && styles.activeFilterChip
            ]}
            onPress={() => setFilter(prev => ({ ...prev, completed: undefined }))}
          >
            <Text style={styles.filterChipText}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.completed === false && styles.activeFilterChip
            ]}
            onPress={() => setFilter(prev => ({ ...prev, completed: false }))}
          >
            <Text style={styles.filterChipText}>Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.completed === true && styles.activeFilterChip
            ]}
            onPress={() => setFilter(prev => ({ ...prev, completed: true }))}
          >
            <Text style={styles.filterChipText}>Completed</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Todo List */}
      <FlatList
        data={filteredAndSortedTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        style={styles.todoList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first task</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTodo')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#282828ff',
  },
  signOutButton: {
    backgroundColor: '#e41111ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#e4e4e4ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  filtersRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  todoItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedTodo: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  todoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  todoActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
});

export default TodoListScreen;
