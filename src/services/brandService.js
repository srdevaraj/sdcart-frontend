// src/services/brandService.js
import { apiClient } from './apiClient';

export async function getBrands() {
  const response = await apiClient.get('/api/v1/brands');
  return response.data?.data || [];
}

export async function getBrand(publicId) {
  const response = await apiClient.get(`/api/v1/brands/${publicId}`);
  return response.data?.data;
}
