import './App.css';
import { AuthContext } from './shared/context/auth-context';
import useAuth from './shared/hooks/auth-hook';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.route';

function App() {
  const { token, login, logout, userId } = useAuth();
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isAuthenticated,
        token,
        userId,
        login,
        logout
      }}
    >
      <main className="app">
        <RouterProvider router={router} />
      </main>
    </AuthContext.Provider>
  );
}

export default App;
