import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../shared/context/auth-context';
import LoginSuccess from '../user/components/LoginSuccess';
import { authRoutes } from './auth.route';

export const dashboardRoutes = {
  home: '/'
};

function DashboardHome() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to={authRoutes.login} replace />;
  }

  return (
    <LoginSuccess
      userId={auth.userId}
      token={auth.token}
      onLogout={auth.logout}
    />
  );
}

export const dashboardRouteObjects = [
  {
    path: dashboardRoutes.home,
    element: <DashboardHome />
  }
];
