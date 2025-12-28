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
import { useCart } from '../context/CartContext';
import { addToCartAPI } from '../api/cartApi';

const BASE_URL = 'https://sdcart-backend-1.onrender.com/products';

const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJUIiwibGFzdE5hbWUiLCJyb2xlIjoiUk9MRV9BRE1JTiIsInN1YiI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzU1NzY2NjcxLCJleHAiOjE3NTU4NTMwNzF9.xkEsd_Zk9QsaGou5n3EM_NIazm8A5wnCFpaoDmwZsaY';

const formatK = (num) => (num >= 1000 ? `${num / 1000}k` : num);

export default function SearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const { addToCart } = useCart();

  // ---------------- PRICE OPTIONS ----------------
  const priceOptions = useMemo(() => {
    return [
      { label: `Under ₹${formatK(10000)}`, min: 0, max: 10000 },
      { label: `₹${formatK(10000)} - ₹${formatK(25000)}`, min: 10000, max: 25000 },
      { label: `Above ₹${formatK(25000)}`, min: 25000, max: null },
    ];
  }, []);

  // ---------------- BUILD QUERY ----------------
  const buildSearchQuery = () => {
    let q = searchText.trim();

    if (brand) q += ` ${brand}`;
    if (category) q += ` ${category}`;

    if (priceRange) {
      if (priceRange.max !== null) {
        q += ` under ${priceRange.max}`;
      } else {
        q += ` above ${priceRange.min}`;
      }
    }

    return q.trim();
  };

  // ---------------- SEARCH ----------------
  const handleSearch = async () => {
    const finalQuery = buildSearchQuery();

    if (!finalQuery) {
      Alert.alert('Search', 'Please enter something to search');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}/search?q=${encodeURIComponent(finalQuery)}`,
        {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        }
      );

      setProducts(response.data || []);
    } catch (error) {
      console.error('❌ Search error:', error.response?.data || error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADD TO CART ----------------
  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      await addToCartAPI(product.id, 1);
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  // ---------------- RENDER PRODUCT ----------------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SelectedProduct', { product: item, id: item.id })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
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
      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          placeholder="Search products (eg: redmi 8gb 5g under 25000)"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        {showFilters && (
          <>
            <View style={styles.row}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={category}
                  onValueChange={(v) => setCategory(v)}
                >
                  <Picker.Item label="Category" value="" />
                  <Picker.Item label="Mobile" value="mobile" />
                  <Picker.Item label="Laptop" value="laptop" />
                  <Picker.Item label="Grocery" value="grocery" />
                </Picker>
              </View>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={brand}
                  onValueChange={(v) => setBrand(v)}
                >
                  <Picker.Item label="Brand" value="" />
                  <Picker.Item label="Redmi" value="redmi" />
                  <Picker.Item label="Samsung" value="samsung" />
                  <Picker.Item label="Realme" value="realme" />
                </Picker>
              </View>
            </View>

            <View style={styles.priceRow}>
              {priceOptions.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.chip,
                    priceRange?.label === p.label && styles.selectedChip,
                  ]}
                  onPress={() => setPriceRange(p)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priceRange?.label === p.label && styles.selectedChipText,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* RESULTS */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      )}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },

  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },

  filterContainer: { backgroundColor: '#fff', padding: 10 },
  row: { flexDirection: 'row' },

  pickerWrapper: {
    flex: 1,
    backgroundColor: '#eee',
    margin: 5,
    borderRadius: 8,
  },

  priceRow: { flexDirection: 'row', marginVertical: 8 },

  chip: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
  },
  selectedChip: { backgroundColor: '#007bff' },
  chipText: { fontSize: 13 },
  selectedChipText: { color: '#fff' },

  searchBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  searchBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  toggleBtn: { alignSelf: 'center', marginTop: 8 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  image: { width: 100, height: 100, marginRight: 10 },
  details: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#e91e63' },

  buttonRow: { flexDirection: 'row', marginTop: 10 },
  cartButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    padding: 8,
    borderRadius: 6,
    marginRight: 6,
    alignItems: 'center',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
