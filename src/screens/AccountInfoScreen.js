// src/screens/AccountInfoScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  RefreshControl,
  Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://sdcart-backend-1.onrender.com';

export default function AccountInfoScreen() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User not authenticated');

      // Fetch user info
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch delivery address
      const addressResponse = await axios.get(`${API_BASE_URL}/api/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Set user data
      setUser(userResponse.data.user || userResponse.data);

      // Address API might return object or array
      if (Array.isArray(addressResponse.data)) {
        setAddress(addressResponse.data.length > 0 ? addressResponse.data[0] : null);
      } else {
        setAddress(addressResponse.data || null);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Logo on top */}
      <View style = {styles.imagelogo}>
        <Image 
          source={require('../../assets/clogo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>
      {/* User Info */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <Text style={styles.label}>Name: {user.firstName} {user.lastName}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <Text style={styles.label}>Mobile: {user.mobile}</Text>
          <Text style={styles.label}>Alt Mobile: {user.altMobile || '-'}</Text>
          <Text style={styles.label}>DOB: {user.dob || '-'}</Text>
        </View>
      )}

      {/* Delivery Address */}
      {address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.label}>Full Name: {address.fullName}</Text>
          <Text style={styles.label}>Mobile: {address.mobileNumber}</Text>
          {address.altMobileNumber && <Text style={styles.label}>Alt Mobile: {address.altMobileNumber}</Text>}
          <Text style={styles.label}>
            Address: {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}
          </Text>
          <Text style={styles.label}>City: {address.city}</Text>
          <Text style={styles.label}>State: {address.state}</Text>
          <Text style={styles.label}>Pincode: {address.pincode}</Text>
          {address.landmark && <Text style={styles.label}>Landmark: {address.landmark}</Text>}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.label}>No delivery address found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  section: { 
    marginBottom: 25, 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1976d2' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { marginTop:'10%' ,width: 100, height: 100, marginBottom: 15, borderRadius:40, },
  imagelogo: {alignItems:'center'}
});
