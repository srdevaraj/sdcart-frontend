import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCartAPI } from '../api/cartApi';

const BASE_URL = 'https://sdcart-backend-1.onrender.com/products';

// Wrap TextInput with Animated
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animated values
  const heightAnim = useRef(new Animated.Value(50)).current;
  const fontAnim = useRef(new Animated.Value(15)).current;

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) {
      Alert.alert('Search', 'Please type something to search');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(response.data.content || []);
    } catch (err) {
      console.log('Search error:', err.message);
      Alert.alert('Search Failed', 'No products found');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CART ================= */
  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      await addToCartAPI(product.id, 1);
      Alert.alert('Success', 'Product added to cart');
    } catch (err) {
      console.log('Add to cart error:', err.message);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setAddingToCartId(null);
    }
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SelectedProduct', { id: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.price}>₹{item.price}</Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
          disabled={addingToCartId === item.id}
        >
          {addingToCartId === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* 🔍 SEARCH BAR */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#777" />

          <AnimatedTextInput
            placeholder="Search products"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            onFocus={() => {
              setIsFocused(true);
              Animated.parallel([
                Animated.spring(heightAnim, { toValue: 70, useNativeDriver: false }),
                Animated.spring(fontAnim, { toValue: 18, useNativeDriver: false }),
              ]).start();
            }}
            onBlur={() => {
              setIsFocused(false);
              Animated.parallel([
                Animated.spring(heightAnim, { toValue: 50, useNativeDriver: false }),
                Animated.spring(fontAnim, { toValue: 15, useNativeDriver: false }),
              ]).start();
            }}
            style={[styles.searchInput, { height: heightAnim, fontSize: fontAnim }]}
          />
        </View>

        {/* RESULTS */}
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products found</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 10,
    marginTop: '-10%',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
    marginVertical: 4,
  },

  cartButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
  },

  cartText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: '#999',
  },
});
