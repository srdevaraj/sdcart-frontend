// screens/SelectedProduct.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';

const screenWidth = Dimensions.get('window').width;
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/<your-cloud-name>/image/upload/';

export default function SelectedProduct({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      const data = await getProductById(id);
      // Prepend Cloudinary URL if needed
      if (data.imageUrl && !data.imageUrl.startsWith('http')) {
        data.imageUrl = `${CLOUDINARY_BASE_URL}${data.imageUrl}`;
      }
      setProduct(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load product.");
      console.error("Fetch Product Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product.id, 1); // quantity = 1
      Alert.alert("Success", "Item added to cart");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add item to cart.");
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image Available</Text>
        </View>
      )}

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>

      {/* Description scrollable after 5 lines */}
      <View style={{ maxHeight: 110, marginBottom: 5, width: '100%', position: 'relative' }}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          scrollEnabled={product.description?.length > 150}
        >
          <Text style={styles.description}>{product.description}</Text>
        </ScrollView>

        {product.description?.length > 150 && (
          <View style={styles.fadeOverlay} pointerEvents="none" />
        )}
      </View>

      {product.description?.length > 150 && (
        <Text style={styles.scrollHint}>⬆ Scroll for more ⬇</Text>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.item}><Text style={styles.label}>📦 Stock:</Text> {product.stock}</Text>
        <Text style={styles.item}><Text style={styles.label}>⭐ Ratings:</Text> {product.ratings}</Text>
        <Text style={styles.item}><Text style={styles.label}>👤 Seller:</Text> {product.seller}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addToCartbtn}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>Add to cart</Text>
          )}
        </TouchableOpacity>

        <View style={{ width: 30 }} />

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => navigation.navigate('OrderScreen', { product })}
        >
          <Text style={styles.btnText}>BUY</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#b7dafdff',
    paddingBottom: 40,
    marginTop: 35,
  },
  image: {
    width: screenWidth - 40,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginBottom: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#b7dafdff',
    textAlign: 'center',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    height: 25,
    width: '100%',
    backgroundColor: 'rgba(183,218,253,0.8)',
  },
  scrollHint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailsContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    lineHeight: 22,
  },
  label: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: 'green',
    width: '40%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartbtn: {
    backgroundColor: 'blue',
    width: '40%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
});
