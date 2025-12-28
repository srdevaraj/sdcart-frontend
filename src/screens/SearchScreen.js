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
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCartAPI } from '../api/cartApi';

const BASE_URL = 'https://sdcart-backend-1.onrender.com/products';

const formatK = (num) => (num >= 1000 ? `${num / 1000}k` : num);

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const priceOptions = useMemo(() => [
    { label: `Under ₹${formatK(10000)}`, min: 0, max: 10000 },
    { label: `₹${formatK(10000)} - ₹${formatK(25000)}`, min: 10000, max: 25000 },
    { label: `Above ₹${formatK(25000)}`, min: 25000, max: null },
  ], []);

  const buildSearchQuery = () => {
    let q = searchText.trim();
    if (brand) q += ` ${brand}`;
    if (category) q += ` ${category}`;

    if (priceRange) {
      q += priceRange.max
        ? ` under ${priceRange.max}`
        : ` above ${priceRange.min}`;
    }
    return q.trim();
  };

  const handleSearch = async () => {
    const finalQuery = buildSearchQuery();
    if (!finalQuery) {
      Alert.alert('Search', 'Please enter search text');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(
        `${BASE_URL}/search?q=${encodeURIComponent(finalQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ FIX: Page<Product>
      setProducts(response.data.content || []);
    } catch (err) {
      Alert.alert('Search Failed', 'Try different keywords');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      await addToCartAPI(product.id, 1);
      Alert.alert('Success', 'Product added to cart');
    } catch {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(item)}
          >
            {addingToCartId === item.id
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Add to Cart</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} />
        <TextInput
          placeholder="redmi 8gb 5g under 25000"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterRow}>
        <Picker selectedValue={brand} onValueChange={setBrand} style={styles.picker}>
          <Picker.Item label="Brand" value="" />
          <Picker.Item label="Redmi" value="redmi" />
          <Picker.Item label="Samsung" value="samsung" />
        </Picker>

        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Category" value="" />
          <Picker.Item label="Mobile" value="mobile" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator size="large" />
        : <FlatList data={products} renderItem={renderItem} keyExtractor={i => i.id.toString()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: '#fff', padding: 10 },
  searchInput: { flex: 1, marginLeft: 8 },
  filterRow: { flexDirection: 'row', marginVertical: 10 },
  picker: { flex: 1 },
  searchBtn: { backgroundColor: '#28a745', padding: 12 },
  searchBtnText: { color: '#fff', textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10 },
  image: { width: 90, height: 90 },
  details: { flex: 1, padding: 8 },
  name: { fontWeight: 'bold' },
  price: { color: '#e91e63' },
  buttonRow: { marginTop: 6 },
  cartButton: { backgroundColor: '#ff9800', padding: 8 },
  buttonText: { color: '#fff', textAlign: 'center' },
});
