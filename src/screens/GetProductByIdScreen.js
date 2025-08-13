import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Image, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';

export default function ProductSearchScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert("Validation", "Please enter a product ID or keyword.");
      return;
    }

    setLoading(true);
    try {
      const response = await getProductById(query);
      if (response && response.name) {
        setProducts([response]);
      } else {
        setProducts([]);
        Alert.alert('No Products Found', 'Try another search.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch product.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} has been added.`);
  };

  const handleBuyNow = (product) => {
    Alert.alert('Purchased', `You purchased ${product.name}.`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.image}` }}
          style={styles.image}
        />
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => handleBuyNow(item)}
        >
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search product by ID or name"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 30, // adds space from top
    backgroundColor: '#fff',
    elevation: 3,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
    marginTop:20
  },
  searchBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop:20
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 10,
    paddingTop: 20, // increased margin top between search bar and list
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: '#e91e63',
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
