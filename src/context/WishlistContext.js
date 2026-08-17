// src/context/WishlistContext.js
//
// Shared wishlist state backed by the server wishlist (/api/v1/wishlist).
// Any screen can check membership and toggle items; the backend remains
// authoritative (duplicates are rejected with 409).

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as wishlistService from '../services/wishlistService';
import { getErrorMessage } from '../services/apiClient';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
      return data;
    } catch (error) {
      setWishlist((prev) => prev);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist().catch(() => {
      // Not fatal — screens show an empty/disabled wishlist state.
    });
  }, [loadWishlist]);

  const itemIds = (wishlist?.items || []).map((item) => item.product?.publicId);

  const isInWishlist = useCallback(
    (productPublicId) => itemIds.includes(productPublicId),
    [itemIds]
  );

  const toggleWishlist = useCallback(
    async (productPublicId) => {
      try {
        if (isInWishlist(productPublicId)) {
          const data = await wishlistService.removeFromWishlist(productPublicId);
          setWishlist(data);
          return { success: true, added: false };
        }
        const data = await wishlistService.addToWishlist(productPublicId);
        setWishlist(data);
        return { success: true, added: true };
      } catch (error) {
        return { success: false, message: getErrorMessage(error) };
      }
    },
    [isInWishlist]
  );

  const value = {
    wishlist,
    wishlistItems: wishlist?.items || [],
    loading,
    reloadWishlist: loadWishlist,
    isInWishlist,
    toggleWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
