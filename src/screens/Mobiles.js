import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { addToCartAPI } from '../../src/api/cartApi';
import clogo from '../../assets/clogo.png';

const BASE_URL = 'https://sdcart-backend-1.onrender.com';

const PAGE_SIZE = 20;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export default function Mobiles({ navigation }) {
  const CATEGORY_NAME = 'Mobile';

  const { width } = useWindowDimensions();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  const [error, setError] = useState(null);

  const [addingToCartId, setAddingToCartId] = useState(null);

  // ----------------------------------------------------------
  // Responsive image width
  // ----------------------------------------------------------

  const imageWidth =
    width < 360
      ? 125
      : width < 400
      ? 140
      : 155;

  // ----------------------------------------------------------
  // Fetch products
  // ----------------------------------------------------------

  const fetchProducts = useCallback(
    async (pageNumber = 0, isRefresh = false) => {
      try {
        setError(null);

        if (pageNumber === 0 && !isRefresh) {
          setLoading(true);
        }

        if (pageNumber > 0) {
          setLoadingMore(true);
        }

        const response = await api.get(
          `/products/category/${CATEGORY_NAME}`,
          {
            params: {
              page: pageNumber,
              size: PAGE_SIZE,
            },
          }
        );

        const data = response?.data;

        const newProducts = Array.isArray(data?.content)
          ? data.content
          : [];

        // ----------------------------------------------------
        // First page
        // ----------------------------------------------------

        if (pageNumber === 0) {
          setProducts(newProducts);
        }

        // ----------------------------------------------------
        // Next pages
        // ----------------------------------------------------

        else {
          setProducts(previousProducts => {
            const existingIds = new Set(
              previousProducts.map(product => product.id)
            );

            const uniqueProducts = newProducts.filter(
              product => !existingIds.has(product.id)
            );

            return [
              ...previousProducts,
              ...uniqueProducts,
            ];
          });
        }

        setPage(
          typeof data?.page === 'number'
            ? data.page
            : pageNumber
        );

        setLast(Boolean(data?.last));
      } catch (err) {
        console.log(
          'Mobile products error:',
          err?.response?.data || err?.message
        );

        const message =
          err?.response?.data?.message ||
          'Unable to load mobile products. Please try again.';

        setError(message);

        if (pageNumber === 0) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // ----------------------------------------------------------
  // Initial load
  // ----------------------------------------------------------

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  // ----------------------------------------------------------
  // Refresh
  // ----------------------------------------------------------

  const handleRefresh = useCallback(() => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setLast(false);

    fetchProducts(0, true);
  }, [fetchProducts, refreshing]);

  // ----------------------------------------------------------
  // Load more
  // ----------------------------------------------------------

  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      refreshing ||
      last
    ) {
      return;
    }

    fetchProducts(page + 1);
  }, [
    fetchProducts,
    loading,
    loadingMore,
    refreshing,
    last,
    page,
  ]);

  // ----------------------------------------------------------
  // Retry
  // ----------------------------------------------------------

  const handleRetry = useCallback(() => {
    setLast(false);
    fetchProducts(0);
  }, [fetchProducts]);

  // ----------------------------------------------------------
  // Product image
  // ----------------------------------------------------------

  const getProductImage = product => {
    if (
      product?.imageUrl &&
      typeof product.imageUrl === 'string' &&
      product.imageUrl.trim().length > 0
    ) {
      return {
        uri: product.imageUrl,
      };
    }

    return clogo;
  };

  // ----------------------------------------------------------
  // Rating
  // ----------------------------------------------------------

  const getRating = product => {
    const rating =
      product?.rating ??
      product?.averageRating ??
      product?.reviewRating;

    if (
      typeof rating === 'number' &&
      rating >= 0 &&
      rating <= 5
    ) {
      return rating.toFixed(1);
    }

    return null;
  };

  // ----------------------------------------------------------
  // Price
  // ----------------------------------------------------------

  const getFormattedPrice = price => {
    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      return '0';
    }

    return numericPrice.toLocaleString('en-IN');
  };

  // ----------------------------------------------------------
  // Add to cart
  // ----------------------------------------------------------

  const handleAddToCart = useCallback(
    async product => {
      if (!product?.id) {
        Alert.alert(
          'Unable to add',
          'This product is not available right now.'
        );
        return;
      }

      if (addingToCartId !== null) {
        return;
      }

      try {
        setAddingToCartId(product.id);

        await addToCartAPI(product.id, 1);

        Alert.alert(
          'Added to cart',
          `${product.name || 'Product'} has been added to your cart.`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('Cart'),
            },
          ]
        );
      } catch (err) {
        console.log(
          'Add to cart error:',
          err?.response?.data || err?.message
        );

        Alert.alert(
          'Could not add product',
          err?.response?.data?.message ||
            err?.message ||
            'Something went wrong. Please try again.'
        );
      } finally {
        setAddingToCartId(null);
      }
    },
    [addingToCartId, navigation]
  );

  // ----------------------------------------------------------
  // Open product
  // ----------------------------------------------------------

  const openProduct = useCallback(
    product => {
      if (!product?.id) {
        return;
      }

      navigation.navigate('SelectedProduct', {
        id: product.id,
      });
    },
    [navigation]
  );

  // ----------------------------------------------------------
  // Product card
  // ----------------------------------------------------------

  const renderProduct = ({ item }) => {
    const isAdding = addingToCartId === item.id;

    const rating = getRating(item);

    const formattedPrice = getFormattedPrice(
      item.price
    );

    return (
      <View style={styles.productCard}>

        {/* ==================================================
            PRODUCT CONTENT
        ================================================== */}

        <View style={styles.productRow}>

          {/* =================================================
              LEFT IMAGE
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.imageContainer,
              {
                width: imageWidth,
              },
            ]}
            activeOpacity={0.9}
            onPress={() => openProduct(item)}
            accessibilityRole="button"
            accessibilityLabel={`View ${
              item.name || 'mobile'
            }`}
          >

            {/* Wishlist */}

            <TouchableOpacity
              style={styles.wishlistButton}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  'Wishlist',
                  'Wishlist feature will be available soon.'
                );
              }}
              accessibilityRole="button"
              accessibilityLabel="Add to wishlist"
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color="#475569"
              />
            </TouchableOpacity>

            {/* Product image */}

            <Image
              source={getProductImage(item)}
              style={styles.productImage}
              resizeMode="contain"
            />

          </TouchableOpacity>

          {/* =================================================
              RIGHT INFORMATION
          ================================================= */}

          <TouchableOpacity
            style={styles.productInfo}
            activeOpacity={0.9}
            onPress={() => openProduct(item)}
          >

            {/* Product name */}

            <Text
              style={styles.productName}
              numberOfLines={3}
            >
              {item.name || 'Unnamed Mobile'}
            </Text>

            {/* Rating */}

            {rating ? (
              <View style={styles.ratingRow}>

                <View style={styles.ratingBadge}>

                  <Text style={styles.ratingText}>
                    {rating}
                  </Text>

                  <Ionicons
                    name="star"
                    size={11}
                    color="#FFFFFF"
                  />

                </View>

                <Text style={styles.ratingCount}>
                  Customer ratings
                </Text>

              </View>
            ) : (
              <Text style={styles.noRatingText}>
                No ratings yet
              </Text>
            )}

            {/* Price */}

            <Text style={styles.price}>
              ₹{formattedPrice}
            </Text>

            {/* Offer */}

            <View style={styles.infoRow}>

              <Ionicons
                name="pricetag-outline"
                size={15}
                color="#15803D"
              />

              <Text
                style={styles.offerText}
                numberOfLines={1}
              >
                Special offer available
              </Text>

            </View>

            {/* Delivery */}

            <View style={styles.infoRow}>

              <Ionicons
                name="location-outline"
                size={15}
                color="#64748B"
              />

              <Text
                style={styles.deliveryText}
                numberOfLines={1}
              >
                Free delivery available
              </Text>

            </View>

            {/* Assured */}

            <View style={styles.infoRow}>

              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#2874F0"
              />

              <Text style={styles.assuredText}>
                sdCart Assured
              </Text>

            </View>

          </TouchableOpacity>

        </View>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <View style={styles.actionRow}>

          {/* View Details */}

          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.8}
            onPress={() => openProduct(item)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${
              item.name || 'mobile'
            }`}
          >

            <Ionicons
              name="eye-outline"
              size={17}
              color="#2874F0"
            />

            <Text style={styles.viewButtonText}>
              View Details
            </Text>

          </TouchableOpacity>

          {/* Add to cart */}

          <TouchableOpacity
            style={[
              styles.cartButton,
              isAdding &&
                styles.cartButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={() => handleAddToCart(item)}
            disabled={isAdding}
            accessibilityRole="button"
            accessibilityLabel={`Add ${
              item.name || 'mobile'
            } to cart`}
          >

            {isAdding ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="cart-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.cartButtonText}>
                  Add to Cart
                </Text>
              </>
            )}

          </TouchableOpacity>

        </View>

      </View>
    );
  };

  // ==========================================================
  // Initial loading
  // ==========================================================

  if (loading && products.length === 0) {
    return (
      <View style={styles.centeredContainer}>

        <ActivityIndicator
          size="large"
          color="#2874F0"
        />

        <Text style={styles.loadingTitle}>
          Loading mobiles
        </Text>

        <Text style={styles.loadingSubtitle}>
          Finding the best products for you...
        </Text>

      </View>
    );
  }

  // ==========================================================
  // Error
  // ==========================================================

  if (error && products.length === 0) {
    return (
      <View style={styles.centeredContainer}>

        <View style={styles.stateIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#DC2626"
          />
        </View>

        <Text style={styles.stateTitle}>
          Couldn't load mobiles
        </Text>

        <Text style={styles.stateDescription}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={handleRetry}
        >

          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryButtonText}>
            Try Again
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // ==========================================================
  // Empty
  // ==========================================================

  if (products.length === 0) {
    return (
      <View style={styles.centeredContainer}>

        <View style={styles.stateIcon}>
          <Ionicons
            name="phone-portrait-outline"
            size={42}
            color="#64748B"
          />
        </View>

        <Text style={styles.stateTitle}>
          No mobiles available
        </Text>

        <Text style={styles.stateDescription}>
          There are currently no mobile products
          available in this category.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={handleRetry}
        >

          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryButtonText}>
            Refresh
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  // ==========================================================
  // Main screen
  // ==========================================================

  return (
    <View style={styles.container}>

      <FlatList
        data={products}
        keyExtractor={item =>
          String(item.id)
        }
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}

        contentContainerStyle={
          styles.listContent
        }

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2874F0"
            colors={['#2874F0']}
          />
        }

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}

        // ====================================================
        // Header
        // ====================================================

        ListHeaderComponent={
          <View style={styles.header}>

            <View style={styles.headerLeft}>

              <Text style={styles.title}>
                Mobiles
              </Text>

              <Text style={styles.subtitle}>
                Smartphones and mobile devices
              </Text>

            </View>

            <View style={styles.countBadge}>

              <Text style={styles.countText}>
                {products.length}+
              </Text>

            </View>

          </View>
        }

        // ====================================================
        // Pagination footer
        // ====================================================

        ListFooterComponent={
          <View style={styles.footer}>

            {loadingMore && !last ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#2874F0"
                />

                <Text style={styles.footerText}>
                  Loading more mobiles...
                </Text>
              </>
            ) : last ? (
              <Text style={styles.endText}>
                You've reached the end
              </Text>
            ) : null}

          </View>
        }
      />

    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // Screen
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  listContent: {
    paddingHorizontal: 10,
    paddingTop: 12,

    // Important because the bottom tab navigator
    // is already handling the bottom navigation.
    paddingBottom: 25,
  },

  // ==========================================================
  // Header
  // ==========================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:20,
    paddingHorizontal: 4,
    paddingBottom: 14,
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172337',
  },

  subtitle: {
    marginTop: 3,

    fontSize: 13,
    color: '#64748B',
  },

  countBadge: {
    minWidth: 45,
    height: 30,

    paddingHorizontal: 9,

    borderRadius: 15,

    backgroundColor: '#E8F1FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2874F0',
  },

  // ==========================================================
  // Product card
  // ==========================================================

  productCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 10,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    marginBottom: 10,

    overflow: 'hidden',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.06,

    shadowRadius: 3,

    elevation: 2,
  },

  // ==========================================================
  // Main product row
  // ==========================================================

  productRow: {
    flexDirection: 'row',

    padding: 10,

    minHeight: 190,
  },

  // ==========================================================
  // Image section
  // ==========================================================

  imageContainer: {
    height: 175,

    backgroundColor: '#FFFFFF',

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

    overflow: 'hidden',
  },

  productImage: {
    width: '88%',
    height: '88%',
  },

  // ==========================================================
  // Wishlist
  // ==========================================================

  wishlistButton: {
    position: 'absolute',

    top: 5,
    right: 5,

    zIndex: 10,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.12,

    shadowRadius: 3,

    elevation: 2,
  },

  // ==========================================================
  // Product information
  // ==========================================================

  productInfo: {
    flex: 1,

    marginLeft: 12,

    paddingRight: 2,

    justifyContent: 'flex-start',
  },

  productName: {
    fontSize: 15,

    lineHeight: 20,

    fontWeight: '600',

    color: '#172337',
  },

  // ==========================================================
  // Rating
  // ==========================================================

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 8,
  },

  ratingBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 4,

    backgroundColor: '#16803C',
  },

  ratingText: {
    fontSize: 11,

    fontWeight: '800',

    color: '#FFFFFF',

    marginRight: 3,
  },

  ratingCount: {
    marginLeft: 7,

    fontSize: 11,

    color: '#64748B',
  },

  noRatingText: {
    marginTop: 8,

    fontSize: 11,

    color: '#94A3B8',
  },

  // ==========================================================
  // Price
  // ==========================================================

  price: {
    marginTop: 8,

    fontSize: 20,

    fontWeight: '800',

    color: '#172337',
  },

  // ==========================================================
  // Information rows
  // ==========================================================

  infoRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 7,
  },

  offerText: {
    flex: 1,

    marginLeft: 5,

    fontSize: 11,

    fontWeight: '600',

    color: '#15803D',
  },

  deliveryText: {
    flex: 1,

    marginLeft: 5,

    fontSize: 11,

    color: '#64748B',
  },

  assuredText: {
    marginLeft: 5,

    fontSize: 11,

    fontWeight: '700',

    color: '#2874F0',
  },

  // ==========================================================
  // Action row
  // ==========================================================

  actionRow: {
    flexDirection: 'row',

    paddingHorizontal: 10,

    paddingBottom: 10,

    paddingTop: 2,

    gap: 8,
  },

  // ==========================================================
  // View button
  // ==========================================================

  viewButton: {
    flex: 1,

    minHeight: 42,

    borderRadius: 6,

    borderWidth: 1,

    borderColor: '#2874F0',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,
  },

  viewButtonText: {
    fontSize: 12,

    fontWeight: '700',

    color: '#2874F0',
  },

  // ==========================================================
  // Cart button
  // ==========================================================

  cartButton: {
    flex: 1,

    minHeight: 42,

    borderRadius: 6,

    backgroundColor: '#FF9F00',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,
  },

  cartButtonDisabled: {
    opacity: 0.6,
  },

  cartButtonText: {
    fontSize: 12,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  // ==========================================================
  // Loading
  // ==========================================================

  centeredContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 35,

    backgroundColor: '#F5F7FA',
  },

  loadingTitle: {
    marginTop: 16,

    fontSize: 17,

    fontWeight: '700',

    color: '#172337',
  },

  loadingSubtitle: {
    marginTop: 5,

    fontSize: 13,

    color: '#64748B',

    textAlign: 'center',
  },

  // ==========================================================
  // Error / Empty
  // ==========================================================

  stateIcon: {
    width: 82,
    height: 82,

    borderRadius: 41,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#E2E8F0',

    marginBottom: 18,
  },

  stateTitle: {
    fontSize: 20,

    fontWeight: '800',

    color: '#172337',

    textAlign: 'center',
  },

  stateDescription: {
    maxWidth: 320,

    marginTop: 8,

    fontSize: 14,

    lineHeight: 21,

    color: '#64748B',

    textAlign: 'center',
  },

  retryButton: {
    minHeight: 44,

    marginTop: 20,

    paddingHorizontal: 22,

    borderRadius: 7,

    backgroundColor: '#2874F0',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 7,
  },

  retryButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  // ==========================================================
  // Footer
  // ==========================================================

  footer: {
    minHeight: 65,

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 15,
  },

  footerText: {
    marginTop: 7,

    fontSize: 12,

    color: '#64748B',
  },

  endText: {
    fontSize: 12,

    color: '#94A3B8',
  },
});