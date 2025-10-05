// ✅ FULLY MERGED SearchScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { addToCartAPI } from '../api/cartApi'; // ✅ same logic as ProductScreen

const BASE_URL = 'https://sdcart-backend-1.onrender.com/products';
const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJUIiwibGFzdE5hbWUiLCJyb2xlIjoiUk9MRV9BRE1JTiIsInN1YiI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU1NzY2NjcxLCJleHAiOjE3NTU4NTMwNzF9.xkEsd_Zk9QsaGou5n3EM_NIazm8A5wnCFpaoDmwZsaY';

// ✅ Format helper
const formatK = (num) => {
  if (num === null) return '';
  return num >= 1000 ? `${num / 1000}k` : num.toString();
};

export default function SearchScreen({ navigation }) {
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const { addToCart } = useCart();

  // ✅ Price options
  const priceOptions = useMemo(() => {
    if (category === 'Mobile') {
      return [
        { label: `Under ₹${formatK(10000)}`, min: 0, max: 10000 },
        { label: `₹${formatK(10000)} - ₹${formatK(20000)}`, min: 10000, max: 20000 },
        { label: `Above ₹${formatK(20000)}`, min: 20000, max: null },
      ];
    } else if (category === 'Laptop') {
      return [
        { label: `Under ₹${formatK(15000)}`, min: 0, max: 15000 },
        { label: `₹${formatK(15000)} - ₹${formatK(25000)}`, min: 15000, max: 25000 },
        { label: `Above ₹${formatK(25000)}`, min: 25000, max: null },
      ];
    } else if(category === 'grocery'){
      return [
        { label: `Under ₹${formatK(30)}`, min: 0, max: 30 },
        { label: `₹${formatK(30)} - ₹${formatK(50)}`, min: 30, max: 50 },
        { label: `Above ₹${formatK(50)}`, min: 50, max: null },
      ];
    } else if(category === 'electricals'){
      return [
        { label: `Under ₹${formatK(1000)}`, min: 0, max: 1000 },
        { label: `₹${formatK(1000)} - ₹${formatK(5000)}`, min: 1000, max: 5000 },
        { label: `Above ₹${formatK(5000)}`, min: 5000, max: null },
      ];
    }else if(category === 'fruits'){
      return [
        { label: `Under ₹${formatK(200)}`, min: 0, max: 200 },
        { label: `₹${formatK(200)} - ₹${formatK(300)}`, min: 200, max: 300 },
        { label: `Above ₹${formatK(300)}`, min: 300, max: null },
      ];
    }else {
      return [
        { label: `Under ₹${formatK(1000)}`, min: 0, max: 1000 },
        { label: `₹${formatK(1000)} - ₹${formatK(5000)}`, min: 1000, max: 5000 },
        { label: `Above ₹${formatK(5000)}`, min: 5000, max: null },
      ];
    }
  }, [category]);

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

  // ✅ Same as ProductScreen
  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      await addToCartAPI(product.id, 1);
      Alert.alert("Success", "Product added to cart.");
    } catch (error) {
      console.error("❌ Add to cart failed:", error);
      Alert.alert("Error", error.message || "Failed to add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('SelectedProduct', { product: item, id: item.id })}
  >
    <Image source={{ uri: item.imageUrl }} style={styles.image} />

    <View style={styles.details}>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.reviews}>⭐⭐⭐⭐ (120)</Text>
      <Text style={styles.price}>₹{item.price}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
          disabled={addingToCartId === item.id}
        >
          {addingToCartId === item.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => navigation.navigate('OrderScreen', { product: item })}
        >
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {/* ✅ Restored Filter UI */}
      <View style={styles.filterContainer}>
        {showFilters && (
          <>
            <View style={styles.row}>
              {/* Category */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setPriceRange(null);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#333"
                >
                  <Picker.Item label="Category" value="" />
                  <Picker.Item label="Mobile" value="Mobile" />
                  <Picker.Item label="Laptop" value="Laptop" />
                  <Picker.Item label="Clothes" value="Clothes" />
                  <Picker.Item label="Grocery" value="grocery" />
                  <Picker.Item label="Electricals" value="electricals" />
                  <Picker.Item label="Fruits" value="fruits" />
                </Picker>
              </View>

              {/* Brand */}
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

            {/* Price Chips */}
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
          </>
        )}

        {/* Toggle button */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Ionicons
            name={showFilters ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={26}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          key="list"
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No products found. Try another filter.</Text>
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
  picker: { width: '100%', minHeight: 50 },
  priceChipsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  chip: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
  },
  chipText: { fontSize: 13, color: '#333' },
  selectedChip: { backgroundColor: '#007bff', borderColor: '#007bff' },
  selectedChipText: { color: '#fff', fontWeight: 'bold' },
  searchBtn: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  toggleBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  list: { padding: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    elevation: 2,
  },
  image: { width: 120, height: 120, borderRadius: 6, marginRight: 10 },
  details: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  reviews: { fontSize: 13, color: '#777', marginBottom: 4 },
  price: { fontSize: 16, color: '#e91e63', fontWeight: '700', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cartButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: '#999' },
});
