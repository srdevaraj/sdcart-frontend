// src/services/addressService.js
import { apiClient } from './apiClient';

/**
 * Addresses use the backend model:
 * { publicId, label, recipientName, phone, line1, line2, city, state,
 *   postalCode, country, isDefault }
 */

export async function getAddresses() {
  const response = await apiClient.get('/api/v1/addresses');
  return response.data?.data || [];
}

export async function createAddress(address) {
  const response = await apiClient.post('/api/v1/addresses', address);
  return response.data?.data;
}

export async function updateAddress(publicId, address) {
  const response = await apiClient.put(`/api/v1/addresses/${publicId}`, address);
  return response.data?.data;
}

export async function deleteAddress(publicId) {
  const response = await apiClient.delete(`/api/v1/addresses/${publicId}`);
  return response.data?.data;
}

export async function setDefaultAddress(publicId) {
  const response = await apiClient.put(`/api/v1/addresses/${publicId}/default`);
  return response.data?.data;
}
