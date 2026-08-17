// src/services/reviewService.js
import { apiClient } from './apiClient';

export async function getProductReviews(productPublicId, { page = 0, size = 10 } = {}) {
  const response = await apiClient.get(`/api/v1/products/${productPublicId}/reviews`, {
    params: { page, size },
  });
  return response.data?.data;
}

export async function createReview({ productId, rating, title, comment }) {
  const response = await apiClient.post('/api/v1/reviews', {
    productId,
    rating,
    title: title || undefined,
    comment: comment || undefined,
  });
  return response.data?.data;
}

export async function updateReview(reviewPublicId, { rating, title, comment }) {
  const response = await apiClient.put(`/api/v1/reviews/${reviewPublicId}`, {
    rating,
    title: title || undefined,
    comment: comment || undefined,
  });
  return response.data?.data;
}

export async function deleteReview(reviewPublicId) {
  const response = await apiClient.delete(`/api/v1/reviews/${reviewPublicId}`);
  return response.data?.data;
}
