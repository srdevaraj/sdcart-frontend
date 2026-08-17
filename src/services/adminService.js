// src/services/adminService.js
import { apiClient } from './apiClient';

// ----------------------------------------------------------------
// Products
// ----------------------------------------------------------------

export async function adminListProducts({ q, status, page = 0, size = 20 } = {}) {
  const response = await apiClient.get('/api/v1/admin/products', {
    params: { q, status, page, size },
  });
  return response.data?.data;
}

export async function adminGetProduct(publicId) {
  const response = await apiClient.get(`/api/v1/admin/products/${publicId}`);
  return response.data?.data;
}

export async function adminCreateProduct(payload) {
  const response = await apiClient.post('/api/v1/admin/products', payload);
  return response.data?.data;
}

export async function adminUpdateProduct(publicId, payload) {
  const response = await apiClient.put(`/api/v1/admin/products/${publicId}`, payload);
  return response.data?.data;
}

export async function adminUpdateProductStatus(publicId, status) {
  const response = await apiClient.patch(`/api/v1/admin/products/${publicId}/status`, { status });
  return response.data?.data;
}

export async function adminDeleteProduct(publicId) {
  const response = await apiClient.delete(`/api/v1/admin/products/${publicId}`);
  return response.data?.data;
}

// ----------------------------------------------------------------
// Orders
// ----------------------------------------------------------------

export async function adminListOrders({ status, page = 0, size = 20 } = {}) {
  const response = await apiClient.get('/api/v1/admin/orders', {
    params: { status, page, size },
  });
  return response.data?.data;
}

export async function adminUpdateOrderStatus(publicId, status) {
  const response = await apiClient.patch(`/api/v1/admin/orders/${publicId}/status`, { status });
  return response.data?.data;
}

// ----------------------------------------------------------------
// Users
// ----------------------------------------------------------------

export async function adminListUsers({ q, page = 0, size = 20 } = {}) {
  const response = await apiClient.get('/api/v1/admin/users', {
    params: { q, page, size },
  });
  return response.data?.data;
}

export async function adminSetUserActive(publicId, active) {
  const response = await apiClient.patch(`/api/v1/admin/users/${publicId}/status`, { active });
  return response.data?.data;
}

// ----------------------------------------------------------------
// Payments
// ----------------------------------------------------------------

export async function adminListPayments({ page = 0, size = 20 } = {}) {
  const response = await apiClient.get('/api/v1/admin/payments', {
    params: { page, size },
  });
  return response.data?.data;
}

// ----------------------------------------------------------------
// Categories & brands
// ----------------------------------------------------------------

export async function adminCreateCategory(payload) {
  const response = await apiClient.post('/api/v1/admin/categories', payload);
  return response.data?.data;
}

export async function adminUpdateCategory(publicId, payload) {
  const response = await apiClient.put(`/api/v1/admin/categories/${publicId}`, payload);
  return response.data?.data;
}

export async function adminDeleteCategory(publicId) {
  const response = await apiClient.delete(`/api/v1/admin/categories/${publicId}`);
  return response.data?.data;
}

export async function adminCreateBrand(payload) {
  const response = await apiClient.post('/api/v1/admin/brands', payload);
  return response.data?.data;
}

export async function adminUpdateBrand(publicId, payload) {
  const response = await apiClient.put(`/api/v1/admin/brands/${publicId}`, payload);
  return response.data?.data;
}

export async function adminDeleteBrand(publicId) {
  const response = await apiClient.delete(`/api/v1/admin/brands/${publicId}`);
  return response.data?.data;
}

// ----------------------------------------------------------------
// Coupons
// ----------------------------------------------------------------

export async function adminListCoupons() {
  const response = await apiClient.get('/api/v1/admin/coupons');
  return response.data?.data || [];
}

export async function adminCreateCoupon(payload) {
  const response = await apiClient.post('/api/v1/admin/coupons', payload);
  return response.data?.data;
}

export async function adminUpdateCoupon(publicId, payload) {
  const response = await apiClient.put(`/api/v1/admin/coupons/${publicId}`, payload);
  return response.data?.data;
}

export async function adminSetCouponActive(publicId, active) {
  const response = await apiClient.patch(`/api/v1/admin/coupons/${publicId}/active`, { active });
  return response.data?.data;
}
