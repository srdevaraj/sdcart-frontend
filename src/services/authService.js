// src/services/authService.js
import { apiClient } from './apiClient';
import { tokenStore } from './tokenStore';

/**
 * Login with email + password. On success the token pair and user profile are
 * persisted in the token store.
 */
export async function login(email, password) {
  const response = await apiClient.post('/api/v1/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  const data = response.data?.data;
  await tokenStore.setTokens({
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken,
    user: data?.user,
  });
  return data;
}

/**
 * Register a new account. The backend creates the cart and wishlist for the
 * new user and returns a token pair (auto-login).
 */
export async function register({ firstName, lastName, email, password, phone }) {
  const response = await apiClient.post('/api/v1/auth/register', {
    firstName,
    lastName,
    email,
    password,
    phone: phone || undefined,
  });
  const data = response.data?.data;
  await tokenStore.setTokens({
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken,
    user: data?.user,
  });
  return data;
}

/**
 * Refresh the token pair using the stored refresh token (used by the axios
 * interceptor automatically; also exposed for the startup silent re-auth).
 */
export async function refresh(refreshToken) {
  const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
  const data = response.data?.data;
  await tokenStore.setTokens({
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken,
    user: data?.user || tokenStore.getUser(),
  });
  return data;
}

/**
 * Best-effort server-side logout: revokes the refresh token. Local state is
 * always cleared regardless of the server result.
 */
export async function logout() {
  const refreshToken = tokenStore.getRefreshToken();
  try {
    if (refreshToken) {
      await apiClient.post('/api/v1/auth/logout', { refreshToken });
    } else {
      await apiClient.post('/api/v1/auth/logout');
    }
  } catch (e) {
    // ignore — local logout still proceeds
  } finally {
    await tokenStore.clear();
  }
}
