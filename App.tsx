// App.tsx
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContex';
import { TodoProvider } from './src/contexts/TodoContext';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppNavigator />
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;
