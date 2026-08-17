// src/services/couponService.js
import { apiClient } from './apiClient';

/**
 * Validate a coupon code against an order amount. The backend enforces all
 * coupon rules (type, min order, usage limits, per-user limit).
 *
 * Returns CouponValidationResponse:
 * { valid, code, type: 'PERCENTAGE' | 'FIXED', discountAmount, message }
 */
export async function validateCoupon(code, orderAmount) {
  const response = await apiClient.post('/api/v1/coupons/validate', {
    code,
    orderAmount,
  });
  return response.data?.data;
}
