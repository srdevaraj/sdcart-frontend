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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
const { width } = Dimensions.get('window');
export default function HomeScreen({ navigation }) {
  const categories = [
    {
      name: 'Mobiles',
      icon: 'cellphone',
      screen: 'Mobiles',
      colors: ['#667eea', '#764ba2']
    },
    {
      name: 'Grocery',
      icon: 'cart',
      screen: 'Grocery',
      colors: ['#11998e', '#38ef7d']
    },
    {
      name: 'Fruits',
      icon: 'food-apple',
      screen: 'Fruits',
      colors: ['#f7971e', '#ffd200']
    },
    {
      name: 'Electricals',
      icon: 'flash',
      screen: 'ElectricalsModule',
      colors: ['#ff512f', '#dd2476']
    },
  ];
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = 'YOUR_TOKEN_HERE';
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(
          'https://sdcart-backend-1.onrender.com/api/ads',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const adsData = Array.isArray(response.data)
          ? response.data
          : response.data.ads || [];
        setAds(adsData);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => {
      const next =
        (currentIndex + 1) % ads.length;
      scrollRef.current?.scrollTo({
        x: next * width,
        animated: true
      });
      setCurrentIndex(next);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex, ads]);
  const handleScroll = (event) => {
    const offset =
      event.nativeEvent.contentOffset.x;
    setCurrentIndex(
      Math.round(offset / width)
    );
  };
  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loader}
      >
        <ActivityIndicator
          size="large"
          color="#fff"
        />
        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </LinearGradient>
    );
  }
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#141e30', '#243b55']}
        style={styles.header}
      >
        <Text style={styles.welcome}>
          Welcome Back 👋
        </Text>
        <Text style={styles.title}>
          Shop Smart, Live Better
        </Text>
      </LinearGradient>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {
          ads.map((ad) => (
            <Image
              key={ad.id}
              source={{
                uri: ad.imageUrl
              }}
              style={styles.banner}
              resizeMode="cover"
            />
          ))
        }
      </ScrollView>
      <View style={styles.pagination}>
        {
          ads.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index &&
                styles.activeDot
              ]}
            />
          ))
        }
      </View>
      <Text style={styles.sectionTitle}>
        Categories
      </Text>
      <View style={styles.categoryGrid}>
        {
          categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(item.screen)
              }
            >
              <LinearGradient
                colors={item.colors}
                style={styles.categoryCard}
              >
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={40}
                    color="#333"
                  />
                </View>
                <Text style={styles.categoryText}>
                  {item.name}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))
        }
      </View>
      {
        ads.length > 0 &&
        <Image
          source={{
            uri: ads[0].imageUrl
          }}
          style={styles.bottomBanner}
          resizeMode="cover"
        />
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb'
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcome: {
    color: '#ddd',
    fontSize: 16
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5
  },
  banner: {
    width: width - 30,
    height: 170,
    margin: 15,
    borderRadius: 25
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#bbb',
    margin: 5
  },
  activeDot: {
    width: 25,
    backgroundColor: '#667eea'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 25
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15
  },
  categoryCard: {
    width: 150,
    height: 120,
    margin: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryText: {
    marginTop: 10,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  bottomBanner: {
    width: width - 40,
    height: 140,
    margin: 20,
    borderRadius: 25
  },
  
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 15
  }
});