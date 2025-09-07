import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { jwtDecode } from 'jwt-decode'; // ✅ Correct import

import {
  fetchCartItems,
  addToCartAPI,
  removeFromCartAPI,
  clearCartAPI,
} from '../api/cartApi';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Validate JWT token
  const getValidToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('⚠️ No token found in AsyncStorage!');
        return null;
      }

      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp < now) {
        console.warn('⚠️ Token is expired');
        await AsyncStorage.removeItem('userToken');
        return null;
      }

      return token;
    } catch (err) {
      console.error('❌ Invalid token format:', err.message || err);
      return null;
    }
  };

  // Load cart items from API
  const loadCart = async () => {
    setLoading(true);
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Authentication token not available or expired');

      const items = await fetchCartItems(token);
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('❌ Error loading cart:', err.message || err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Add product to cart
  const addToCart = async (productId) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Authentication token not available or expired');

      const newItem = await addToCartAPI(productId, token);
      if (!newItem) throw new Error('Invalid cart item returned');

      setCartItems((prevItems) => {
        const exists = prevItems.find((item) => item.productId === newItem.productId);
        return exists
          ? prevItems.map((item) =>
              item.productId === newItem.productId ? newItem : item
            )
          : [...prevItems, newItem];
      });

      return true;
    } catch (err) {
      console.error('❌ Add to cart failed:', err.message || err);
      return false;
    }
  };

  // Remove product from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Authentication token not available or expired');

      await removeFromCartAPI(cartItemId, token);
      setCartItems((prevItems) => prevItems.filter((i) => i.id !== cartItemId));
    } catch (err) {
      console.error('❌ Remove from cart failed:', err.message || err);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Authentication token not available or expired');

      await clearCartAPI(token);
      setCartItems([]);
    } catch (err) {
      console.error('❌ Clear cart failed:', err.message || err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        reloadCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
