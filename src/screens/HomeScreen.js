import React, { useRef, useEffect, useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const categories = [
    { name: 'Mobiles', icon: 'cellphone', screen: 'Mobiles' },
    { name: 'Grocery', icon: 'cart', screen: 'Grocery' },
    { name: 'Fruits', icon: 'food-apple', screen: 'Fruits' },
    { name: 'Electricals', icon: 'flash', screen: 'Electricals' },
  ];

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Your Bearer token
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJUIiwibGFzdE5hbWUiOiJUZXN0aW5nIiwicm9sZSI6IlJPTEVfQURNSU4iLCJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc1NTQ3OTg3MywiZXhwIjoxNzU1NTY2MjczfQ.jlZ7d61zIYdX28vDiFPrNmsKCttlF1BYcSQG3BlCEQ4';

  // Fetch ads from backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get(
          'https://sdcart-backend-1.onrender.com/api/ads',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('API Response:', res.data); // 👈 check structure

        // Some APIs return {ads: [...]}, some directly return [...]
        const adsData = Array.isArray(res.data) ? res.data : res.data.ads || [];

        setAds(adsData);
        setLoading(false);
      } catch (err) {
        console.log('Error fetching ads:', err.message);
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Top banner
  const scrollRefTop = useRef(null);
  const [currentIndexTop, setCurrentIndexTop] = useState(0);

  // Bottom banner
  const scrollRefBottom = useRef(null);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Auto-slide top
  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => {
      const nextIndex = (currentIndexTop + 1) % ads.length;
      scrollRefTop.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndexTop(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndexTop, ads]);

  // Auto-slide bottom
  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => {
      const nextIndex = (currentIndexBottom + 1) % ads.length;
      scrollRefBottom.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndexBottom(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndexBottom, ads]);

  // Scroll handlers
  const handleScrollTop = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setCurrentIndexTop(Math.round(offsetX / width));
  };
  const handleScrollBottom = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setCurrentIndexBottom(Math.round(offsetX / width));
  };

  // Show loader while fetching
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#333' }}>
          Loading, please wait...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Top Auto-sliding ad banner */}
      <ScrollView
        ref={scrollRefTop}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScrollTop}
        scrollEventThrottle={16}
        style={styles.adContainer}
      >
        {ads.map((ad) => (
          <Image
            key={ad.id}
            source={{ uri: ad.imageUrl }}
            style={styles.adImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Pagination dots (top) */}
      <View style={styles.pagination}>
        {ads.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndexTop === index ? styles.activeDot : null]}
          />
        ))}
      </View>

      {/* Category grid */}
      <View style={styles.grid}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryButton}
            onPress={() => navigation.navigate(cat.screen)}
          >
            <Icon name={cat.icon} size={40} color="blue" />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Auto-sliding ad banner */}
      <ScrollView
        ref={scrollRefBottom}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScrollBottom}
        scrollEventThrottle={16}
        style={[styles.adContainer, { marginTop: 15 }]}
      >
        {ads.map((ad) => (
          <Image
            key={ad.id}
            source={{ uri: ad.imageUrl }}
            style={styles.adImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Pagination dots (bottom) */}
      <View style={styles.pagination}>
        {ads.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndexBottom === index ? styles.activeDot : null]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b7dafdff' },
  adContainer: { marginTop: 10, height: 150, marginHorizontal:20 },
  adImage: { width: width, height: 170, borderRadius:10},
  pagination: { flexDirection: 'row', justifyContent: 'center', marginVertical: 5 },
  dot: { height: 5, width: 5, borderRadius: 4, backgroundColor: 'black', marginHorizontal: 4 },
  activeDot: { backgroundColor: 'white', width: 5, height: 5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 0,
    paddingVertical: 10,
  },
  categoryButton: {
    width: 120,
    height: 80,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryText: { marginTop: 8, fontSize: 14, fontWeight: '500' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7dafdff',
  },
});
