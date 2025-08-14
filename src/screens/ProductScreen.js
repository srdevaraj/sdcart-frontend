import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Image, Modal, Pressable, Alert, Dimensions
} from 'react-native';
import { getAllProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import clogo from '../../assets/clogo.png';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

// Replace with your actual Cloudinary base URL if needed
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/<your-cloud-name>/image/upload/';

export default function ProductScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={clogo} style={{ width: 24, height: 24, marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Products</Text>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => null,
    });

    fetchProducts();
  }, []);

  useEffect(() => {
    if (route.params?.openModal) {
      setModalVisible(true);
      navigation.setParams({ openModal: false });
    }
  }, [route.params]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();

      // Ensure imageUrl is a valid Cloudinary URL
      const processedData = data.map(item => {
        if (item.imageUrl && !item.imageUrl.startsWith('http')) {
          return { ...item, imageUrl: `${CLOUDINARY_BASE_URL}${item.imageUrl}` };
        }
        return item;
      });

      setProducts(processedData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filterByCategory = (category) => {
    setModalVisible(false);
    navigation.navigate(category);
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCartId(product.id);
      await addToCart(product);
      Alert.alert("Success", "Product added to cart.");
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ marginTop: 10, color: 'gray' }}>Loading products...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SelectedProduct', { id: item.id })}
      >
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require('../../assets/loading.gif')
          }
          style={styles.image}
        />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
        disabled={addingToCartId === item.id}
      >
        {addingToCartId === item.id ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.addButtonText}>Add to Cart</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {['Fruits', 'Mobiles', 'Grocery'].map((category) => (
              <Pressable
                key={category}
                style={styles.categoryButton}
                onPress={() => filterByCategory(category)}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {products.length === 0 ? (
        <Text style={styles.emptyText}>No products found.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
    backgroundColor: '#f0f4f8',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 30,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'blue',
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  categoryText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
