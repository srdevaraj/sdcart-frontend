// src/screens/WishlistScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/format';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { wishlistItems, loading, reloadWishlist, removeFromWishlist } =
    useWishlist();
  const { addToCart } = useCart();

  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (isFocused) {
      reloadWishlist().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadWishlist();
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [reloadWishlist]);

  const handleRemove = async (item) => {
    const result = await removeFromWishlist(item.product?.publicId);
    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  const handleAddToCart = async (item) => {
    const product = item.product;
    if (!product?.publicId) return;

    setBusyId(item.publicId);
    const result = await addToCart(product.publicId, 1);
    setBusyId(null);

    if (!result.success) {
      Alert.alert('Unable to add', result.message);
      return;
    }

    Alert.alert('Added to cart', `${product.name} added to your cart.`);
  };

  if (loading && wishlistItems.length === 0) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.publicId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>My Wishlist</Text>
            <Text style={styles.subHeading}>
              {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const product = item.product || {};

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.92}
              onPress={() =>
                navigation.navigate('SelectedProduct', {
                  id: product.publicId,
                })
              }
            >
              <View style={styles.imageContainer}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={30} color="#CBD5E1" />
                  </View>
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name || 'Product'}
                </Text>

                <Text style={styles.price}>
                  {formatPrice(product.price)}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cartButton}
                    activeOpacity={0.85}
                    disabled={busyId === item.publicId}
                    onPress={() => handleAddToCart(item)}
                  >
                    {busyId === item.publicId ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="cart" size={16} color="#fff" />
                        <Text style={styles.cartText}>Add to Cart</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    activeOpacity={0.85}
                    onPress={() => handleRemove(item)}
                  >
                    <Ionicons name="heart-dislike-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={70} color="#CBD5E1" />
            </View>

            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>

            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any product to save it here.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopButtonText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 18,
    paddingBottom: 16,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101828',
  },

  subHeading: {
    marginTop: 4,
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  image: {
    width: '92%',
    height: '92%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
    lineHeight: 21,
  },

  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  cartButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  cartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 22,
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },

  emptySubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
  },

  shopButton: {
    marginTop: 26,
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },

  shopButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
