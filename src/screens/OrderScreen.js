import React, { useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function OrderScreen({ navigation, route }) {
  const { product } = route.params;
  const amount = product.price;
  const [loading, setLoading] = useState(false);
  const { userInfo } = useContext(AuthContext);

  const createOrder = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User not logged in');

      const response = await axios.post(
        `https://sdcart-backend-1.onrender.com/api/payment/create-order?amount=${amount}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: orderId } = response.data;
      if (!orderId) throw new Error('Order ID not returned');

      // Navigate to PaymentScreen with order details
      navigation.navigate('Payment', {
        orderId,
        amount,
        product,
        user: {
          email: userInfo?.email,
          mobile: userInfo?.mobile,
        },
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>₹ {product.price}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Pay Now" onPress={createOrder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  price: { fontSize: 20, marginBottom: 20 },
});
