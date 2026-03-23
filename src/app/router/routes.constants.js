export const authRoutes = {
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password'
};

export const dashboardRoutes = {
  home: '/',
  dashboard: '/dashboard',
  staff: '/dashboard/staff',
  staffSell: '/dashboard/staff/sell',
  staffOrders: '/dashboard/staff/orders',
  staffProducts: '/dashboard/staff/products',
  staffReports: '/dashboard/staff/reports',
  manager: '/dashboard/manager',
  managerOverview: '/dashboard/manager/overview',
  managerCreateImport: '/dashboard/manager/create-import',
  managerImports: '/dashboard/manager/imports',
  admin: '/dashboard/admin',
  adminImports: '/dashboard/admin/imports',
};

export const getDashboardPathByRole = role => {
  if (role === 'manager') return dashboardRoutes.managerOverview;
  if (role === 'staff') return dashboardRoutes.staffSell;
  if (role === 'admin') return dashboardRoutes.adminImports;
  return authRoutes.login;
};
