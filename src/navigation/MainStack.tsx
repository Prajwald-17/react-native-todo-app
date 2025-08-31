// src/navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodoListScreen from '../screens/main/TodoListScreen';
import AddTodoScreen from '../screens/main/AddTodoScreen';
import EditTodoScreen from '../screens/main/EditTodoScreen';
import { MainStackParamList } from '../types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TodoList" 
        component={TodoListScreen} 
        options={{ title: 'My Tasks' }}
      />
      <Stack.Screen 
        name="AddTodo" 
        component={AddTodoScreen} 
        options={{ title: 'Add Task' }}
      />
      <Stack.Screen 
        name="EditTodo" 
        component={EditTodoScreen} 
        options={{ title: 'Edit Task' }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
