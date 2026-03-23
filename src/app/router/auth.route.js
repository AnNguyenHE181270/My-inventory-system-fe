import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import LoginPage from '../../features/auth/pages/LoginPage';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import Register from '../../features/auth/pages/Register';
import ResetPassword from '../../features/auth/pages/ResetPassword';
import VerifyEmail from '../../features/auth/pages/VerifyEmail';
import AuthLayout from '../../features/auth/components/AuthLayout';
import { authRoutes, getDashboardPathByRole } from './routes.constants';

export { authRoutes };

const getStoredUserRole = () => {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userRole || null;
  } catch (error) {
    return null;
  }
};

function GuestOnlyRoute() {
  const auth = useContext(AuthContext);
  const storedRole = getStoredUserRole();
  const activeRole = auth.role || storedRole;

  if ((auth.isLoggedIn || storedRole) && ['staff', 'admin', 'manager'].includes(activeRole)) {
    return <Navigate to={getDashboardPathByRole(activeRole)} replace />;
  }

  return <AuthLayout />;
}

export const authRouteObjects = [
  {
    element: <GuestOnlyRoute />,
    children: [
      { path: authRoutes.login, element: <LoginPage /> },
      { path: authRoutes.register, element: <Register /> },
      { path: authRoutes.forgotPassword, element: <ForgotPassword /> },
      { path: authRoutes.resetPassword, element: <ResetPassword /> },
      { path: authRoutes.verifyEmail, element: <VerifyEmail /> }
    ]
  }
];
