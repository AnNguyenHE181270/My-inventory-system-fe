import { useCallback, useEffect, useState } from 'react';

let logoutTimer;

const getStoredUserData = () => {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    localStorage.removeItem('userData');
    return null;
  }
};

function useAuth() {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const login = useCallback((uid, authToken, expirationDate, uRole) => {
    setToken(authToken);
    setUserId(uid);
    setUserRole(uRole);

    const expiration =
      expirationDate instanceof Date
        ? expirationDate
        : expirationDate
          ? new Date(expirationDate)
          : new Date(new Date().getTime() + 1000 * 60 * 60);

    setTokenExpirationDate(expiration);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userRole: uRole,
        userId: uid,
        token: authToken,
        expiration: expiration.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    const storedData = getStoredUserData();

    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration),
        storedData.userRole
      );
    }
  }, [login]);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();

      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  return { token, login, logout, userId, userRole };
}

export default useAuth;
