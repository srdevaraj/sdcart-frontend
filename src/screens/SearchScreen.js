// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const BASE_URL = 'https://sdcart-backend-1.onrender.com/products';
const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJUIiwibGFzdE5hbWUiLCJyb2xlIjoiUk9MRV9BRE1JTiIsInN1YiI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU1NzY2NjcxLCJleHAiOjE3NTU4NTMwNzF9.xkEsd_Zk9QsaGou5n3EM_NIazm8A5wnCFpaoDmwZsaY';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 20;

export default function SearchScreen() {
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState(null); // ✅ Track selected price option
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart();

  const handleSearch = async () => {
    if (!category && !brand && !priceRange) return;

    setLoading(true);
    try {
      let url = `${BASE_URL}/search?query=`;
      if (brand) url += `&brand=${brand}`;
      if (category) url += `&category=${category}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });

      let fetchedProducts = response.data?.content || [];

      // ✅ Apply price filter
      if (priceRange) {
        const { min, max } = priceRange;
        fetchedProducts = fetchedProducts.filter((p) => {
          if (min !== null && p.price < min) return false;
          if (max !== null && p.price > max) return false;
          return true;
        });
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('❌ Filter search error:', error.response?.data || error.message);
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
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      )}
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.price}>₹{item.price}</Text>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  // ✅ Price ranges for radio buttons
  const priceOptions = [
    { label: 'Under ₹1000', min: 0, max: 1000 },
    { label: '₹1000 - ₹5000', min: 1000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: null },
  ];

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        {/* Category + Brand Row */}
        <View style={styles.row}>
          {/* Category Dropdown */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Category" value="" />
              <Picker.Item label="Mobile" value="Mobile" />
              <Picker.Item label="Laptop" value="Laptop" />
              <Picker.Item label="Clothes" value="Clothes" />
            </Picker>
          </View>

          {/* Brand Dropdown */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={brand}
              onValueChange={(value) => setBrand(value)}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Brand" value="" />
              <Picker.Item label="Realme" value="Realme" />
              <Picker.Item label="Redmi" value="Redmi" />
              <Picker.Item label="Samsung" value="Samsung" />
            </Picker>
          </View>
        </View>

        {/* ✅ Price Range Radio Buttons */}
        <View style={styles.priceChipsRow}>
          {priceOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                priceRange?.label === option.label && styles.selectedChip,
              ]}
              onPress={() => setPriceRange(option)}
            >
              <Text
                style={[
                  styles.chipText,
                  priceRange?.label === option.label && styles.selectedChipText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Apply Filters */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 50 }}
        />
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
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 50,
                }}
              >
                <Text style={{ fontSize: 16, color: '#999' }}>
                  No products found. Try another filter.
                </Text>
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
  filterContainer: { padding: 12, paddingTop: 30, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    minHeight: 50,
  },
  priceChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  chip: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedChip: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBtn: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: { padding: 10, paddingTop: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '700',
    marginBottom: 6,
  },
  cartButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
