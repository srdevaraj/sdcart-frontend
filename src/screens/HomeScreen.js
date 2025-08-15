// src/screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const categories = [
    { name: 'Mobiles', icon: 'cellphone', screen: 'Mobiles' },
    { name: 'Grocery', icon: 'cart', screen: 'Grocery' },
    { name: 'Fruits', icon: 'food-apple', screen: 'Fruits' },
    { name: 'Electricals', icon: 'flash', screen: 'Electricals' },
  ];

  const ads = [
    require('../../assets/ad1.jpg'),
    require('../../assets/ad2.jpg'),
    require('../../assets/ad3.jpg'),
  ];

  // For top banner
  const scrollRefTop = useRef(null);
  const [currentIndexTop, setCurrentIndexTop] = useState(0);

  // For bottom banner
  const scrollRefBottom = useRef(null);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Auto-slide top
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndexTop + 1) % ads.length;
      scrollRefTop.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndexTop(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndexTop]);

  // Auto-slide bottom
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndexBottom + 1) % ads.length;
      scrollRefBottom.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndexBottom(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndexBottom]);

  // Handle scroll for top
  const handleScrollTop = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndexTop(index);
  };

  // Handle scroll for bottom
  const handleScrollBottom = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndexBottom(index);
  };

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
        {ads.map((image, index) => (
          <Image
            key={index}
            source={image}
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
            style={[
              styles.dot,
              currentIndexTop === index ? styles.activeDot : null
            ]}
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
        {ads.map((image, index) => (
          <Image
            key={index}
            source={image}
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
            style={[
              styles.dot,
              currentIndexBottom === index ? styles.activeDot : null
            ]}
          />
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  adContainer: {
    marginTop: 10,
    height: 150,
  },
  adImage: {
    width: width,
    height: 170,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'blue',
    width: 5,
    height: 5,
  },
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
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
