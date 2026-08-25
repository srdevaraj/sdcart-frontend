// src/screens/ProductScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { getProducts } from '../services/productService';
import { normalizeProductPage } from '../services/normalizers';
import { getCategories } from '../services/categoryService';
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/ShimmerLoader';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

function categoryIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('electron') || n.includes('mobile') || n.includes('gadget')) return 'laptop';
  if (n.includes('cloth') || n.includes('fashion') || n.includes('apparel')) return 'tshirt-crew';
  if (n.includes('home') || n.includes('kitchen') || n.includes('grocery')) return 'cart';
  if (n.includes('sport') || n.includes('fit')) return 'dumbbell';
  return 'apps';
}

export default function ProductScreen({ navigation, route }) {
  const { colors, typography, radius, shadows, layout, isDark } = useTheme();
  const { showError } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  // Fetch Categories on mount
  useEffect(() => {
    getCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(
            data.map((c) => ({
              ...c,
              icon: categoryIcon(c.name),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(
    async (pageNumber = 0, isRefresh = false) => {
      try {
        if (pageNumber === 0 && !isRefresh) {
          setLoading(true);
        } else if (pageNumber > 0) {
          setLoadingMore(true);
        }

        const response = await getProducts({
          category: selectedCategory || undefined,
          page: pageNumber,
          size: 20,
        });

        const processed = normalizeProductPage(response)?.content || [];

        if (pageNumber === 0) {
          setProducts(processed);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id || p.publicId));
            const uniqueNew = processed.filter(
              (p) => !existingIds.has(p.id || p.publicId)
            );
            return [...prev, ...uniqueNew];
          });
        }

        setPage(response?.page ?? pageNumber);
        setLast(Boolean(response?.last));
      } catch (err) {
        showError('Unable to load products. Pull down to retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, showError]
  );

  useEffect(() => {
    fetchProducts(0);
  }, [selectedCategory, fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !last && products.length > 0) {
      fetchProducts(page + 1);
    }
  };

  const categoryChips = useMemo(
    () => [{ name: 'All', slug: null, icon: 'apps' }, ...categories],
    [categories]
  );

  const renderProductItem = useCallback(
    ({ item }) => (
      <ProductCard product={item} cardWidth={layout.cardWidth} />
    ),
    [layout.cardWidth]
  );

  const keyExtractor = useCallback(
    (item) => String(item.id || item.publicId || Math.random()),
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Screen Header */}
      <ScreenHeader
        title="Explore Catalog"
        subtitle={`${products.length} products available`}
        rightElement={
          <AnimatedPressable
            onPress={() => navigation.navigate('Search')}
            style={[
              styles.headerSearchBtn,
              {
                backgroundColor: isDark ? colors.backgroundSecondary : '#F1F5F9',
                marginRight: 6,
              },
            ]}
            haptic="light"
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </AnimatedPressable>
        }
      />

      {/* Category Pills Bar */}
      <View
        style={[
          styles.categoryBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categoryChips.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <AnimatedPressable
                key={cat.slug || 'all'}
                onPress={() => setSelectedCategory(cat.slug)}
                scaleTo={0.94}
                haptic="selection"
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.backgroundSecondary
                      : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={cat.icon || 'shape-outline'}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected
                        ? typography.weights.bold
                        : typography.weights.medium,
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} width={layout.cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyCircle,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontWeight: typography.weights.extrabold },
                ]}
              >
                No Products Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Try choosing another category or check back later.
              </Text>
              <AnimatedPressable
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.resetBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.full,
                  },
                ]}
                haptic="selection"
              >
                <Text style={styles.resetBtnText}>View All Products</Text>
              </AnimatedPressable>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  Loading more items...
                </Text>
              </View>
            ) : last && products.length > 0 ? (
              <View style={styles.endBanner}>
                <View style={[styles.endLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.endText, { color: colors.textMuted }]}>
                  You've viewed all products
                </Text>
                <View style={[styles.endLine, { backgroundColor: colors.border }]} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSearchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
  },
  endBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  endLine: {
    flex: 1,
    height: 1,
  },
  endText: {
    fontSize: 12,
  },
});