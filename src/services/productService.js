// src/services/productService.js
import { apiClient } from './apiClient';

/**
 * List products (public catalog). Supports the backend filter surface:
 * category slug, brand slug, free-text query, price range, stock and featured.
 *
 * Returns the PageResponse payload: { content, page, size, totalElements, ... }
 */
export async function getProducts({
  category,
  brand,
  q,
  minPrice,
  maxPrice,
  inStock,
  featured,
  page = 0,
  size = 20,
  sort,
  signal,
} = {}) {
  const params = {
    page,
    size,
  };
  if (category) params.category = category;
  if (brand) params.brand = brand;
  if (q) params.q = q;
  if (minPrice != null) params.minPrice = minPrice;
  if (maxPrice != null) params.maxPrice = maxPrice;
  if (inStock != null) params.inStock = inStock;
  if (featured != null) params.featured = featured;
  if (sort) params.sort = sort;

  const response = await apiClient.get('/api/v1/products', { params, signal });
  return response.data?.data;
}

/**
 * Fetch full product details by public id.
 */
export async function getProductById(publicId) {
  const response = await apiClient.get(`/api/v1/products/${publicId}`);
  return response.data?.data;
}

/**
 * Convenience: primary image URL of a product response, or null.
 */
export function primaryImage(product) {
  if (!product) return null;
  if (Array.isArray(product.images)) {
    const primary = product.images.find((img) => img.primary);
    return (primary || product.images[0])?.imageUrl || null;
  }
  return product.imageUrl || null;
}
