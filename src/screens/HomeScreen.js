// src/screens/HomeScreen.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategories } from '../services/categoryService';
import { getProducts, primaryImage } from '../services/productService';
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { AppImage } from '../components/common/AppImage';
import { ProductCard } from '../components/common/ProductCard';
import { ShimmerLoader, ProductCardSkeleton } from '../components/common/ShimmerLoader';
import { AnimatedBadge } from '../components/common/AnimatedBadge';
import { useCart } from '../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_PRESETS = [
  {
    keywords: ['electron', 'mobile', 'phone', 'gadget'],
    screen: 'Mobiles',
    icon: 'cellphone',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  {
    keywords: ['cloth', 'fashion', 'apparel', 'wear'],
    screen: 'Fruits',
    icon: 'tshirt-crew',
    gradient: ['#F97316', '#EA580C'],
  },
  {
    keywords: ['home', 'kitchen', 'grocery', 'food'],
    screen: 'Grocery',
    icon: 'cart',
    gradient: ['#10B981', '#059669'],
  },
  {
    keywords: ['sport', 'fit', 'outdoor'],
    screen: 'ElectricalsModule',
    icon: 'dumbbell',
    gradient: ['#EC4899', '#BE185D'],
  },
];

function presetForCategory(category) {
  const haystack = `${category.name} ${category.slug}`.toLowerCase();
  return (
    CATEGORY_PRESETS.find((preset) =>
      preset.keywords.some((keyword) => haystack.includes(keyword))
    ) || {
      screen: 'Products',
      icon: 'shape-outline',
      gradient: ['#6366F1', '#4F46E5'],
    }
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, layout, isDark } = useTheme();
  const { totalQuantity } = useCart();

  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerScrollRef = useRef(null);

  const fetchHomeData = useCallback(async () => {
    try {
      const [categoryList, featuredPage, trendingPage] = await Promise.all([
        getCategories().catch(() => []),
        getProducts({ featured: true, size: 5 }).catch(() => ({ content: [] })),
        getProducts({ size: 8 }).catch(() => ({ content: [] })),
      ]);

      setCategories(Array.isArray(categoryList) ? categoryList : []);
      setFeatured(featuredPage?.content || []);
      setTrending(trendingPage?.content || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Auto Slider for Featured Banners
  useEffect(() => {
    if (featured.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % featured.length;
      bannerScrollRef.current?.scrollTo({
        x: nextIndex * (SCREEN_WIDTH - 32),
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex, featured.length]);

  const handleBannerScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (SCREEN_WIDTH - 32));
    if (index !== currentIndex && index >= 0 && index < featured.length) {
      setCurrentIndex(index);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ===================================================
            HEADER & SEARCH
            =================================================== */}
        <LinearGradient
          colors={colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroHeader,
            {
              paddingTop: insets.top + 12,
              borderBottomLeftRadius: radius['3xl'],
              borderBottomRightRadius: radius['3xl'],
            },
          ]}
        >
          {/* Top Brand Bar */}
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <View style={styles.logoBadge}>
                <AppImage
                  source={require('../../assets/clogo.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.brandTextWrap}>
                <Text style={[styles.brandName, { fontWeight: typography.weights.black }]}>
                  sdCart
                </Text>
                <Text style={styles.brandTagline}>Premium Shopping</Text>
              </View>
            </View>

            <AnimatedPressable
              onPress={() => navigation.navigate('Cart')}
              style={styles.headerCartButton}
              haptic="selection"
              accessibilityLabel="Cart"
            >
              <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
              <AnimatedBadge count={totalQuantity} style={styles.headerCartBadge} />
            </AnimatedPressable>
          </View>

          {/* Search Trigger */}
          <AnimatedPressable
            onPress={() => navigation.navigate('Search')}
            scaleTo={0.98}
            haptic="light"
            style={[
              styles.searchTrigger,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                ...shadows.md,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
            <Text style={[styles.searchText, { color: colors.textMuted }]}>
              Search for products, brands & more...
            </Text>
            <View style={[styles.searchMic, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
            </View>
          </AnimatedPressable>
        </LinearGradient>

        {/* ===================================================
            FEATURED BANNER CAROUSEL
            =================================================== */}
        {loading ? (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <ShimmerLoader height={180} borderRadius={radius['2xl']} />
          </View>
        ) : featured.length > 0 ? (
          <View style={styles.carouselSection}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleBannerScroll}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH - 32}
              snapToAlignment="center"
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {featured.map((item) => (
                <AnimatedPressable
                  key={item.publicId || item.id}
                  onPress={() =>
                    navigation.navigate('SelectedProduct', {
                      id: item.publicId || item.id,
                    })
                  }
                  scaleTo={0.98}
                  style={[
                    styles.bannerCard,
                    {
                      width: SCREEN_WIDTH - 32,
                      borderRadius: radius['2xl'],
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      ...shadows.md,
                    },
                  ]}
                >
                  <AppImage
                    source={primaryImage(item)}
                    style={styles.bannerImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
                    style={styles.bannerOverlay}
                  >
                    <View style={styles.bannerBadge}>
                      <Text style={styles.bannerBadgeText}>FEATURED DEAL</Text>
                    </View>
                    <Text style={styles.bannerTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.bannerSubtitle}>
                      Grab special offers today · Limited stock
                    </Text>
                  </LinearGradient>
                </AnimatedPressable>
              ))}
            </ScrollView>

            {/* Pagination Indicators */}
            <View style={styles.paginationRow}>
              {featured.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageDot,
                    {
                      backgroundColor:
                        currentIndex === index ? colors.accent : colors.border,
                      width: currentIndex === index ? 24 : 8,
                      borderRadius: radius.full,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* ===================================================
            CATEGORIES SECTION
            =================================================== */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
              Shop by Category
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Explore our curated selections
            </Text>
          </View>

          <AnimatedPressable
            onPress={() => navigation.navigate('Products')}
            scaleTo={0.94}
            haptic="selection"
          >
            <Text style={[styles.viewAllText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
              View All →
            </Text>
          </AnimatedPressable>
        </View>

        {loading ? (
          <View style={styles.categoryGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: (SCREEN_WIDTH - 44) / 2, marginBottom: 12 }}>
                <ShimmerLoader height={100} borderRadius={radius.xl} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.slice(0, 4).map((category, index) => {
              const preset = presetForCategory(category);
              return (
                <AnimatedPressable
                  key={category.publicId || index}
                  onPress={() =>
                    navigation.navigate(preset.screen, {
                      slug: category.slug,
                      title: category.name,
                    })
                  }
                  scaleTo={0.95}
                  haptic="selection"
                  style={[
                    styles.categoryCard,
                    {
                      width: (SCREEN_WIDTH - 44) / 2,
                      borderRadius: radius.xl,
                      ...shadows.sm,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={preset.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.categoryGradient, { borderRadius: radius.xl }]}
                  >
                    <View style={styles.categoryIconCircle}>
                      <MaterialCommunityIcons
                        name={preset.icon}
                        size={28}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        { fontWeight: typography.weights.bold },
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </LinearGradient>
                </AnimatedPressable>
              );
            })}
          </View>
        )}

        {/* ===================================================
            PROMOTIONAL HIGHLIGHT BANNER
            =================================================== */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <LinearGradient
            colors={['#7C3AED', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.promoCard,
              {
                borderRadius: radius['2xl'],
                ...shadows.md,
              },
            ]}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>MEGA SAVINGS</Text>
              </View>
              <Text style={styles.promoTitle}>Up to 70% OFF</Text>
              <Text style={styles.promoSubtitle}>Top deals across all categories</Text>
            </View>
            <MaterialCommunityIcons
              name="tag-heart"
              size={64}
              color="rgba(255, 255, 255, 0.25)"
            />
          </LinearGradient>
        </View>

        {/* ===================================================
            TRENDING PRODUCTS GRID
            =================================================== */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
              Trending Now 🔥
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Popular items shoppers love
            </Text>
          </View>

          <AnimatedPressable
            onPress={() => navigation.navigate('Products')}
            scaleTo={0.94}
            haptic="selection"
          >
            <Text style={[styles.viewAllText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
              Explore →
            </Text>
          </AnimatedPressable>
        </View>

        <View style={styles.productsGrid}>
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} width={layout.cardWidth} />
              ))
            : trending.map((item) => (
                <ProductCard
                  key={item.publicId || item.id}
                  product={item}
                  cardWidth={layout.cardWidth}
                />
              ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -2,
  },
  headerCartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
  },
  searchTrigger: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
  },
  searchMic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSection: {
    marginTop: 18,
  },
  bannerCard: {
    height: 180,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  pageDot: {
    height: 6,
    transition: 'all 0.2s',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryCard: {
    height: 96,
    marginBottom: 12,
  },
  categoryGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  promoCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
  },
  promoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
