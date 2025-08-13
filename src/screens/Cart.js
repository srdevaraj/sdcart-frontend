import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchCartItems,
  clearCartAPI,
  removeFromCartAPI,
} from '../api/cartApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
  const { cartItems, setCartItems, clearCart, removeFromCart, reloadCart } = useCart();
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('⛔ Token not found, skipping cart fetch');
        setCartItems([]);
        return; // ✅ stop here if token is missing
      }
      const items = await fetchCartItems(token); // <<< pass token
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error loading cart', error.message || 'Something went wrong');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ This runs every time screen becomes active
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const total = (cartItems || []).reduce((sum, item) => sum + (item.price || 0), 0);
  const totalItems = cartItems?.length ?? 0;

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedItems([]);
  };

  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    setIsDeleting(true);
    try {
      // Use removeFromCart from context which handles token & state update
      for (const itemId of selectedItems) {
        const item = cartItems.find((it) => it.id === itemId);
        if (item) {
          await removeFromCart(item);
        }
      }
      setSelectedItems([]);
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error deleting items', error.message || 'Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  const placeOrder = async () => {
    Alert.alert('Order Placed', 'Thank you for your order!');
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Not authenticated', 'Please login to place order');
        return;
      }
      await clearCartAPI(token); // pass token when calling API directly
      clearCart(); // update context state
    } catch (error) {
      Alert.alert('Order Error', error.message || 'Something went wrong');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          editMode && isSelected && styles.selectedItem,
        ]}
        onPress={() => editMode && toggleSelectItem(item.id)}
        activeOpacity={editMode ? 0.6 : 1}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/70' }}
          style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0080ff" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛒 Your Cart</Text>

      {editMode && (
        <Text style={styles.editModeNotice}>Select items to delete</Text>
      )}

      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <View style={[styles.productListContainer, editMode && styles.dimBackground]}>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerInfo}>Total: ₹{total}</Text>
              <Text style={styles.footerInfo}>Items: {totalItems}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editBtn} onPress={toggleEditMode}>
                <Text style={styles.btnText}>{editMode ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.placeBtn} onPress={placeOrder}>
                <Text style={styles.btnText}>Place Order</Text>
              </TouchableOpacity>
            </View>

            {editMode && selectedItems.length > 0 && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={deleteSelectedItems}
              >
                <Text style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0080ff" />
          <Text style={styles.loadingText}>Deleting...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  empty: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#999',
  },
  productListContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  selectedItem: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ff3333',
    borderWidth: 1,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerInfo: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  placeBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteBtn: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  editModeNotice: {
    textAlign: 'center',
    color: '#cc0000',
    fontWeight: '600',
    marginBottom: 8,
  },
  dimBackground: {
    opacity: 0.95,
  },
});
