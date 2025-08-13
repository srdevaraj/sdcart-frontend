// ✅ Updated cartApi.js with all APIs
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://sdcart-backend-1.onrender.com/api/cart';

// ✅ Fetch Cart Items (GET /api/cart)
export const fetchCartItems = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Authentication token not available');

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ fetchCartItems Exception:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart items');
  }
};

// ✅ Add Item to Cart (POST /api/cart/add)
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (!token || !userInfo) {
      throw new Error('Authentication info not available');
    }

    const user = JSON.parse(userInfo);
    const userEmail = user?.sub;

    const response = await axios.post(
      `${API_URL}/add`,
      {
        product: { id: productId },
        quantity,
        userEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ addToCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

// ✅ Remove Item From Cart (DELETE /api/cart/remove/{itemId})
export const removeFromCartAPI = async (itemId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Authentication token not available');

    const response = await axios.delete(`${API_URL}/remove/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ removeFromCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
};

// ✅ Clear Cart (DELETE /api/cart/clear)
export const clearCartAPI = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Authentication token not available');

    const response = await axios.delete(`${API_URL}/clear`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ clearCartAPI Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};
