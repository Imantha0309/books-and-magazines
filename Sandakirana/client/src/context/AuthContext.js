import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'sandakirana_auth_user';

// Pull the persisted user object out of localStorage (if running in the browser).
const readStoredUser = () => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to read stored auth user', error);
    return null;
  }
};

// Expose the auth state and mutation helpers to the component tree.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  // Persist the authenticated user both in state and localStorage.
  const login = (userData) => {
    setUser(userData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  // Clear all authenticated state and remove the stored record.
  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Convenience hook for consuming the auth context.
export const useAuth = () => useContext(AuthContext);
