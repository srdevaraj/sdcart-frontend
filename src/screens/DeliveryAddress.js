// src/screens/DeliveryAddress.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const DeliveryAddress = () => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true); // screen-wide loader
  const [btnLoading, setBtnLoading] = useState(null); // button-specific loader
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // fetch address
  const fetchAddress = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        'https://sdcart-backend-1.onrender.com/api/address',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setAddress(response.data[0]);
        } else if (!Array.isArray(response.data)) {
          setAddress(response.data);
        } else {
          setAddress(null);
        }
      } else {
        setAddress(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to fetch address');
    } finally {
      setLoading(false);
    }
  };

  // run when screen focused
  useEffect(() => {
    if (isFocused) fetchAddress();
  }, [isFocused]);

  // delete handler
  const handleDelete = async () => {
    try {
      setBtnLoading('delete');
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(
        `https://sdcart-backend-1.onrender.com/api/address/${address.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Address deleted');
      fetchAddress(); // refresh state
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to delete address');
    } finally {
      setBtnLoading(null);
    }
  };

  // confirm delete
  const confirmDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this address?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: handleDelete }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo on top */}
      <Image 
        source={require('../../assets/clogo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />

      {address ? (
        <>
          <Text style={styles.header}>Your Delivery Address</Text>
          
          <View style={styles.card}>
            <Text style={styles.name}>{address.fullName}</Text>
            <Text style={styles.phone}>
              {address.mobileNumber}
              {address.altMobileNumber ? `, ${address.altMobileNumber}` : ''}
            </Text>
            <Text style={styles.value}>
              {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}
            </Text>
            <Text style={styles.value}>
              {address.city}, {address.state} - {address.pincode}
            </Text>
            {address.landmark ? (
              <Text style={styles.value}>Landmark: {address.landmark}</Text>
            ) : null}
          </View>

          {/* Update button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#1976d2' }]}
            onPress={() => navigation.navigate('AddEditAddress', { address })}
            disabled={btnLoading === 'update'}
          >
            {btnLoading === 'update' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>✏️ Update Address</Text>
            )}
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#d32f2f' }]}
            onPress={confirmDelete}
            disabled={btnLoading === 'delete'}
          >
            {btnLoading === 'delete' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>🗑️ Delete Address</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.center}>
          <Text style={styles.noAddress}>No address saved yet</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#388e3c' }]}
            onPress={() => navigation.navigate('AddEditAddress')}
            disabled={btnLoading === 'add'}
          >
            {btnLoading === 'add' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>➕ Add New Address</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: '#f0f8ff', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  center: { justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 25,
    width: '100%',
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#222' },
  phone: { fontSize: 16, marginBottom: 10, color: '#555' },
  value: { fontSize: 15, marginBottom: 5, color: '#444' },
  noAddress: { fontSize: 18, color: '#777', marginBottom: 20 },
  btn: { 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10,
    width: '100%',
    elevation: 3,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default DeliveryAddress;
