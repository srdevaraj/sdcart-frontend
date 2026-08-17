// src/services/cartService.js
import { apiClient } from './apiClient';

/**
 * Cart endpoints return the full CartResponse:
 * { publicId, items: [{ publicId, product: { publicId, name, slug, price,
 *   imageUrl, stockQuantity }, quantity, unitPrice, subtotal }],
 *   totalQuantity, totalAmount, createdAt, updatedAt }
 */

export async function getCart() {
  const response = await apiClient.get('/api/v1/cart');
  return response.data?.data;
}

export async function addToCart(productId, quantity = 1) {
  const response = await apiClient.post('/api/v1/cart/items', { productId, quantity });
  return response.data?.data;
}

export async function updateCartItem(itemPublicId, quantity) {
  const response = await apiClient.put(`/api/v1/cart/items/${itemPublicId}`, { quantity });
  return response.data?.data;
}

export async function removeCartItem(itemPublicId) {
  const response = await apiClient.delete(`/api/v1/cart/items/${itemPublicId}`);
  return response.data?.data;
}

export async function clearCart() {
  const response = await apiClient.delete('/api/v1/cart');
  return response.data?.data;
}
