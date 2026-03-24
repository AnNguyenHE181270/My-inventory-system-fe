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
  staffProfile: '/dashboard/staff/profile',
  manager: '/dashboard/manager',
  managerOverview: '/dashboard/manager/overview',
  managerCreateImport: '/dashboard/manager/create-import',
  managerImports: '/dashboard/manager/imports',
  managerProfile: '/dashboard/manager/profile',
  admin: '/dashboard/admin',
  adminOverview: '/dashboard/admin/overview',
  adminImports: '/dashboard/admin/imports',
  adminUsers: '/dashboard/admin/users',
  adminUnits: '/dashboard/admin/units',
  adminProducts: '/dashboard/admin/products',
  adminProfile: '/dashboard/admin/profile',
};

export const getDashboardPathByRole = role => {
  if (role === 'manager') return dashboardRoutes.managerOverview;
  if (role === 'staff') return dashboardRoutes.staffSell;
  if (role === 'admin') return dashboardRoutes.adminOverview;
  return authRoutes.login;
};
