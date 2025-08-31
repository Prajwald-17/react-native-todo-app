// src/contexts/TodoContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Priority } from '../types';

interface TodoContextType {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  loading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);
// In src/contexts/TodoContext.tsx, add this utility function:

export const sortTodos = (todos: Todo[], sortBy: string, direction: 'asc' | 'desc') => {
  return [...todos].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'smart': // Smart sorting - mix of deadline, priority, completion
        // Completed tasks go to bottom
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // For active tasks, sort by: 1) Urgency, 2) Deadline, 3) Priority
        const now = new Date().getTime();
        const aUrgency = (a.deadline.getTime() - now) / (1000 * 60 * 60); // Hours until deadline
        const bUrgency = (b.deadline.getTime() - now) / (1000 * 60 * 60);
        
        // If one is overdue, prioritize it
        if (aUrgency < 0 && bUrgency >= 0) return -1;
        if (bUrgency < 0 && aUrgency >= 0) return 1;
        
        // Both overdue or both future - sort by priority first, then deadline
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        
        return a.deadline.getTime() - b.deadline.getTime(); // Earlier deadline first
        
      case 'dueDate':
        comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      case 'deadline':
        comparison = a.deadline.getTime() - b.deadline.getTime();
        break;
      case 'priority':
        comparison = b.priority - a.priority; // Higher priority first
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const stored = await AsyncStorage.getItem('todos');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const todosWithDates = parsed.map((todo: any) => ({
          ...todo,
          dueDate: new Date(todo.dueDate),
          deadline: new Date(todo.deadline),
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        setTodos(todosWithDates);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    updateTodo(id, { completed: !todos.find(t => t.id === id)?.completed });
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo, loading }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
