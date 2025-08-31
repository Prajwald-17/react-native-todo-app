// src/types/index.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  deadline: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
}

export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface TodoFilter {
  searchText: string;
  priority?: Priority;
  completed?: boolean;
  category?: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortDirection: 'asc' | 'desc';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TodoList: undefined;
  AddTodo: undefined;
  EditTodo: { todoId: string };
};
