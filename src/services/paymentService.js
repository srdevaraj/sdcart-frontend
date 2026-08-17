// src/services/paymentService.js
import { apiClient } from './apiClient';

/**
 * Process payment for a pending order. The backend owns payment verification
 * and idempotency (already-paid orders are rejected with 409); the frontend
 * never decides payment success on its own.
 */
export async function payOrder(orderPublicId) {
  const response = await apiClient.post(`/api/v1/payments/orders/${orderPublicId}/pay`);
  return response.data?.data;
}
