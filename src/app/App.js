import React from 'react';
import { AuthContext } from '../shared/context/auth-context';
import useAuth from '../shared/hooks/auth-hook';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.route';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-10 font-mono">
          <h2 className="text-red-600">Loi ung dung:</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-red-50 p-4">
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { token, login, logout, userId, userRole } = useAuth();
  const isAuthenticated = !!token;

  return (
    <ErrorBoundary>
      <AuthContext.Provider
        value={{
          isLoggedIn: isAuthenticated,
          token,
          userId,
          role: userRole,
          login,
          logout
        }}
      >
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
