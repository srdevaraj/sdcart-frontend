import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import axios from 'axios';

import { addToCartAPI } from '../../src/api/cartApi';
import clogo from '../../assets/clogo.png';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const BASE_URL = 'https://sdcart-backend-1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default function Mobiles({ navigation }) {
  const CATEGORY_NAME = 'Mobile';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const fetchProducts = async (pageNumber = 0) => {
    try {
      if (pageNumber === 0) {
        setLoading(true);
      }

      const res = await api.get(`/products/category/${CATEGORY_NAME}`, {
        params: {
          page: pageNumber,
          size: 25,
        },
      });

      const newProducts = res.data.content || [];

      if (pageNumber === 0) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setPage(res.data.page);
      setLast(res.data.last);

    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setLast(false);
    fetchProducts(0);
  };

  const loadMore = () => {
    if (!loading && !last) {
      fetchProducts(page + 1);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);

      await addToCartAPI(product.id, 1);

      Alert.alert('Success', 'Product added to cart.');
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        error.message || 'Failed to add product.'
      );
    } finally {
      setAddingToCartId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SelectedProduct', {
            id: item.id,
          })
        }
      >
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : clogo
          }
          style={styles.image}
        />

        <Text style={styles.productName}>
          {item.name}
        </Text>

        <Text style={styles.price}>
          ₹{item.price}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
        disabled={addingToCartId === item.id}
      >
        {addingToCartId === item.id ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>
            Add to Cart
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ marginTop: 10 }}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <Text style={styles.emptyText}>
          No products found.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            !last ? (
              <ActivityIndicator
                size="small"
                color="blue"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#b7dafdff',
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gridItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    width: ITEM_WIDTH,
    elevation: 3,
    alignItems: 'center',
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#eee',
    resizeMode: 'contain',
  },

  productName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  price: {
    fontSize: 15,
    color: 'green',
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  addButton: {
    marginTop: 8,
    backgroundColor: 'blue',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  emptyText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
});