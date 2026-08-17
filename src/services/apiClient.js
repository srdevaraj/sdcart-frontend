// src/services/apiClient.js
//
// Shared axios instance used by every service.
//
// Responsibilities:
//   - attach the JWT access token to every request
//   - transparently refresh the access token once when a request fails with
//     401 and retry the original request
//   - normalize backend errors into user-friendly messages
//   - notify the app when the session can no longer be refreshed (logout)

import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { tokenStore } from './tokenStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Generous timeout: the Render free instance can take a while to wake up
  // from a cold start before the first request completes.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ----------------------------------------------------------------
// Token refresh
// ----------------------------------------------------------------

let refreshPromise = null;

/**
 * Calls POST /api/v1/auth/refresh with the stored refresh token, rotates the
 * token pair and caches it. Only one refresh runs at a time — concurrent 401s
 * share the same in-flight request.
 */
async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
      { timeout: 30000 }
    );

    const data = response.data?.data;
    if (!data?.accessToken || !data?.refreshToken) {
      throw new Error('Invalid token response');
    }

    await tokenStore.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user || tokenStore.getUser(),
    });

    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ----------------------------------------------------------------
// Request interceptor — attach Bearer token
// ----------------------------------------------------------------

apiClient.interceptors.request.use(async (config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------
// Response interceptor — refresh on 401 and retry once
// ----------------------------------------------------------------

let retried = false;

apiClient.interceptors.response.use(
  (response) => {
    retried = false;
    return response;
  },
  async (error) => {
    // Pass request cancellations through untouched so callers can detect them.
    if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const original = error.config;

    // Render cold start / flaky network: retry idempotent GET requests once
    // when the server never responded (timeout or connection failure). Never
    // retry mutations — they must not run twice.
    const isNetworkError =
      !error.response &&
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.code);
    if (
      isNetworkError &&
      original &&
      original.method === 'get' &&
      !original._networkRetried
    ) {
      original._networkRetried = true;
      return apiClient(original);
    }

    // Only attempt a refresh for 401s that carry an Authorization header and
    // were not themselves the refresh call.
    const isAuthError =
      error.response?.status === 401 &&
      original &&
      original.headers?.Authorization &&
      !original.url?.includes('/auth/refresh');

    if (isAuthError && !retried) {
      retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        retried = false;
        await tokenStore.clear();
        tokenStore.notifySessionExpired();
        return Promise.reject(normalizeError(error));
      }
    }

    retried = false;
    return Promise.reject(normalizeError(error));
  }
);

// ----------------------------------------------------------------
// Error normalization
// ----------------------------------------------------------------

/**
 * Converts any axios error into a plain Error with a user-friendly message.
 * Backend ErrorResponse bodies expose `message` (and optional field errors);
 * stack traces and internal details are never shown to users.
 */
export function normalizeError(error) {
  if (error.isNormalized) {
    return error;
  }

  const status = error.response?.status;
  const body = error.response?.data;

  let message = 'Something went wrong. Please try again.';

  if (error.code === 'ECONNABORTED') {
    message =
      'The server is taking longer than expected to respond (it may be starting up). Please try again in a moment.';
  } else if (!error.response) {
    message =
      'Unable to reach the server. Please check your internet connection and try again.';
  } else if (status === 401) {
    message = 'Your session has expired. Please login again.';
  } else if (status === 403) {
    message = 'You do not have permission to perform this action.';
  } else if (status === 404) {
    message = body?.message || 'The requested resource was not found.';
  } else if (status === 409) {
    message = body?.message || 'The operation conflicts with existing data.';
  } else if (status === 429) {
    message = 'Too many attempts. Please wait a moment and try again.';
  } else if (body?.message) {
    message = body.message;
  } else if (status >= 500) {
    message = 'A server error occurred. Please try again later.';
  }

  const normalized = new Error(message);
  normalized.isNormalized = true;
  normalized.status = status;
  normalized.fieldErrors = body?.errors || [];
  return normalized;
}

/** Extracts the user-friendly message from a normalized error. */
export function getErrorMessage(error) {
  if (error && error.isNormalized) {
    return error.message;
  }
  return error?.message || 'Something went wrong. Please try again.';
}
