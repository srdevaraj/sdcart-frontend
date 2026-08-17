// src/context/CartContext.js
//
// Cart state backed by the server cart (/api/v1/cart). The backend is
// authoritative for quantities, prices and totals — the UI only mirrors the
// CartResponse it receives.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../services/cartService';
import { normalizeCart } from '../services/normalizers';
import { getErrorMessage } from '../services/apiClient';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
      return data;
    } catch (error) {
      // 401s are handled centrally; keep the previous cart state otherwise.
      setCart((prev) => prev);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart().catch(() => {
      // Initial load failure (e.g. not logged in) is non-fatal.
    });
  }, [loadCart]);

  const addToCart = useCallback(async (productPublicId, quantity = 1) => {
    try {
      const data = await cartService.addToCart(productPublicId, quantity);
      setCart(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const updateQuantity = useCallback(async (itemPublicId, quantity) => {
    try {
      const data = await cartService.updateCartItem(itemPublicId, quantity);
      setCart(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const removeFromCart = useCallback(async (itemPublicId) => {
    try {
      const data = await cartService.removeCartItem(itemPublicId);
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const data = await cartService.clearCart();
      setCart(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }, []);

  const value = {
    cart: normalizeCart(cart),
    cartItems: normalizeCart(cart)?.items || [],
    totalQuantity: cart?.totalQuantity || 0,
    totalAmount: cart?.totalAmount || 0,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    reloadCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
