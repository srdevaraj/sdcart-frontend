// src/services/orderService.js
import { apiClient } from './apiClient';

/**
 * Create an order from the current cart. The backend snapshots items, applies
 * the coupon, validates stock and creates the pending payment record — the
 * frontend only supplies the shipping address id, payment method and an
 * optional coupon code.
 *
 * paymentMethod: 'CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY'
 */
export async function createOrder({ addressId, paymentMethod, couponCode }) {
  const response = await apiClient.post('/api/v1/orders', {
    addressId,
    paymentMethod,
    couponCode: couponCode || undefined,
  });
  return response.data?.data;
}

/** List the current user's orders (paginated). */
export async function getMyOrders({ page = 0, size = 10 } = {}) {
  const response = await apiClient.get('/api/v1/orders', { params: { page, size } });
  return response.data?.data;
}

export async function getOrder(publicId) {
  const response = await apiClient.get(`/api/v1/orders/${publicId}`);
  return response.data?.data;
}

export async function cancelOrder(publicId) {
  const response = await apiClient.post(`/api/v1/orders/${publicId}/cancel`);
  return response.data?.data;
}
