// src/services/categoryService.js
import { apiClient } from './apiClient';

/** List active categories (flat). */
export async function getCategories() {
  const response = await apiClient.get('/api/v1/categories');
  return response.data?.data || [];
}

/** List categories as a nested tree. */
export async function getCategoryTree() {
  const response = await apiClient.get('/api/v1/categories', {
    params: { tree: true },
  });
  return response.data?.data || [];
}

export async function getCategory(publicId) {
  const response = await apiClient.get(`/api/v1/categories/${publicId}`);
  return response.data?.data;
}
