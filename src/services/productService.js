// src/services/productService.js
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = 'https://sdcart-backend-1.onrender.com';

/**
 * Get headers including JWT token from AsyncStorage
 */
const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    if (!token || token === 'null' || token === 'undefined') {
      console.warn('⚠️ No valid token found in AsyncStorage');
      throw new Error('Authentication token not available');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Error retrieving token from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Fetch all products (lightweight list: id, name, price)
 */
export const getAllProducts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/light`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('getAllProducts failed:', error.message);
    throw error;
  }
};

/**
 * Fetch product image (base64) by product ID
 */
export const getProductImageById = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/product/${id}/image`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!res.ok) {
      console.error(`Image fetch failed with status ${res.status}`);
      return null;
    }

    return await res.text(); // returns base64 string
  } catch (error) {
    console.error(`getProductImageById failed for ID ${id}:`, error.message);
    return null;
  }
};

/**
 * Fetch full product details by product ID
 */
export const getProductById = async (id) => {
  try {
    const headers = await getAuthHeaders();
    console.log(`Fetching product ID ${id} with headers:`, headers);

    const res = await fetch(`${API_BASE_URL}/products/product/${id}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Backend response error:', errText);
      throw new Error(`Failed to fetch product with ID ${id}`);
    }

    const data = await res.json();
    console.log('Product fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('getProductById failed:', error.message);
    throw error;
  }
};
