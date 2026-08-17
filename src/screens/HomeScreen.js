import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import {
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import { getCategories } from '../services/categoryService';
import { getProducts, primaryImage } from '../services/productService';

const {
  width,
} = Dimensions.get('window');

// ============================================================
// CATEGORY SCREEN MAPPING
// ============================================================
//
// The backend defines its own catalog categories (Electronics, Clothing,
// Home & Kitchen, Sports). Each is mapped to one of the existing category
// screens by keyword; the screen renders whatever slug/title it receives,
// so users always see the real category name.

const CATEGORY_PRESETS = [
  {
    keywords: ['electron', 'mobile', 'phone', 'gadget'],
    screen: 'Mobiles',
    icon: 'cellphone',
    colors: ['#667eea', '#764ba2'],
  },
  {
    keywords: ['cloth', 'fashion', 'apparel', 'wear'],
    screen: 'Fruits',
    icon: 'tshirt-crew',
    colors: ['#f7971e', '#ffd200'],
  },
  {
    keywords: ['home', 'kitchen', 'grocery', 'food'],
    screen: 'Grocery',
    icon: 'cart',
    colors: ['#11998e', '#38ef7d'],
  },
  {
    keywords: ['sport', 'fit', 'outdoor'],
    screen: 'ElectricalsModule',
    icon: 'dumbbell',
    colors: ['#ff512f', '#dd2476'],
  },
];

function presetForCategory(category) {
  const haystack = `${category.name} ${category.slug}`.toLowerCase();
  return (
    CATEGORY_PRESETS.find((preset) =>
      preset.keywords.some((keyword) => haystack.includes(keyword))
    ) || CATEGORY_PRESETS[0]
  );
}

export default function HomeScreen({
  navigation,
}) {

  // ==========================================================
  // STATES
  // ==========================================================

  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [categoryList, featuredPage] = await Promise.all([
          getCategories(),
          getProducts({ featured: true, size: 5 }),
        ]);
        setCategories(Array.isArray(categoryList) ? categoryList : []);
        setFeatured(featuredPage?.content || []);
      } catch (error) {
        // Non-fatal: the screen degrades to just the header + search.
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // ==========================================================
  // AUTO SLIDER
  // ==========================================================

  useEffect(() => {
    if (featured.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % featured.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, featured]);

  // ==========================================================
  // BANNER SCROLL HANDLER
  // ==========================================================

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);
    setCurrentIndex(index);
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <LinearGradient
        colors={['#141E30', '#243B55']}
        style={styles.loader}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>
          Preparing your shopping experience...
        </Text>
      </LinearGradient>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ======================================================
          HEADER
          ====================================================== */}

      <LinearGradient
        colors={['#141E30', '#243B55']}
        style={styles.header}
      >

        <View style={styles.headerRow}>

          <View>

            <Text style={styles.welcome}>
              Hello 👋
            </Text>

            <Text style={styles.title}>
              Shop Smart, Live Better
            </Text>

          </View>

        </View>

        {/* ====================================================
            SEARCH
            ==================================================== */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBox}
          onPress={() => navigation.navigate('Search')}
        >

          <Ionicons name="search" size={22} color="#667085" />

          <Text style={styles.searchText}>
            Search products...
          </Text>

        </TouchableOpacity>

      </LinearGradient>

      {/* ======================================================
          FEATURED PRODUCTS BANNER
          ====================================================== */}

      {featured.length > 0 && (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {featured.map((product) => (
              <TouchableOpacity
                key={product.publicId}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('SelectedProduct', {
                    id: product.publicId,
                  })
                }
              >
                <Image
                  source={{ uri: primaryImage(product) }}
                  resizeMode="cover"
                  style={styles.banner}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            {featured.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </>
      )}

      {/* ======================================================
          CATEGORY HEADER
          ====================================================== */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Categories
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>

      </View>

      {/* ======================================================
          CATEGORY CARDS
          ====================================================== */}

      <View style={styles.categoryGrid}>

        {categories.map((category, index) => {
          const preset = presetForCategory(category);

          return (
            <TouchableOpacity
              key={category.publicId || index}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(preset.screen, {
                  slug: category.slug,
                  title: category.name,
                })
              }
            >

              <LinearGradient
                colors={preset.colors}
                style={styles.categoryCard}
              >

                <View style={styles.iconContainer}>

                  <MaterialCommunityIcons
                    name={preset.icon}
                    size={36}
                    color="#111827"
                  />

                </View>

                <Text style={styles.categoryText}>
                  {category.name}
                </Text>

              </LinearGradient>

            </TouchableOpacity>
          );
        })}

      </View>

      {/* ======================================================
          FEATURE OFFER CARD
          ====================================================== */}

      {featured.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() =>
            navigation.navigate('SelectedProduct', {
              id: featured[0].publicId,
            })
          }
        >
          <View style={styles.featureCard}>

            <Image
              source={{ uri: primaryImage(featured[0]) }}
              resizeMode="cover"
              style={styles.featureImage}
            />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.overlay}
            />

            <View style={styles.featureContent}>

              <Text style={styles.featureTitle}>
                Special Offers
              </Text>

              <Text style={styles.featureSubtitle}>
                {featured[0].name || 'Grab the best deals today'}
              </Text>

            </View>

          </View>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // ROOT
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 28,

    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '500',
  },

  title: {
    marginTop: 6,

    fontSize: 27,

    fontWeight: '900',

    color: '#FFFFFF',

    letterSpacing: 0.3,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchBox: {
    height: 54,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    marginTop: 25,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 18,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 8,

    elevation: 4,
  },

  searchText: {
    marginLeft: 12,

    color: '#98A2B3',

    fontSize: 15,

    fontWeight: '500',
  },

  // ==========================================================
  // BANNER SLIDER
  // ==========================================================

  banner: {
    width: width - 32,

    height: 190,

    marginHorizontal: 16,

    marginTop: 20,

    borderRadius: 26,
  },

  pagination: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 12,
  },

  dot: {
    width: 8,

    height: 8,

    borderRadius: 10,

    backgroundColor: '#CBD5E1',

    marginHorizontal: 4,
  },

  activeDot: {
    width: 28,

    backgroundColor: '#FF6B00',
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginHorizontal: 20,

    marginTop: 32,
  },

  sectionTitle: {
    fontSize: 23,

    fontWeight: '900',

    color: '#101828',
  },

  viewAll: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FF6B00',
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  categoryGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'center',

    marginTop: 18,
  },

  categoryCard: {
    width: (width - 70) / 2,

    height: 135,

    margin: 8,

    borderRadius: 26,

    justifyContent: 'center',

    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.15,

    shadowRadius: 10,

    elevation: 6,
  },

  iconContainer: {
    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',

    alignItems: 'center',
  },

  categoryText: {
    marginTop: 12,

    fontSize: 16,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  // ==========================================================
  // FEATURE OFFER CARD
  // ==========================================================

  featureCard: {
    height: 180,

    marginHorizontal: 20,

    marginTop: 25,

    marginBottom: 30,

    borderRadius: 28,

    overflow: 'hidden',
  },

  featureImage: {
    width: '100%',

    height: '100%',
  },

  overlay: {
    position: 'absolute',

    left: 0,

    right: 0,

    top: 0,

    bottom: 0,
  },

  featureContent: {
    position: 'absolute',

    left: 22,

    bottom: 22,
  },

  featureTitle: {
    fontSize: 24,

    fontWeight: '900',

    color: '#FFFFFF',
  },

  featureSubtitle: {
    marginTop: 6,

    fontSize: 14,

    color: '#E5E7EB',

    fontWeight: '500',
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loader: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,

    color: '#FFFFFF',

    fontSize: 16,

    fontWeight: '700',
  },

});
