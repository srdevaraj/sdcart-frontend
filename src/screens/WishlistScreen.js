// src/screens/WishlistScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/format';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, typography, radius, shadows, isDark } = useTheme();

  const { wishlistItems, loading, reloadWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (isFocused) {
      reloadWishlist().catch(() => {});
    }
  }, [isFocused, reloadWishlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadWishlist();
    } finally {
      setRefreshing(false);
    }
  }, [reloadWishlist]);

  const handleRemove = async (productPublicId) => {
    if (!productPublicId) return;
    const result = await removeFromWishlist(productPublicId);
    if (result?.success) {
      showSuccess('Item removed from wishlist');
    } else {
      showError(result?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (item) => {
    const product = item.product;
    const productId = product?.publicId || product?.id;
    if (!productId) return;

    setBusyId(item.publicId || productId);
    try {
      const result = await addToCart(productId, 1);
      if (result?.success) {
        showSuccess(`${product.name || 'Product'} added to cart`);
      } else {
        showError(result?.message || 'Unable to add to cart');
      }
    } catch (e) {
      showError('Unable to add to cart');
    } finally {
      setBusyId(null);
    }
  };

  const renderWishlistItem = useCallback(
    ({ item }) => {
      const product = item.product || {};
      const productId = product.publicId || product.id;
      const isBusy = busyId === (item.publicId || productId);

      return (
        <AnimatedPressable
          onPress={() => {
            if (productId) {
              navigation.navigate('SelectedProduct', { id: productId });
            }
          }}
          scaleTo={0.98}
          haptic="selection"
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          <View style={[styles.imageWrap, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg }]}>
            <AppImage source={product.imageUrl} style={styles.image} contentFit="contain" />
          </View>

          <View style={styles.info}>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontWeight: typography.weights.bold },
              ]}
              numberOfLines={2}
            >
              {product.name || 'Product'}
            </Text>

            <Text
              style={[
                styles.price,
                { color: colors.primary, fontWeight: typography.weights.black },
              ]}
            >
              {formatPrice(product.price)}
            </Text>

            <View style={styles.actionsRow}>
              <AnimatedPressable
                onPress={() => handleAddToCart(item)}
                disabled={isBusy}
                scaleTo={0.92}
                haptic="medium"
                style={[
                  styles.addCartBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.addCartText}>Add to Cart</Text>
                  </>
                )}
              </AnimatedPressable>

              <AnimatedPressable
                onPress={() => handleRemove(productId)}
                scaleTo={0.88}
                haptic="light"
                style={[
                  styles.removeBtn,
                  {
                    backgroundColor: colors.dangerMuted,
                    borderRadius: radius.md,
                  },
                ]}
                accessibilityLabel="Remove from wishlist"
              >
                <Ionicons name="heart-dislike" size={18} color={colors.danger} />
              </AnimatedPressable>
            </View>
          </View>
        </AnimatedPressable>
      );
    },
    [busyId, colors, typography, radius, shadows, navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="My Wishlist"
        subtitle={`${wishlistItems.length} saved items`}
        showBack
      />

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => String(item.publicId || item.id || Math.random())}
        renderItem={renderWishlistItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontWeight: typography.weights.extrabold },
                ]}
              >
                Your Wishlist is Empty
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Save items you love by tapping the heart icon on any product.
              </Text>
              <AnimatedPressable
                onPress={() => navigation.navigate('Products')}
                scaleTo={0.95}
                style={[
                  styles.shopBtn,
                  { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
                haptic="selection"
              >
                <Text style={styles.shopBtnText}>Explore Products</Text>
              </AnimatedPressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  imageWrap: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '88%',
    height: '88%',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
  },
  price: {
    fontSize: 16,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addCartBtn: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
