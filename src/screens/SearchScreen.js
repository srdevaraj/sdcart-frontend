// src/screens/SearchScreen.js
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getProducts } from '../services/productService';
import { normalizeProductPage } from '../services/normalizers';
import { useTheme } from '../theme';
import { ProductCard } from '../components/common/ProductCard';
import { AnimatedPressable } from '../components/common/AnimatedPressable';

const SEARCH_HISTORY_KEY = '@sdcart_search_history';
const SEARCH_DELAY = 400;

const SUGGESTIONS = [
  'Mobile',
  'Laptop',
  'Shoes',
  'Headphones',
  'Watch',
  'Smart TV',
  'Apparel',
  'Grocery',
];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, layout, isDark } = useTheme();

  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  const inputRef = useRef(null);

  // Load search history on mount
  useEffect(() => {
    AsyncStorage.getItem(SEARCH_HISTORY_KEY)
      .then((stored) => {
        if (stored) setSearchHistory(JSON.parse(stored));
      })
      .catch(() => {});
  }, []);

  const saveSearchHistory = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) return;
    const clean = keyword.trim();
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    AsyncStorage.removeItem(SEARCH_HISTORY_KEY).catch(() => {});
  }, []);

  const fetchSearchResults = useCallback(async (keyword, pageNum = 0) => {
    if (!keyword || !keyword.trim()) return;

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getProducts({
        q: keyword.trim(),
        page: pageNum,
        size: 20,
        signal: abortController.current.signal,
      });

      const content = normalizeProductPage(result)?.content || [];

      if (pageNum === 0) {
        setProducts(content);
      } else {
        setProducts((prev) => [...prev, ...content]);
      }

      setPage(pageNum);
      setHasMore(!result?.last);
    } catch (e) {
      if (e?.code !== 'ERR_CANCELED') {
        if (pageNum === 0) setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const query = searchText.trim();
    if (!query) {
      setProducts([]);
      setShowHistory(true);
      return;
    }

    setShowHistory(false);
    debounceTimer.current = setTimeout(() => {
      fetchSearchResults(query, 0);
      saveSearchHistory(query);
    }, SEARCH_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText, fetchSearchResults, saveSearchHistory]);

  const handleSelectKeyword = (keyword) => {
    setSearchText(keyword);
    Keyboard.dismiss();
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore && products.length > 0) {
      fetchSearchResults(searchText, page + 1);
    }
  };

  const renderProductItem = useCallback(
    ({ item }) => <ProductCard product={item} cardWidth={layout.cardWidth} />,
    [layout.cardWidth]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Search Bar Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
            ...shadows.xs,
          },
        ]}
      >
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle }]}
          haptic="light"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : '#F1F5F9',
              borderRadius: radius.xl,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            placeholder="Search products, brands..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoFocus
          />
          {searchText.length > 0 && (
            <AnimatedPressable
              onPress={() => setSearchText('')}
              style={styles.clearBtn}
              scaleTo={0.88}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {/* History & Suggestions OR Results */}
      {showHistory ? (
        <View style={styles.historyContainer}>
          {searchHistory.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
                  Recent Searches
                </Text>
                <AnimatedPressable onPress={clearHistory} scaleTo={0.92}>
                  <Text style={[styles.clearText, { color: colors.danger, fontWeight: typography.weights.semibold }]}>
                    Clear
                  </Text>
                </AnimatedPressable>
              </View>

              <View style={styles.chipsWrap}>
                {searchHistory.map((item, idx) => (
                  <AnimatedPressable
                    key={idx}
                    onPress={() => handleSelectKeyword(item)}
                    scaleTo={0.94}
                    haptic="selection"
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.chipText, { color: colors.text }]}>{item}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          )}

          {/* Trending Suggestions */}
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Popular Suggestions
            </Text>

            <View style={styles.chipsWrap}>
              {SUGGESTIONS.map((item, idx) => (
                <AnimatedPressable
                  key={idx}
                  onPress={() => handleSelectKeyword(item)}
                  scaleTo={0.94}
                  haptic="selection"
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={[styles.chipText, { color: colors.text }]}>{item}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
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
          ListHeaderComponent={
            <View style={styles.resultsCountHeader}>
              <Text style={[styles.resultsCountText, { color: colors.textSecondary }]}>
                {loading ? 'Searching...' : `Found ${products.length} matching products`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <Ionicons name="search-outline" size={64} color={colors.textMuted} />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: colors.text, fontWeight: typography.weights.extrabold },
                  ]}
                >
                  No Results Found
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  We couldn't find anything for "{searchText}". Try checking for typos or broader keywords.
                </Text>
              </View>
            ) : (
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingCenterText, { color: colors.textSecondary }]}>
                  Searching sdCart...
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  historyContainer: {
    padding: 16,
  },
  historySection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
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
  resultsCountHeader: {
    paddingBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
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
  },
  loadingCenter: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingCenterText: {
    marginTop: 12,
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});