import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../shared/context/auth-context';
import LoginPage from '../user/pages/LoginPage';
import ForgotPassword from '../user/pages/ForgotPassword';
import Register from '../user/pages/Register';
import ResetPassword from '../user/pages/ResetPassword';
import VerifyEmail from '../user/pages/VerifyEmail';
import AuthLayout from '../user/components/AuthLayout';
import { dashboardRoutes } from './dashboard.route';

export const authRoutes = {
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password'
};

function GuestOnlyRoute() {
  const auth = useContext(AuthContext);

  if (auth.isLoggedIn) {
    return <Navigate to={dashboardRoutes.home} replace />;
  }

  return <Outlet />;
}

function AuthRouteLayout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export const authRouteObjects = [
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthRouteLayout />,
        children: [
          {
            path: authRoutes.login,
            element: <LoginPage />
          },
          {
            path: authRoutes.register,
            element: <Register />
          },
          {
            path: authRoutes.forgotPassword,
            element: <ForgotPassword />
          },
          {
            path: authRoutes.resetPassword,
            element: <ResetPassword />
          },
          {
            path: authRoutes.verifyEmail,
            element: <VerifyEmail />
          }
        ]
      }
    ]
  }
];
