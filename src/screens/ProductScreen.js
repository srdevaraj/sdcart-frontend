import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getAllProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { addToCartAPI } from '../api/cartApi';

import clogo from '../../assets/clogo.png';

const { width } = Dimensions.get('window');

const CARD_WIDTH = (width - 54) / 2;

const API_IMAGE =
  'https://res.cloudinary.com/<your-cloud-name>/image/upload/';

export default function ProductScreen({
  navigation,
  route,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [addingToCartId, setAddingToCartId] =
    useState(null);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const fade = useRef(
    new Animated.Value(0)
  ).current;

  const translate = useRef(
    new Animated.Value(25)
  ).current;

  const { addToCart } = useCart();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    fetchProducts();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(translate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (route.params?.openModal) {
      setModalVisible(true);

      navigation.setParams({
        openModal: false,
      });
    }
  }, [route.params]);

  const fetchProducts = async (
    pageNumber = 0
  ) => {
    try {
      if (pageNumber === 0) {
        setLoading(true);
      }

      const response =
        await getAllProducts(pageNumber, 25);

      const processed =
        response.content.map(item => ({
          ...item,
          imageUrl:
            item.imageUrl &&
            !item.imageUrl.startsWith('http')
              ? API_IMAGE + item.imageUrl
              : item.imageUrl,
        }));

      if (pageNumber === 0) {
        setProducts(processed);
      } else {
        setProducts(prev => [
          ...prev,
          ...processed,
        ]);
      }

      setPage(response.page);
      setLast(response.last);

    } catch (e) {
      Alert.alert(
        'Error',
        'Unable to load products.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setLast(false);
    fetchProducts(0);
  };

  const loadMore = () => {
    if (!loading && !last) {
      fetchProducts(page + 1);
    }
  };

  const handleAddToCart = async product => {
    try {
      setAddingToCartId(product.id);

      await addToCartAPI(product.id, 1);

      addToCart(product);

    } catch (e) {
      Alert.alert(
        'Error',
        'Failed to add product.'
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  const filteredProducts =
    products.filter(item =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>

        <StatusBar
          backgroundColor="#2563EB"
          barStyle="light-content"
        />

        <Image
          source={clogo}
          style={styles.loaderLogo}
        />

        <ActivityIndicator
          color="#2563EB"
          size="large"
        />

        <Text style={styles.loaderText}>
          Loading amazing products...
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <StatusBar
        backgroundColor="#2563EB"
        barStyle="light-content"
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item =>
          item.id.toString()
        }
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={
          styles.columnWrapper
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }

        ListHeaderComponent={

          <Animated.View
            style={{
              opacity: fade,
              transform: [
                {
                  translateY: translate,
                },
              ],
            }}
          >

            {/* HERO */}

            <LinearGradient
              colors={[
                '#2563EB',
                '#4F46E5',
              ]}
              style={styles.hero}
            >

              <View style={styles.topRow}>

                <View>

                  <Text style={styles.greeting}>
                    Welcome 👋
                  </Text>

                  <Text style={styles.subtitle}>
                    Discover premium products
                  </Text>

                </View>

                <Image
                  source={clogo}
                  style={styles.logo}
                />

              </View>

              <View style={styles.searchBox}>

                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color="#94A3B8"
                />

                <TextInput
                  placeholder="Search products..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />

                <MaterialCommunityIcons
                  name="microphone"
                  size={22}
                  color="#2563EB"
                />

              </View>

            </LinearGradient>

            {/* SALE CARD */}

            <LinearGradient
              colors={[
                '#7C3AED',
                '#2563EB',
              ]}
              style={styles.offerCard}
            >

              <View>

                <Text style={styles.offerTitle}>
                  Mega Sale 🔥
                </Text>

                <Text style={styles.offerText}>
                  Up to 70% OFF
                </Text>

                <Text style={styles.offerSmall}>
                  Limited time offers
                </Text>

              </View>

              <MaterialCommunityIcons
                name="shopping"
                size={70}
                color="rgba(255,255,255,.25)"
              />

            </LinearGradient>
                        {/* Categories */}

            <Text style={styles.sectionTitle}>
              Shop by Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {[
                {
                  name: 'All',
                  icon: 'apps',
                },
                {
                  name: 'Fruits',
                  icon: 'fruit-cherries',
                },
                {
                  name: 'Mobiles',
                  icon: 'cellphone',
                },
                {
                  name: 'Grocery',
                  icon: 'cart',
                },
                {
                  name: 'Fashion',
                  icon: 'tshirt-crew',
                },
                {
                  name: 'Electronics',
                  icon: 'laptop',
                },
              ].map(category => (

                <TouchableOpacity
                  key={category.name}
                  activeOpacity={0.9}
                  onPress={() =>
                    setSelectedCategory(category.name)
                  }
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.name &&
                      styles.activeCategoryChip,
                  ]}
                >

                  <MaterialCommunityIcons
                    name={category.icon}
                    size={22}
                    color={
                      selectedCategory === category.name
                        ? '#FFFFFF'
                        : '#2563EB'
                    }
                  />

                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.name &&
                        styles.activeCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>

                </TouchableOpacity>

              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>

              <Text style={styles.sectionTitle}>
                Trending Products
              </Text>

              <TouchableOpacity>
                <Text style={styles.viewAll}>
                  View All
                </Text>
              </TouchableOpacity>

            </View>

          </Animated.View>
        }

        renderItem={({ item }) => (

          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.productCard}
            onPress={() =>
              navigation.navigate(
                'SelectedProduct',
                {
                  id: item.id,
                }
              )
            }
          >

            {/* Discount */}

            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                20% OFF
              </Text>
            </View>

            {/* Wishlist */}

            <TouchableOpacity
              style={styles.favoriteButton}
            >
              <MaterialCommunityIcons
                name="heart-outline"
                size={22}
                color="#EF4444"
              />
            </TouchableOpacity>

            {/* Product Image */}

            <Image
              source={
                item.imageUrl
                  ? {
                      uri: item.imageUrl,
                    }
                  : clogo
              }
              resizeMode="contain"
              style={styles.productImage}
            />

            {/* Product Name */}

            <Text
              numberOfLines={2}
              style={styles.productTitle}
            >
              {item.name}
            </Text>

            {/* Rating */}

            <View style={styles.ratingRow}>

              <MaterialCommunityIcons
                name="star"
                size={14}
                color="#FBBF24"
              />

              <Text style={styles.ratingText}>
                4.8
              </Text>

              <Text style={styles.reviewText}>
                (240)
              </Text>

            </View>

            {/* Price */}

            <View style={styles.priceRow}>

              <Text style={styles.price}>
                ₹{item.price}
              </Text>

              <Text style={styles.oldPrice}>
                ₹
                {Math.round(
                  item.price * 1.25
                )}
              </Text>

            </View>

            {/* Delivery */}

            <View style={styles.deliveryRow}>

              <MaterialCommunityIcons
                name="truck-fast"
                size={16}
                color="#22C55E"
              />

              <Text style={styles.deliveryText}>
                Free Delivery
              </Text>

            </View>

            {/* Add Button */}

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.cartButton}
              disabled={
                addingToCartId === item.id
              }
              onPress={() =>
                handleAddToCart(item)
              }
            >

              {addingToCartId === item.id ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <>

                  <MaterialCommunityIcons
                    name="cart-plus"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.cartButtonText}
                  >
                    Add to Cart
                  </Text>

                </>

              )}

            </TouchableOpacity>

          </TouchableOpacity>

        )}

        onEndReached={loadMore}
        onEndReachedThreshold={0.4}

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <MaterialCommunityIcons
              name="package-variant"
              size={90}
              color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
              No Products Found
            </Text>

            <Text style={styles.emptySubtitle}>
              Try searching with another keyword.
            </Text>

          </View>

        }

        ListFooterComponent={

          !last ? (

            <View style={styles.footerLoader}>

              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

            </View>

          ) : (

            <View style={{ height: 100 }} />

          )

        }

      />

      {/* Floating Cart */}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.fab}
        onPress={() =>
          navigation.navigate('Cart')
        }
      >

        <MaterialCommunityIcons
          name="cart"
          size={28}
          color="#FFFFFF"
        />

      </TouchableOpacity>

    </View>

  );
}
const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#F8FAFC',
},

columnWrapper: {
  justifyContent: 'space-between',
  paddingHorizontal: 16,
},

/* ---------------- Loader ---------------- */

loaderContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F8FAFC',
},

loaderLogo: {
  width: 90,
  height: 90,
  borderRadius: 22,
  marginBottom: 20,
},

loaderText: {
  marginTop: 18,
  fontSize: 16,
  color: '#64748B',
  fontWeight: '600',
},

/* ---------------- Hero ---------------- */

hero: {
  paddingTop: 55,
  paddingBottom: 35,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
},

topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

logo: {
  width: 56,
  height: 56,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
},

greeting: {
  color: '#FFFFFF',
  fontSize: 28,
  fontWeight: '700',
},

subtitle: {
  color: '#DBEAFE',
  fontSize: 15,
  marginTop: 6,
},

/* ---------------- Search ---------------- */

searchBox: {
  marginTop: 24,
  height: 56,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,

  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 6,
},

searchInput: {
  flex: 1,
  marginHorizontal: 10,
  fontSize: 16,
  color: '#111827',
},

/* ---------------- Offer Banner ---------------- */

offerCard: {
  marginHorizontal: 18,
  marginTop: -20,

  borderRadius: 24,

  paddingHorizontal: 20,
  paddingVertical: 22,

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  shadowColor: '#7C3AED',
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 10,
},

offerTitle: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},

offerText: {
  color: '#FFFFFF',
  fontSize: 28,
  fontWeight: 'bold',
  marginTop: 6,
},

offerSmall: {
  color: '#E0E7FF',
  marginTop: 5,
  fontSize: 14,
},

/* ---------------- Section ---------------- */

sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginHorizontal: 20,
  marginTop: 28,
  marginBottom: 18,
},

sectionTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#111827',
},

viewAll: {
  color: '#2563EB',
  fontWeight: '700',
  fontSize: 15,
},
/* ===========================
   CATEGORY CHIPS
=========================== */

categoryContainer: {
  paddingHorizontal: 18,
  paddingTop: 25,
  paddingBottom: 8,
},

categoryChip: {
  flexDirection: 'row',
  alignItems: 'center',

  backgroundColor: '#FFFFFF',

  paddingHorizontal: 18,
  paddingVertical: 12,

  borderRadius: 30,

  marginRight: 12,

  borderWidth: 1,
  borderColor: '#E5E7EB',

  elevation: 3,

  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 2,
  },
},

activeCategoryChip: {
  backgroundColor: '#2563EB',
  borderColor: '#2563EB',
},

categoryText: {
  marginLeft: 8,
  fontSize: 15,
  fontWeight: '600',
  color: '#2563EB',
},

activeCategoryText: {
  color: '#FFFFFF',
},

/* ===========================
   PRODUCT CARD
=========================== */

productCard: {
  width: CARD_WIDTH,

  backgroundColor: '#FFFFFF',

  borderRadius: 24,

  marginBottom: 20,

  padding: 14,

  overflow: 'hidden',

  elevation: 8,

  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 5,
  },
},

productImage: {
  width: '100%',
  height: 170,

  resizeMode: 'contain',

  borderRadius: 18,

  backgroundColor: '#F8FAFC',
},

productTitle: {
  marginTop: 14,

  color: '#111827',

  fontSize: 15,

  fontWeight: '700',

  lineHeight: 22,

  minHeight: 44,
},

/* ===========================
   DISCOUNT BADGE
=========================== */

discountBadge: {
  position: 'absolute',

  left: 12,
  top: 12,

  backgroundColor: '#EF4444',

  paddingHorizontal: 10,
  paddingVertical: 5,

  borderRadius: 20,

  zIndex: 5,
},

discountText: {
  color: '#FFFFFF',

  fontWeight: '700',

  fontSize: 11,
},

/* ===========================
   FAVOURITE
=========================== */

favoriteButton: {
  position: 'absolute',

  top: 12,
  right: 12,

  width: 38,
  height: 38,

  borderRadius: 19,

  backgroundColor: '#FFFFFF',

  justifyContent: 'center',
  alignItems: 'center',

  zIndex: 5,

  elevation: 5,

  shadowColor: '#000',
  shadowOpacity: 0.10,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 2,
  },
},

/* ===========================
   RATING
=========================== */

ratingRow: {
  flexDirection: 'row',

  alignItems: 'center',

  marginTop: 10,
},

ratingText: {
  marginLeft: 4,

  fontSize: 14,

  fontWeight: '700',

  color: '#111827',
},

reviewText: {
  marginLeft: 5,

  color: '#94A3B8',

  fontSize: 13,
},

/* ===========================
   PRICE
=========================== */

priceRow: {
  flexDirection: 'row',

  alignItems: 'center',

  marginTop: 10,
},

price: {
  fontSize: 20,

  color: '#16A34A',

  fontWeight: '800',
},

oldPrice: {
  marginLeft: 10,

  fontSize: 14,

  color: '#9CA3AF',

  textDecorationLine: 'line-through',
},

/* ===========================
   DELIVERY
=========================== */

deliveryRow: {
  flexDirection: 'row',

  alignItems: 'center',

  marginTop: 10,
},

deliveryText: {
  marginLeft: 6,

  color: '#22C55E',

  fontSize: 13,

  fontWeight: '600',
},

/* ===========================
   CART BUTTON
=========================== */

cartButton: {
  marginTop: 18,

  height: 48,

  borderRadius: 15,

  backgroundColor: '#2563EB',

  flexDirection: 'row',

  justifyContent: 'center',
  alignItems: 'center',

  elevation: 6,

  shadowColor: '#2563EB',
  shadowOpacity: 0.25,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 4,
  },
},

cartButtonText: {
  marginLeft: 8,

  color: '#FFFFFF',

  fontWeight: '700',

  fontSize: 15,
},
/* ===========================
   EMPTY STATE
=========================== */

emptyContainer: {
  justifyContent: 'center',
  alignItems: 'center',

  paddingVertical: 80,
  paddingHorizontal: 30,
},

emptyTitle: {
  marginTop: 20,

  fontSize: 24,

  fontWeight: '700',

  color: '#1E293B',
},

emptySubtitle: {
  marginTop: 10,

  fontSize: 15,

  color: '#64748B',

  textAlign: 'center',

  lineHeight: 24,
},

/* ===========================
   FOOTER LOADER
=========================== */

footerLoader: {
  paddingVertical: 25,
  justifyContent: 'center',
  alignItems: 'center',
},

/* ===========================
   FLOATING CART
=========================== */

fab: {
  position: 'absolute',

  right: 22,
  bottom: 28,

  width: 64,
  height: 64,

  borderRadius: 32,

  backgroundColor: '#2563EB',

  justifyContent: 'center',
  alignItems: 'center',

  elevation: 12,

  shadowColor: '#2563EB',
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 6,
  },
},

fabBadge: {
  position: 'absolute',

  top: -3,
  right: -3,

  width: 22,
  height: 22,

  borderRadius: 11,

  backgroundColor: '#EF4444',

  justifyContent: 'center',
  alignItems: 'center',
},

fabBadgeText: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: '700',
},

/* ===========================
   MODAL
=========================== */

modalContainer: {
  flex: 1,

  backgroundColor: 'rgba(0,0,0,0.45)',

  justifyContent: 'flex-end',
},

modalContent: {
  backgroundColor: '#FFFFFF',

  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,

  paddingHorizontal: 22,
  paddingVertical: 25,
},

modalHandle: {
  alignSelf: 'center',

  width: 55,
  height: 5,

  borderRadius: 10,

  backgroundColor: '#CBD5E1',

  marginBottom: 22,
},

modalTitle: {
  fontSize: 22,

  fontWeight: '700',

  color: '#111827',

  marginBottom: 18,
},

categoryButton: {
  flexDirection: 'row',

  alignItems: 'center',

  backgroundColor: '#F8FAFC',

  paddingVertical: 16,
  paddingHorizontal: 18,

  borderRadius: 18,

  marginBottom: 14,

  borderWidth: 1,
  borderColor: '#E5E7EB',
},

categoryText: {
  marginLeft: 14,

  fontSize: 16,

  fontWeight: '600',

  color: '#111827',
},

/* ===========================
   GLOBAL SPACING
=========================== */

divider: {
  height: 18,
},

listContent: {
  paddingBottom: 110,
},

shadow: {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },
},

rounded: {
  borderRadius: 24,
},

center: {
  justifyContent: 'center',
  alignItems: 'center',
}
});