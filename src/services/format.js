// src/services/format.js
//
// Small shared formatting helpers. Keeps currency/image/discount handling in
// one place instead of duplicating it across screens.

/** Formats a price with the INR symbol (backend prices are USD but the app
 *  has always presented prices with the ₹ symbol — kept for consistency). */
export function formatPrice(value) {
  const number = Number(value || 0);
  if (Number.isNaN(number)) return '₹0';
  return `₹${number.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

/** Primary image URL of a product (images array or legacy flat field). */
export function productImage(product) {
  if (!product) return null;
  if (Array.isArray(product.images)) {
    const primary = product.images.find((img) => img.primary);
    return (primary || product.images[0])?.imageUrl || null;
  }
  return product.imageUrl || null;
}

/** Discount percentage vs compareAtPrice (0 when there is none). */
export function discountPercent(product) {
  const price = Number(product?.price);
  const compareAt = Number(product?.compareAtPrice);
  if (!price || !compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Formats an ISO timestamp into a readable local date/time. */
export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '';
  }
}
