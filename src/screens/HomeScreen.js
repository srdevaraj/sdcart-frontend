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

import axios from 'axios';

const {
  width,
} = Dimensions.get('window');

// ============================================================
// CONSTANTS
// ============================================================

const API_URL =
  'https://sdcart-backend-1.onrender.com/api/ads';

const categories = [
  {
    name: 'Mobiles',
    icon: 'cellphone',
    screen: 'Mobiles',
    colors: [
      '#667eea',
      '#764ba2',
    ],
  },

  {
    name: 'Grocery',
    icon: 'cart',
    screen: 'Grocery',
    colors: [
      '#11998e',
      '#38ef7d',
    ],
  },

  {
    name: 'Fruits',
    icon: 'food-apple',
    screen: 'Fruits',
    colors: [
      '#f7971e',
      '#ffd200',
    ],
  },

  {
    name: 'Electricals',
    icon: 'flash',
    screen: 'ElectricalsModule',
    colors: [
      '#ff512f',
      '#dd2476',
    ],
  },
];

export default function HomeScreen({
  navigation,
}) {

  // ==========================================================
  // STATES
  // ==========================================================

  const [
    ads,
    setAds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const scrollRef =
    useRef(null);

  // ==========================================================
  // FETCH ADS
  // ==========================================================

  useEffect(() => {

    const fetchAds =
      async () => {

        try {

          const response =
            await axios.get(
              API_URL
            );

          const adsData =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data.ads || [];

          setAds(
            adsData
          );

        } catch (error) {

          console.log(
            'Ads Fetch Error:',
            error.message
          );

        } finally {

          setLoading(false);

        }

      };

    fetchAds();

  }, []);

  // ==========================================================
  // AUTO SLIDER
  // ==========================================================

  useEffect(() => {

    if (
      ads.length <= 1
    ) {
      return;
    }

    const interval =
      setInterval(() => {

        const nextIndex =
          (
            currentIndex + 1
          ) % ads.length;

        scrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });

        setCurrentIndex(
          nextIndex
        );

      }, 4000);

    return () =>
      clearInterval(
        interval
      );

  }, [
    currentIndex,
    ads,
  ]);

  // ==========================================================
  // BANNER SCROLL HANDLER
  // ==========================================================

  const handleScroll =
    (event) => {

      const offset =
        event.nativeEvent
          .contentOffset.x;

      const index =
        Math.round(
          offset / width
        );

      setCurrentIndex(
        index
      );

    };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <LinearGradient
        colors={[
          '#141E30',
          '#243B55',
        ]}
        style={
          styles.loader
        }
      >

        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

        <Text
          style={
            styles.loadingText
          }
        >
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
      style={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* ======================================================
          HEADER
          ====================================================== */}

      <LinearGradient
        colors={[
          '#141E30',
          '#243B55',
        ]}
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerRow
          }
        >

          <View>

            <Text
              style={
                styles.welcome
              }
            >
              Hello 👋
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Shop Smart, Live Better
            </Text>

          </View>

        </View>

        {/* ====================================================
            SEARCH
            ==================================================== */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.searchBox
          }
          onPress={() =>
            navigation.navigate(
              'Search'
            )
          }
        >

          <Ionicons
            name="search"
            size={22}
            color="#667085"
          />

          <Text
            style={
              styles.searchText
            }
          >
            Search products...
          </Text>

        </TouchableOpacity>

      </LinearGradient>

      {/* ======================================================
          OFFER BANNER
          ====================================================== */}

      {
        ads.length > 0 && (

          <>

            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={
                false
              }
              onScroll={
                handleScroll
              }
              scrollEventThrottle={16}
            >

              {
                ads.map(
                  (ad) => (

                    <Image
                      key={ad.id}
                      source={{
                        uri: ad.imageUrl,
                      }}
                      resizeMode="cover"
                      style={
                        styles.banner
                      }
                    />

                  )
                )
              }

            </ScrollView>

            <View
              style={
                styles.pagination
              }
            >

              {
                ads.map(
                  (_, index) => (

                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentIndex === index &&
                          styles.activeDot,
                      ]}
                    />

                  )
                )
              }

            </View>

          </>

        )
      }

      {/* ======================================================
          CATEGORY HEADER
          ====================================================== */}

      <View
        style={
          styles.sectionHeader
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Categories
        </Text>

        <Text
          style={
            styles.viewAll
          }
        >
          View All
        </Text>

      </View>

      {/* ======================================================
          CATEGORY CARDS
          ====================================================== */}

      <View
        style={
          styles.categoryGrid
        }
      >

        {
          categories.map(
            (item, index) => (

              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate(
                    item.screen
                  )
                }
              >

                <LinearGradient
                  colors={
                    item.colors
                  }
                  style={
                    styles.categoryCard
                  }
                >

                  <View
                    style={
                      styles.iconContainer
                    }
                  >

                    <MaterialCommunityIcons
                      name={
                        item.icon
                      }
                      size={36}
                      color="#111827"
                    />

                  </View>

                  <Text
                    style={
                      styles.categoryText
                    }
                  >
                    {item.name}
                  </Text>

                </LinearGradient>

              </TouchableOpacity>

            )
          )
        }

      </View>

      {/* ======================================================
          FEATURE OFFER CARD
          ====================================================== */}

      {
        ads.length > 0 && (

          <View
            style={
              styles.featureCard
            }
          >

            <Image
              source={{
                uri:
                  ads[0].imageUrl,
              }}
              resizeMode="cover"
              style={
                styles.featureImage
              }
            />

            <LinearGradient
              colors={[
                'transparent',
                'rgba(0,0,0,0.75)',
              ]}
              style={
                styles.overlay
              }
            />

            <View
              style={
                styles.featureContent
              }
            >

              <Text
                style={
                  styles.featureTitle
                }
              >
                Special Offers
              </Text>

              <Text
                style={
                  styles.featureSubtitle
                }
              >
                Grab the best deals today
              </Text>

            </View>

          </View>

        )
      }

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