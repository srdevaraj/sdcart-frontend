import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { addToCartAPI } from '../../src/api/cartApi';
import clogo from '../../assets/clogo.png';

const { width } = Dimensions.get('window');

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

const BASE_URL = 'https://sdcart-backend-1.onrender.com';

const PAGE_SIZE = 20;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

export default function Fruits({ navigation }) {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  const [error, setError] = useState(null);

  const [addingToCartId, setAddingToCartId] = useState(null);

  /*
   * Fetch products
   */
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

        const response = await api.get('/products/light', {
          params: {
            page: pageNumber,
            size: PAGE_SIZE,
          },
        });

        const data = response?.data;

        const newProducts = Array.isArray(data?.content)
          ? data.content
          : [];

        /*
         * First page
         */
        if (pageNumber === 0) {
          setProducts(newProducts);
        }

        /*
         * Next pages
         */
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
          'Fruits fetch error:',
          err?.response?.data || err?.message
        );

        const message =
          err?.response?.data?.message ||
          'Unable to load fruit products.';

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

  /*
   * Initial load
   */
  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  /*
   * Pull to refresh
   */
  const handleRefresh = useCallback(() => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setLast(false);

    fetchProducts(0, true);
  }, [fetchProducts, refreshing]);

  /*
   * Pagination
   */
  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      refreshing ||
      last ||
      products.length === 0
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
    products.length,
    page,
  ]);

  /*
   * Retry
   */
  const handleRetry = useCallback(() => {
    setLast(false);
    fetchProducts(0);
  }, [fetchProducts]);

  /*
   * Add product to cart
   */
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

  /*
   * Product image
   */
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

  /*
   * Product card
   */
  const renderProduct = ({ item }) => {
    const isAdding = addingToCartId === item.id;

    return (
      <View style={styles.productCard}>
        {/* Product details */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('SelectedProduct', {
              id: item.id,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`View ${
            item.name || 'product'
          }`}
        >
          <View style={styles.imageContainer}>
            <Image
              source={getProductImage(item)}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.productInfo}>
            <Text
              style={styles.productName}
              numberOfLines={2}
            >
              {item.name || 'Unnamed Product'}
            </Text>

            <Text style={styles.price}>
              ₹
              {Number(item.price || 0).toLocaleString(
                'en-IN'
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Add to cart */}
        <TouchableOpacity
          style={[
            styles.addButton,
            isAdding && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={isAdding}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${
            item.name || 'product'
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
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.addButtonText}>
                Add to Cart
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * Initial loading
   */
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingTitle}>
            Loading fruits
          </Text>

          <Text style={styles.loadingSubtitle}>
            Please wait...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Error state
   */
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={42}
              color="#DC2626"
            />
          </View>

          <Text style={styles.stateTitle}>
            Couldn't load fruits
          </Text>

          <Text style={styles.stateDescription}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
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
      </SafeAreaView>
    );
  }

  /*
   * Empty state
   */
  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="nutrition-outline"
              size={42}
              color="#64748B"
            />
          </View>

          <Text style={styles.stateTitle}>
            No fruits available
          </Text>

          <Text style={styles.stateDescription}>
            There are currently no fruit products
            available.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
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
      </SafeAreaView>
    );
  }

  /*
   * Main screen
   *
   * No top navbar.
   * The bottom navigation is controlled by App.js.
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Fruits
            </Text>

            <Text style={styles.sectionSubtitle}>
              Fresh and healthy choices for you
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {loadingMore && !last ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text style={styles.footerText}>
                  Loading more products...
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 30,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  /*
   * Section heading.
   *
   * This is content, NOT a navbar.
   */
  sectionHeader: {
    marginTop:20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  productCard: {
    width: ITEM_WIDTH,

    padding: 10,

    borderRadius: 16,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  imageContainer: {
    width: '100%',
    aspectRatio: 1,

    borderRadius: 12,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
  },

  productImage: {
    width: '88%',
    height: '88%',
  },

  productInfo: {
    paddingTop: 10,
    minHeight: 66,
  },

  productName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#1E293B',
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },

  addButton: {
    minHeight: 42,

    marginTop: 8,

    borderRadius: 10,

    backgroundColor: '#2563EB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  addButtonDisabled: {
    opacity: 0.65,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  centeredContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 35,
  },

  loadingTitle: {
    marginTop: 16,

    fontSize: 17,
    fontWeight: '700',

    color: '#0F172A',
  },

  loadingSubtitle: {
    marginTop: 5,

    fontSize: 13,

    color: '#64748B',
  },

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

    color: '#0F172A',

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

    borderRadius: 10,

    backgroundColor: '#2563EB',

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

  footerContainer: {
    minHeight: 60,

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