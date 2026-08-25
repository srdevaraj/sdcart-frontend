// src/screens/SelectedProduct.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProductById } from '../services/productService';
import { normalizeProduct } from '../services/normalizers';
import { discountPercent, formatPrice, productImage } from '../services/format';
import { useCart } from '../context/CartContext';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { WishlistButton } from '../components/common/WishlistButton';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ShimmerLoader } from '../components/common/ShimmerLoader';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SelectedProduct({ route, navigation }) {
  const { id } = route.params || {};
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(normalizeProduct(data));
    } catch (e) {
      showError('Unable to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product?.id) {
      showError('Product information missing.');
      return;
    }

    try {
      setAdding(true);
      const result = await addToCart(product.id, 1);
      if (result?.success) {
        showSuccess(`${product.name || 'Product'} added to cart`);
      } else {
        showError(result?.message || 'Failed to add product to cart');
      }
    } catch (err) {
      showError('Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?.id) return;

    try {
      setBuying(true);
      const result = await addToCart(product.id, 1);
      if (result?.success) {
        navigation.navigate('DeliveryAddress', { selectMode: true });
      } else {
        showError(result?.message || 'Unable to proceed with Buy Now');
      }
    } catch (err) {
      showError('Unable to proceed to checkout');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ScreenHeader title="Product Details" showBack />
        <ScrollView style={{ padding: 16 }}>
          <ShimmerLoader height={320} borderRadius={radius['2xl']} />
          <View style={{ marginTop: 20 }}>
            <ShimmerLoader width="40%" height={16} borderRadius={radius.xs} />
            <ShimmerLoader width="85%" height={24} borderRadius={radius.xs} style={{ marginTop: 8 }} />
            <ShimmerLoader width="50%" height={28} borderRadius={radius.xs} style={{ marginTop: 12 }} />
            <ShimmerLoader width="100%" height={120} borderRadius={radius.xl} style={{ marginTop: 20 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Product Details" showBack />
        <View style={styles.notFoundCenter}>
          <Ionicons name="cube-outline" size={72} color={colors.textMuted} />
          <Text style={[styles.notFoundTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Product Not Found
          </Text>
          <AnimatedPressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const discount = discountPercent(product);
  const imgUrl = productImage(product);
  const inStock = (product.stock ?? 1) > 0;
  const ratingValue = product.rating ?? product.averageRating ?? 4.5;
  const reviewsCount = product.reviewCount ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title={product.brand || 'sdCart'}
        subtitle={product.categoryName || 'Catalog'}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= HERO IMAGE SHOWCASE ================= */}
        <View
          style={[
            styles.heroImageCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <AppImage
            source={imgUrl}
            style={styles.heroImage}
            contentFit="contain"
            priority="high"
          />

          {discount > 0 && (
            <View style={[styles.discountTag, { backgroundColor: colors.accent, borderRadius: radius.sm }]}>
              <Text style={[styles.discountTagText, { fontWeight: typography.weights.black }]}>
                {discount}% OFF
              </Text>
            </View>
          )}

          <View style={styles.wishlistPos}>
            <WishlistButton productId={product.id} size={22} containerSize={42} />
          </View>
        </View>

        {/* ================= PRODUCT INFO & PRICE ================= */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius['2xl'],
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[styles.brandText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
            {product.brand || 'sdCart Original'}
          </Text>

          <Text style={[styles.productTitle, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
            {product.name}
          </Text>

          {/* Ratings & Stock Row */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: '#FEF3C7', borderRadius: radius.sm },
              ]}
            >
              <Ionicons name="star" size={14} color="#D97706" />
              <Text style={styles.ratingBadgeText}>{Number(ratingValue).toFixed(1)}</Text>
              {reviewsCount > 0 && (
                <Text style={styles.reviewsCountText}>({reviewsCount} reviews)</Text>
              )}
            </View>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor: inStock ? colors.successMuted : colors.dangerMuted,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Ionicons
                name={inStock ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={inStock ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.stockText,
                  {
                    color: inStock ? colors.success : colors.danger,
                    fontWeight: typography.weights.bold,
                  },
                ]}
              >
                {inStock ? `In Stock (${product.stock ?? 'Available'})` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Price details */}
          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: colors.text, fontWeight: typography.weights.black }]}>
              {formatPrice(product.price)}
            </Text>

            {product.actualPrice || product.compareAtPrice ? (
              <Text style={[styles.oldPrice, { color: colors.textMuted }]}>
                {formatPrice(product.actualPrice || product.compareAtPrice)}
              </Text>
            ) : null}

            {discount > 0 && (
              <View style={[styles.savingsPill, { backgroundColor: colors.accentMuted, borderRadius: radius.full }]}>
                <Text style={[styles.savingsText, { color: colors.accent, fontWeight: typography.weights.bold }]}>
                  Save {discount}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ================= ASSURANCE / DELIVERY PERKS ================= */}
        <View
          style={[
            styles.perksCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.perkItem}>
            <View style={[styles.perkIconWrap, { backgroundColor: colors.primaryMuted }]}>
              <MaterialCommunityIcons name="truck-fast-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.perkTextWrap}>
              <Text style={[styles.perkTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
                Free Express Delivery
              </Text>
              <Text style={[styles.perkSubtitle, { color: colors.textSecondary }]}>
                Estimated 2–4 business days
              </Text>
            </View>
          </View>

          <View style={[styles.perkDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.perkItem}>
            <View style={[styles.perkIconWrap, { backgroundColor: colors.successMuted }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.success} />
            </View>
            <View style={styles.perkTextWrap}>
              <Text style={[styles.perkTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
                100% Authentic Product
              </Text>
              <Text style={[styles.perkSubtitle, { color: colors.textSecondary }]}>
                Direct from verified sellers
              </Text>
            </View>
          </View>

          <View style={[styles.perkDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.perkItem}>
            <View style={[styles.perkIconWrap, { backgroundColor: colors.accentMuted }]}>
              <MaterialCommunityIcons name="backup-restore" size={22} color={colors.accent} />
            </View>
            <View style={styles.perkTextWrap}>
              <Text style={[styles.perkTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
                7 Days Easy Replacement
              </Text>
              <Text style={[styles.perkSubtitle, { color: colors.textSecondary }]}>
                Hassle-free return policy
              </Text>
            </View>
          </View>
        </View>

        {/* ================= DESCRIPTION ================= */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardHeading, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Product Description
            </Text>
          </View>

          <Text
            style={[styles.descriptionText, { color: colors.textSecondary }]}
            numberOfLines={readMore ? undefined : 4}
          >
            {product.description || 'No detailed description available for this item.'}
          </Text>

          {product.description && product.description.length > 180 && (
            <AnimatedPressable
              onPress={() => setReadMore(!readMore)}
              style={styles.readMoreBtn}
              scaleTo={0.97}
            >
              <Text style={[styles.readMoreText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                {readMore ? 'Show Less ↑' : 'Read Full Description ↓'}
              </Text>
            </AnimatedPressable>
          )}
        </View>

        {/* ================= SPECIFICATIONS ================= */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardHeading, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Specifications
            </Text>
          </View>

          <View style={styles.specTable}>
            <View style={styles.specRow}>
              <Text style={[styles.specKey, { color: colors.textMuted }]}>Category</Text>
              <Text style={[styles.specVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                {product.categoryName || 'General'}
              </Text>
            </View>

            <View style={[styles.specDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.specRow}>
              <Text style={[styles.specKey, { color: colors.textMuted }]}>Brand</Text>
              <Text style={[styles.specVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                {product.brand || 'sdCart'}
              </Text>
            </View>

            {(product.specifications || []).map((spec, i) => (
              <React.Fragment key={i}>
                <View style={[styles.specDivider, { backgroundColor: colors.borderLight }]} />
                <View style={styles.specRow}>
                  <Text style={[styles.specKey, { color: colors.textMuted }]}>{spec.name}</Text>
                  <Text style={[styles.specVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                    {spec.value}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ================= STICKY BOTTOM ACTION BAR ================= */}
      <View
        style={[
          styles.stickyBottom,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12),
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            ...shadows.lg,
          },
        ]}
      >
        <AnimatedPressable
          onPress={handleAddToCart}
          disabled={adding}
          scaleTo={0.95}
          haptic="medium"
          style={[
            styles.cartActionBtn,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : '#EFF6FF',
              borderColor: colors.primary,
              borderRadius: radius.xl,
            },
          ]}
        >
          {adding ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
              <Text style={[styles.cartActionText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                Add to Cart
              </Text>
            </>
          )}
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleBuyNow}
          disabled={buying}
          scaleTo={0.95}
          haptic="heavy"
          style={[
            styles.buyActionBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.xl,
              ...shadows.md,
            },
          ]}
        >
          {buying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={[styles.buyActionText, { fontWeight: typography.weights.extrabold }]}>
                Buy Now
              </Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImageCard: {
    width: SCREEN_WIDTH,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
  },
  heroImage: {
    width: '90%',
    height: '90%',
  },
  discountTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountTagText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  wishlistPos: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: -20,
    padding: 18,
    borderWidth: 1,
  },
  brandText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  ratingBadgeText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsCountText: {
    color: '#92400E',
    fontSize: 11,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  stockText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 16,
  },
  currentPrice: {
    fontSize: 28,
  },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savingsText: {
    fontSize: 12,
  },
  perksCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkTextWrap: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 14,
  },
  perkSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  perkDivider: {
    height: 1,
    marginVertical: 12,
    marginLeft: 54,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 10,
  },
  readMoreText: {
    fontSize: 13,
  },
  specTable: {
    marginTop: 4,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  specKey: {
    fontSize: 13,
  },
  specVal: {
    fontSize: 13,
    maxWidth: '60%',
    textAlign: 'right',
  },
  specDivider: {
    height: 1,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  cartActionBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  cartActionText: {
    fontSize: 15,
  },
  buyActionBtn: {
    flex: 1.2,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyActionText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  notFoundCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});