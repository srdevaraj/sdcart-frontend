// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_URL = 'https://sdcart-backend-1.onrender.com/products/search';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJUIiwibGFzdE5hbWUiOiJUZXN0aW5nIiwicm9sZSI6IlJPTEVfQURNSU4iLCJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc1NTMyNjEzOCwiZXhwIjoxNzU1NDEyNTM4fQ.adB-IJyoxJ2C02POca3u3Kr4xi0Utrx4YgNaOGXBqpU';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 20;

export default function SearchScreen() {
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart();

  const handleSearch = async () => {
    if (!category.trim()) return; // Don't search if empty

    setLoading(true);
    try {
      const params = { category: category.trim() };
      if (minPrice.trim()) params.minPrice = minPrice.trim();
      if (maxPrice.trim()) params.maxPrice = maxPrice.trim();

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        params
      });

      setProducts(response.data.content || []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Category search bar + Apply button */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Enter category (e.g. Mobiles)"
            value={category}
            onChangeText={setCategory}
            style={styles.inputExpanded}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Min & Max Price */}
        <View style={styles.priceRow}>
          <TextInput
            placeholder="Min Price"
            value={minPrice}
            onChangeText={setMinPrice}
            style={styles.priceInput}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Max Price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            style={styles.priceInput}
            keyboardType="numeric"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                <Text style={{ fontSize: 16, color: '#999' }}>No products found. Try another search.</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  searchContainer: { padding: 12, paddingTop: 30, backgroundColor: '#fff' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputExpanded: { 
    flex: 1, 
    borderRadius: 8, 
    backgroundColor: '#eee', 
    paddingHorizontal: 12, 
    fontSize: 16, 
    height: 45 
  },
  searchBtn: { 
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  priceInput: { 
    flex: 1,
    borderRadius: 8, 
    backgroundColor: '#eee', 
    paddingHorizontal: 12, 
    fontSize: 14, 
    height: 45,
    marginRight: 8
  },
  list: { padding: 10, paddingTop: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3
  },
  image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, textAlign: 'center' },
  price: { fontSize: 14, color: '#e91e63', fontWeight: '700', marginBottom: 6 },
  cartButton: { backgroundColor: '#ff9800', paddingVertical: 6, borderRadius: 6, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
