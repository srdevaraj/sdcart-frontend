// src/services/userService.js
import { apiClient } from './apiClient';
import { tokenStore } from './tokenStore';

export async function getMe() {
  const response = await apiClient.get('/api/v1/users/me');
  return response.data?.data;
}

export async function updateProfile({ firstName, lastName, phone }) {
  const response = await apiClient.put('/api/v1/users/me', {
    firstName,
    lastName,
    phone: phone || undefined,
  });
  const user = response.data?.data;
  // Keep the cached profile in sync with the server.
  await tokenStore.setTokens({
    accessToken: tokenStore.getAccessToken(),
    refreshToken: tokenStore.getRefreshToken(),
    user,
  });
  return user;
}

export async function changePassword(currentPassword, newPassword) {
  const response = await apiClient.put('/api/v1/users/me/password', {
    currentPassword,
    newPassword,
  });
  return response.data?.data;
}
