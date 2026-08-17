// src/services/tokenStore.js
//
// Single source of truth for the JWT access/refresh tokens and the cached
// user profile. Backed by AsyncStorage for persistence across app restarts,
// with a small in-memory cache so the axios interceptor can read the access
// token synchronously without awaiting storage on every request.

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'userProfile';

let cachedAccessToken = null;
let cachedRefreshToken = null;
let cachedUser = null;

// Listeners notified when the session is terminated (expired refresh token,
// forced logout). AuthContext subscribes to force navigation to Login.
const sessionExpiredListeners = new Set();

export const tokenStore = {
  async init() {
    const [access, refresh, user] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    cachedAccessToken = access && access !== 'null' && access !== 'undefined' ? access : null;
    cachedRefreshToken = refresh && refresh !== 'null' && refresh !== 'undefined' ? refresh : null;
    cachedUser = user ? JSON.parse(user) : null;
    return cachedAccessToken;
  },

  getAccessToken() {
    return cachedAccessToken;
  },

  getRefreshToken() {
    return cachedRefreshToken;
  },

  getUser() {
    return cachedUser;
  },

  async setTokens({ accessToken, refreshToken, user }) {
    cachedAccessToken = accessToken || null;
    cachedRefreshToken = refreshToken || null;
    cachedUser = user || null;
    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, cachedAccessToken || ''),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, cachedRefreshToken || ''),
      AsyncStorage.setItem(USER_KEY, cachedUser ? JSON.stringify(cachedUser) : ''),
    ]);
  },

  async clear() {
    cachedAccessToken = null;
    cachedRefreshToken = null;
    cachedUser = null;
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },

  /** AuthContext / navigation hooks can subscribe to forced-logout events. */
  onSessionExpired(listener) {
    sessionExpiredListeners.add(listener);
    return () => sessionExpiredListeners.delete(listener);
  },

  notifySessionExpired() {
    sessionExpiredListeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        // never let a listener break the logout path
      }
    });
  },
};

export { ACCESS_TOKEN_KEY };
