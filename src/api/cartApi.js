import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://sdcart-backend-1.onrender.com/api/cart';

// ✅ Helper: Get JWT token from AsyncStorage
const getToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Authentication token not available');
  return token;
};

// ✅ Fetch Cart Items
export const fetchCartItems = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('❌ fetchCartItems Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart items');
  }
};

// ✅ Add Item to Cart
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${API_URL}/add`,
      {
        productId,  // just the ID
        quantity
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ addToCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};


// ✅ Remove Item from Cart
export const removeFromCartAPI = async (itemId) => {
  try {
    const token = await getToken();
    const response = await axios.delete(`${API_URL}/remove/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('❌ removeFromCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
};

// ✅ Clear Cart
export const clearCartAPI = async () => {
  try {
    const token = await getToken();
    const response = await axios.delete(`${API_URL}/clear`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('❌ clearCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};
