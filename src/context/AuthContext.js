// src/context/AuthContext.js
//
// Authentication state for the whole app.
//
// The backend issues a JWT access token (15 min) plus a rotating refresh
// token (7 days). This context:
//   - persists both tokens + the user profile (via tokenStore)
//   - silently re-authenticates on app start when a refresh token exists
//   - exposes login / register / logout / refreshUserInfo
//   - subscribes to forced-logout events (expired refresh) so the UI returns
//     to the Login screen automatically

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenStore } from '../services/tokenStore';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Startup: restore the session. If the access token is still valid we can
  // use the cached profile; otherwise we attempt a silent refresh so that a
  // cold app start does not force the user to log in again.
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const accessToken = await tokenStore.init();
        const cachedUser = tokenStore.getUser();

        if (accessToken && cachedUser) {
          if (mounted) setUserInfo(cachedUser);
          return;
        }

        // No access token — try a silent refresh with the stored refresh token.
        const refreshToken = tokenStore.getRefreshToken();
        if (refreshToken) {
          try {
            const data = await authService.refresh(refreshToken);
            if (mounted) setUserInfo(data.user);
          } catch (e) {
            // Only drop the session when the server actually rejected the
            // refresh token (401/403). A transient network error / Render
            // cold start must NOT be treated as an authentication failure —
            // keep the tokens so the next launch can retry.
            if (e?.isNormalized && (e.status === 401 || e.status === 403)) {
              await tokenStore.clear();
            }
          }
        }
      } catch (e) {
        // Corrupted storage etc. — start logged out.
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    restoreSession();

    // Forced logout when the refresh token can no longer be renewed.
    const unsubscribe = tokenStore.onSessionExpired(() => {
      setUserInfo(null);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUserInfo(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setUserInfo(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUserInfo(null);
  }, []);

  const refreshUserInfo = useCallback(async () => {
    const user = await userService.getMe();
    await tokenStore.setTokens({
      accessToken: tokenStore.getAccessToken(),
      refreshToken: tokenStore.getRefreshToken(),
      user,
    });
    setUserInfo(user);
    return user;
  }, []);

  const value = {
    userInfo,
    setUserInfo,
    logout,
    login,
    register,
    authLoading,
    refreshUserInfo,
    // Backend role authorities are e.g. ROLE_ADMIN / ROLE_USER; the user
    // response exposes plain role names ADMIN / USER.
    isAdmin: Array.isArray(userInfo?.roles) && userInfo.roles.includes('ADMIN'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
