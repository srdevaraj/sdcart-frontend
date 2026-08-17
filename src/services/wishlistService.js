// src/services/wishlistService.js
import { apiClient } from './apiClient';

/**
 * Wishlist endpoints return WishlistResponse:
 * { publicId, items: [{ publicId, product: ProductSummaryResponse, addedAt }] }
 */

export async function getWishlist() {
  const response = await apiClient.get('/api/v1/wishlist');
  return response.data?.data;
}

export async function addToWishlist(productId) {
  const response = await apiClient.post('/api/v1/wishlist/items', { productId });
  return response.data?.data;
}

export async function removeFromWishlist(productPublicId) {
  const response = await apiClient.delete(`/api/v1/wishlist/items/${productPublicId}`);
  return response.data?.data;
}
