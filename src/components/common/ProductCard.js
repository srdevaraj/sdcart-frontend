// src/components/common/ProductCard.js
import React, { useState, memo, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../theme';
import { AppImage } from './AppImage';
import { WishlistButton } from './WishlistButton';
import { AnimatedPressable } from './AnimatedPressable';
import { formatPrice, discountPercent, productImage } from '../../services/format';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const ProductCard = memo(({
  product,
  cardWidth,
  style,
  onPress,
}) => {
  const navigation = useNavigation();
  const { colors, typography, radius, shadows, layout } = useTheme();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const [adding, setAdding] = useState(false);

  const effectiveWidth = cardWidth || layout.cardWidth;
  const discount = discountPercent(product);
  const imgUrl = productImage(product);
  const productId = product?.id || product?.publicId;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(product);
    } else if (productId) {
      navigation.navigate('SelectedProduct', { id: productId });
    }
  }, [product, productId, onPress, navigation]);

  const handleAddToCart = async (e) => {
    e?.stopPropagation?.();
    if (adding || !productId) return;
    setAdding(true);

    try {
      const result = await addToCart(productId, 1);
      if (result?.success) {
        showSuccess(`${product?.name || 'Product'} added to cart`);
      } else {
        showError(result?.message || 'Failed to add to cart');
      }
    } catch (err) {
      showError('Unable to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const ratingValue = product?.rating ?? product?.averageRating ?? 4.5;
  const reviewsCount = product?.reviewCount ?? product?.numReviews ?? 0;

  return (
    <AnimatedPressable
      onPress={handlePress}
      scaleTo={0.97}
      haptic="selection"
      style={[
        styles.card,
        {
          width: effectiveWidth,
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {/* Image Container */}
      <View
        style={[
          styles.imageContainer,
          {
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceSubtle,
          },
        ]}
      >
        <AppImage
          source={imgUrl}
          style={styles.image}
          contentFit="contain"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <View
            style={[
              styles.discountBadge,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.discountText,
                { color: colors.textInverse, fontWeight: typography.weights.extrabold },
              ]}
            >
              {discount}% OFF
            </Text>
          </View>
        )}

        {/* Wishlist Button */}
        <View style={styles.wishlistWrapper}>
          <WishlistButton productId={productId} size={18} containerSize={32} />
        </View>
      </View>

      {/* Product Information */}
      <View style={styles.details}>
        {/* Brand / Category */}
        <Text
          style={[
            styles.brand,
            { color: colors.textMuted, fontWeight: typography.weights.medium },
          ]}
          numberOfLines={1}
        >
          {product?.brand || product?.categoryName || 'sdCart'}
        </Text>

        {/* Product Title */}
        <Text
          style={[
            styles.title,
            { color: colors.text, fontWeight: typography.weights.bold },
          ]}
          numberOfLines={2}
        >
          {product?.name || 'Product Name'}
        </Text>

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#FBBF24" />
          <Text
            style={[
              styles.ratingText,
              { color: colors.text, fontWeight: typography.weights.bold },
            ]}
          >
            {Number(ratingValue).toFixed(1)}
          </Text>
          {reviewsCount > 0 && (
            <Text style={[styles.reviewText, { color: colors.textMuted }]}>
              ({reviewsCount})
            </Text>
          )}
        </View>

        {/* Price & Add to Cart Action */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.price,
                { color: colors.primary, fontWeight: typography.weights.black },
              ]}
            >
              {formatPrice(product?.price)}
            </Text>
            {product?.compareAtPrice || product?.actualPrice ? (
              <Text
                style={[
                  styles.originalPrice,
                  { color: colors.textMuted },
                ]}
              >
                {formatPrice(product?.compareAtPrice || product?.actualPrice)}
              </Text>
            ) : null}
          </View>

          <AnimatedPressable
            onPress={handleAddToCart}
            disabled={adding}
            scaleTo={0.88}
            haptic="medium"
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                ...shadows.xs,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add to cart"
          >
            {adding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="cart-outline" size={17} color="#FFFFFF" />
            )}
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '88%',
    height: '88%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  discountText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  wishlistWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  details: {
    paddingTop: 10,
  },
  brand: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 15,
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
