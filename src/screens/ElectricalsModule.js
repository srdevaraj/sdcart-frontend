import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

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
} from 'react-native';

import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { addToCartAPI } from '../../src/api/cartApi';
import clogo from '../../assets/clogo.png';

// ============================================================
// CONSTANTS
// ============================================================

const BASE_URL =
  'https://sdcart-backend-1.onrender.com';

const CATEGORY_NAME = 'electricals';

const PAGE_SIZE = 20;

// ============================================================
// API
// ============================================================

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// ============================================================
// SCREEN
// ============================================================

export default function ElectricalsModule({
  navigation,
}) {
  // ==========================================================
  // STATES
  // ==========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [addingToCartId, setAddingToCartId] =
    useState(null);

  const [page, setPage] = useState(0);

  const [last, setLast] = useState(false);

  const [error, setError] = useState(null);

  // ==========================================================
  // FETCH PRODUCTS
  // ==========================================================

  const fetchProducts = useCallback(
    async (
      pageNumber = 0,
      isRefresh = false
    ) => {
      try {
        setError(null);

        // ----------------------------------------------------
        // Initial loading
        // ----------------------------------------------------

        if (
          pageNumber === 0 &&
          !isRefresh
        ) {
          setLoading(true);
        }

        // ----------------------------------------------------
        // Pagination loading
        // ----------------------------------------------------

        if (pageNumber > 0) {
          setLoadingMore(true);
        }

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

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

        const newProducts =
          Array.isArray(data?.content)
            ? data.content
            : [];

        // ----------------------------------------------------
        // FIRST PAGE
        // ----------------------------------------------------

        if (pageNumber === 0) {
          setProducts(newProducts);
        }

        // ----------------------------------------------------
        // NEXT PAGE
        // ----------------------------------------------------

        else {
          setProducts(
            previousProducts => {
              const existingIds =
                new Set(
                  previousProducts.map(
                    product => product.id
                  )
                );

              const uniqueProducts =
                newProducts.filter(
                  product =>
                    !existingIds.has(
                      product.id
                    )
                );

              return [
                ...previousProducts,
                ...uniqueProducts,
              ];
            }
          );
        }

        // ----------------------------------------------------
        // PAGINATION INFORMATION
        // ----------------------------------------------------

        setPage(
          typeof data?.page === 'number'
            ? data.page
            : pageNumber
        );

        setLast(
          Boolean(data?.last)
        );
      } catch (err) {
        console.log(
          'Electrical products error:',
          err?.response?.data ||
            err?.message
        );

        const message =
          err?.response?.data?.message ||
          'Unable to load electrical products.';

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

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = useCallback(() => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setLast(false);

    fetchProducts(0, true);
  }, [
    fetchProducts,
    refreshing,
  ]);

  // ==========================================================
  // LOAD MORE
  // ==========================================================

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

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = useCallback(() => {
    setLast(false);
    fetchProducts(0);
  }, [fetchProducts]);

  // ==========================================================
  // ADD TO CART
  // ==========================================================

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

        await addToCartAPI(
          product.id,
          1
        );

        Alert.alert(
          'Added to cart',
          `${
            product.name || 'Product'
          } has been added to your cart.`,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () =>
                navigation.navigate(
                  'Cart'
                ),
            },
          ]
        );
      } catch (err) {
        console.log(
          'Add to cart error:',
          err?.response?.data ||
            err?.message
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
    [
      addingToCartId,
      navigation,
    ]
  );

  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = product => {
    if (
      product?.imageUrl &&
      typeof product.imageUrl ===
        'string' &&
      product.imageUrl
        .trim()
        .length > 0
    ) {
      return {
        uri: product.imageUrl,
      };
    }

    return clogo;
  };

  // ==========================================================
  // RATING
  // ==========================================================

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

    return '4.0';
  };

  // ==========================================================
  // PRODUCT CARD
  // ==========================================================

  const renderProduct = ({
    item,
  }) => {
    const isAdding =
      addingToCartId === item.id;

    const rating =
      getRating(item);

    const formattedPrice =
      Number(
        item.price || 0
      ).toLocaleString('en-IN');

    return (
      <View
        style={styles.productCard}
      >
        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.productMain}
          onPress={() =>
            navigation.navigate(
              'SelectedProduct',
              {
                id: item.id,
              }
            )
          }
        >
          {/* ==================================================
              LEFT SIDE - IMAGE
          ================================================== */}

          <View
            style={styles.imageSection}
          >
            {/* Wishlist */}

            <TouchableOpacity
              style={
                styles.wishlistButton
              }
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Wishlist',
                  'Wishlist feature will be available soon.'
                )
              }
            >
              <Ionicons
                name="heart-outline"
                size={19}
                color="#475569"
              />
            </TouchableOpacity>

            {/* Product Image */}

            <Image
              source={getProductImage(
                item
              )}
              style={
                styles.productImage
              }
              resizeMode="contain"
            />
          </View>

          {/* ==================================================
              RIGHT SIDE - PRODUCT DETAILS
          ================================================== */}

          <View
            style={styles.productInfo}
          >
            {/* Product Name */}

            <Text
              style={
                styles.productName
              }
              numberOfLines={3}
            >
              {item.name ||
                'Unnamed Electrical Product'}
            </Text>

            {/* Rating */}

            <View
              style={styles.ratingRow}
            >
              <View
                style={
                  styles.ratingBadge
                }
              >
                <Text
                  style={
                    styles.ratingText
                  }
                >
                  {rating}
                </Text>

                <Ionicons
                  name="star"
                  size={11}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={
                  styles.ratingCount
                }
              >
                Ratings
              </Text>
            </View>

            {/* Price */}

            <Text
              style={styles.price}
            >
              ₹{formattedPrice}
            </Text>

            {/* Offer */}

            <View
              style={styles.offerRow}
            >
              <Ionicons
                name="pricetag-outline"
                size={14}
                color="#15803D"
              />

              <Text
                style={
                  styles.offerText
                }
                numberOfLines={1}
              >
                Special offer available
              </Text>
            </View>

            {/* Delivery */}

            <View
              style={
                styles.deliveryRow
              }
            >
              <Ionicons
                name="location-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.deliveryText
                }
                numberOfLines={1}
              >
                Free delivery available
              </Text>
            </View>

            {/* Assured */}

            <View
              style={styles.assuredRow}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#2874F0"
              />

              <Text
                style={
                  styles.assuredText
                }
              >
                sdCart Assured
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <View
          style={
            styles.actionContainer
          }
        >
          {/* View Details */}

          <TouchableOpacity
            style={
              styles.viewButton
            }
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'SelectedProduct',
                {
                  id: item.id,
                }
              )
            }
          >
            <Ionicons
              name="eye-outline"
              size={16}
              color="#334155"
            />

            <Text
              style={
                styles.viewButtonText
              }
            >
              View Details
            </Text>
          </TouchableOpacity>

          {/* Add To Cart */}

          <TouchableOpacity
            style={[
              styles.addButton,
              isAdding &&
                styles.addButtonDisabled,
            ]}
            onPress={() =>
              handleAddToCart(item)
            }
            disabled={isAdding}
            activeOpacity={0.8}
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

                <Text
                  style={
                    styles.addButtonText
                  }
                >
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
  // INITIAL LOADING
  // ==========================================================

  if (
    loading &&
    products.length === 0
  ) {
    return (
      <View
        style={
          styles.centeredContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2874F0"
        />

        <Text
          style={
            styles.loadingTitle
          }
        >
          Loading electricals
        </Text>

        <Text
          style={
            styles.loadingSubtitle
          }
        >
          Finding the best products for you...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (
    error &&
    products.length === 0
  ) {
    return (
      <View
        style={
          styles.centeredContainer
        }
      >
        <View
          style={styles.stateIcon}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#DC2626"
          />
        </View>

        <Text
          style={styles.stateTitle}
        >
          Couldn't load electricals
        </Text>

        <Text
          style={
            styles.stateDescription
          }
        >
          {error}
        </Text>

        <TouchableOpacity
          style={
            styles.retryButton
          }
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.retryButtonText
            }
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (products.length === 0) {
    return (
      <View
        style={
          styles.centeredContainer
        }
      >
        <View
          style={styles.stateIcon}
        >
          <Ionicons
            name="flash-outline"
            size={42}
            color="#64748B"
          />
        </View>

        <Text
          style={styles.stateTitle}
        >
          No electrical products
        </Text>

        <Text
          style={
            styles.stateDescription
          }
        >
          There are currently no electrical products available in this category.
        </Text>

        <TouchableOpacity
          style={
            styles.retryButton
          }
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.retryButtonText
            }
          >
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <View
      style={styles.container}
    >
      <FlatList
        data={products}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={
          renderProduct
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor="#2874F0"
            colors={[
              '#2874F0',
            ]}
          />
        }

        // ====================================================
        // HEADER
        // ====================================================

        ListHeaderComponent={
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.headerTextContainer
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Electricals
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Electronics and electrical products
              </Text>
            </View>

            <View
              style={
                styles.productCountBadge
              }
            >
              <Text
                style={
                  styles.productCountText
                }
              >
                {products.length}+
              </Text>
            </View>
          </View>
        }

        // ====================================================
        // FOOTER
        // ====================================================

        ListFooterComponent={
          <View
            style={
              styles.footerContainer
            }
          >
            {loadingMore &&
            !last ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#2874F0"
                />

                <Text
                  style={
                    styles.footerText
                  }
                >
                  Loading more products...
                </Text>
              </>
            ) : last ? (
              <Text
                style={
                  styles.endText
                }
              >
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
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  listContent: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
    marginTop:20,
  },

  headerTextContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172337',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
  },

  productCountBadge: {
    minWidth: 44,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2874F0',
  },

  // ==========================================================
  // PRODUCT CARD
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
  // PRODUCT MAIN
  // ==========================================================

  productMain: {
    flexDirection: 'row',
    minHeight: 185,
    padding: 10,
  },

  // ==========================================================
  // LEFT IMAGE
  // ==========================================================

  imageSection: {
    width: 135,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  // ==========================================================
  // WISHLIST
  // ==========================================================

  wishlistButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 5,

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
  // RIGHT PRODUCT INFORMATION
  // ==========================================================

  productInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 3,
    justifyContent: 'flex-start',
  },

  productName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#172337',
  },

  // ==========================================================
  // RATING
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

  // ==========================================================
  // PRICE
  // ==========================================================

  price: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: '#172337',
  },

  // ==========================================================
  // OFFER
  // ==========================================================

  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  offerText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },

  // ==========================================================
  // DELIVERY
  // ==========================================================

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  deliveryText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 11,
    color: '#64748B',
  },

  // ==========================================================
  // ASSURED
  // ==========================================================

  assuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  assuredText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '600',
    color: '#2874F0',
  },

  // ==========================================================
  // ACTION AREA
  // ==========================================================

  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
    gap: 8,
  },

  // ==========================================================
  // VIEW DETAILS
  // ==========================================================

  viewButton: {
    flex: 1,
    minHeight: 42,

    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  addButton: {
    flex: 1,
    minHeight: 42,

    borderRadius: 6,

    backgroundColor: '#FF9F00',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  addButtonDisabled: {
    opacity: 0.6,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ==========================================================
  // CENTERED STATES
  // ==========================================================

  centeredContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 35,

    backgroundColor: '#F5F7FA',
  },

  // ==========================================================
  // LOADING
  // ==========================================================

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
  // ERROR / EMPTY
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
  // PAGINATION
  // ==========================================================

  footerContainer: {
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
