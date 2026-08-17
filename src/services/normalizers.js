// src/services/normalizers.js
//
// Mapping layer between the backend DTOs and the shapes the UI screens
// consume. Keeps the conversion logic in one place instead of spreading it
// across screens. The backend stays authoritative; these helpers only rename
// fields and add derived conveniences.

import { primaryImage } from './productService';

/**
 * Backend ProductResponse -> the product shape used across catalog screens.
 * Adds `id` (publicId) so legacy card components keep working unchanged.
 */
export function normalizeProduct(product) {
  if (!product) return product;
  return {
    ...product,
    id: product.publicId,
    imageUrl: primaryImage(product),
    actualPrice: product.compareAtPrice,
    brand: product.brand?.name || null,
    rating: product.averageRating,
    stock: product.stockQuantity,
    categoryName: product.category?.name || 'General',
  };
}

/** PageResponse<ProductResponse> -> { content (normalized), page metadata } */
export function normalizeProductPage(page) {
  if (!page) return page;
  return {
    ...page,
    content: (page.content || []).map(normalizeProduct),
  };
}

/**
 * Backend CartItemResponse -> the cart item shape the Cart screen expects.
 * Flattens the nested product and exposes id/itemId/price/quantity.
 */
export function normalizeCartItem(item) {
  if (!item) return item;
  const product = normalizeProduct(item.product);
  return {
    ...item,
    id: item.publicId,
    productId: product?.publicId,
    name: product?.name || '',
    imageUrl: product?.imageUrl || null,
    price: item.unitPrice,
    actualPrice: product?.compareAtPrice || null,
    quantity: item.quantity,
    brand: product?.brand,
    stock: product?.stockQuantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
  };
}

/** Backend CartResponse -> the cart shape the CartContext/screen expect. */
export function normalizeCart(cart) {
  if (!cart) return cart;
  return {
    ...cart,
    items: (cart.items || []).map(normalizeCartItem),
  };
}

/**
 * Backend WishlistItemResponse -> shape with flattened product fields.
 */
export function normalizeWishlistItem(item) {
  if (!item) return item;
  const product = normalizeProduct(item.product);
  return {
    ...item,
    id: item.publicId,
    product: {
      ...product,
      id: product?.publicId,
      imageUrl: product?.imageUrl || null,
    },
  };
}

/** Backend OrderResponse -> shape with a few display conveniences. */
export function normalizeOrder(order) {
  if (!order) return order;
  return {
    ...order,
    id: order.publicId,
    items: (order.items || []).map((item) => ({
      ...item,
      id: item.publicId,
    })),
  };
}
