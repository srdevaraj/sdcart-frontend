// src/screens/CategoryScreenBase.js
import React, { useState, useEffect, useCallback, memo } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';

import { getProducts } from '../services/productService';
import { normalizeProductPage } from '../services/normalizers';
import { useTheme } from '../theme';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/ShimmerLoader';
import { AnimatedPressable } from '../components/common/AnimatedPressable';

const PAGE_SIZE = 20;

export function CategoryScreenBase({ defaultSlug, defaultTitle }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, typography, radius, layout, isDark } = useTheme();

  const slug = route.params?.slug || defaultSlug;
  const title = route.params?.title || defaultTitle;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  const fetchProducts = useCallback(
    async (pageNumber = 0, isRefresh = false) => {
      try {
        if (pageNumber === 0 && !isRefresh) {
          setLoading(true);
        }
        if (pageNumber > 0) {
          setLoadingMore(true);
        }

        const data = await getProducts({
          category: slug,
          page: pageNumber,
          size: PAGE_SIZE,
        });

        const newProducts = normalizeProductPage(data)?.content || [];

        if (pageNumber === 0) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const unique = newProducts.filter((p) => !existing.has(p.id));
            return [...prev, ...unique];
          });
        }

        setPage(typeof data?.page === 'number' ? data.page : pageNumber);
        setLast(Boolean(data?.last));
      } catch (err) {
        if (pageNumber === 0) setProducts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    setLast(false);
    fetchProducts(0, true);
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing || last) return;
    fetchProducts(page + 1);
  };

  const renderProductItem = useCallback(
    ({ item }) => <ProductCard product={item} cardWidth={layout.cardWidth} />,
    [layout.cardWidth]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title={title}
        subtitle={products.length > 0 ? `${products.length}+ products available` : 'Catalog'}
        showBack
      />

      {loading && products.length === 0 ? (
        <View style={styles.skeletonGrid}>
          <ProductCardSkeleton cardWidth={layout.cardWidth} />
          <ProductCardSkeleton cardWidth={layout.cardWidth} />
          <ProductCardSkeleton cardWidth={layout.cardWidth} />
          <ProductCardSkeleton cardWidth={layout.cardWidth} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id || item.publicId || Math.random())}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[styles.listContent, { paddingBottom: 60 }]}
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
              <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontWeight: typography.weights.extrabold },
                ]}
              >
                No Products in {title}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                We're currently restocking items for this category. Check back soon!
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
                <Text style={styles.shopBtnText}>Browse All Products</Text>
              </AnimatedPressable>
            </View>
          }
          ListFooterComponent={
            loadingMore && !last ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
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
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
