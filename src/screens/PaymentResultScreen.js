import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentResultScreen({ route, navigation }) {
  const { paymentResponse, product } = route.params;
  const [status, setStatus] = useState('Verifying...');
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('User not logged in');

        const response = await axios.post(
          'https://sdcart-backend-1.onrender.com/api/payment/verify',
          {
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            productId: product.id
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.includes('Payment Successful')) {
          setStatus(`Payment Successful ✅\nYou bought: ${product.name}`);
        } else {
          setStatus('Payment Failed ❌');
        }
      } catch (err) {
        console.error(err);
        setStatus('Payment Verification Failed ❌');
        Alert.alert('Error', 'Could not verify payment.');
      }
    };

    verifyPayment();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      <Button title="Back to Products" // Inside some stack screen
        onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text: { fontSize:20, textAlign:'center', marginBottom:20 }
});
