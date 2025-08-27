// src/screens/AddEditAddress.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddEditAddress = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { address } = route.params || {}; // if passed for editing

  // form state
  const [fullName, setFullName] = useState(address?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(address?.mobileNumber || '');
  const [altMobileNumber, setAltMobileNumber] = useState(address?.altMobileNumber || '');
  const [addressLine1, setAddressLine1] = useState(address?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(address?.addressLine2 || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [pincode, setPincode] = useState(address?.pincode || '');
  const [landmark, setLandmark] = useState(address?.landmark || '');

  const [btnLoading, setBtnLoading] = useState(null); // "save" or "cancel"

  const handleSave = async () => {
    if (!fullName || !mobileNumber || !addressLine1 || !city || !state || !pincode) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      setBtnLoading('save');
      const token = await AsyncStorage.getItem('userToken');

      if (address) {
        // update existing
        await axios.put(
          `https://sdcart-backend-1.onrender.com/api/address/${address.id}`,
          { fullName, mobileNumber, altMobileNumber, addressLine1, addressLine2, city, state, pincode, landmark },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // add new
        await axios.post(
          'https://sdcart-backend-1.onrender.com/api/address/add',
          { fullName, mobileNumber, altMobileNumber, addressLine1, addressLine2, city, state, pincode, landmark },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Address added successfully');
      }

      navigation.goBack(); // go back to DeliveryAddress
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setBtnLoading(null);
    }
  };

  const handleCancel = () => {
    setBtnLoading('cancel');
    setTimeout(() => {
      navigation.goBack();
      setBtnLoading(null);
    }, 500); // small delay for showing spinner
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.header}>{address ? 'Update Address' : 'Add New Address'}</Text>

        {/* Scrollable Input Fields */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput style={styles.input} placeholder="Full Name *" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Mobile Number *" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Alternate Mobile Number" value={altMobileNumber} onChangeText={setAltMobileNumber} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Street *" value={addressLine1} onChangeText={setAddressLine1} />
          <TextInput style={styles.input} placeholder="Town/Village name" value={addressLine2} onChangeText={setAddressLine2} />
          <TextInput style={styles.input} placeholder="City *" value={city} onChangeText={setCity} />
          <TextInput style={styles.input} placeholder="State *" value={state} onChangeText={setState} />
          <TextInput style={styles.input} placeholder="Pincode *" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Landmark (optional)" value={landmark} onChangeText={setLandmark} />

          {/* Save / Update button */}
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#2196f3' }]} 
            onPress={handleSave}
            disabled={btnLoading === 'save'}
          >
            {btnLoading === 'save' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>{address ? 'Update Address' : 'Save Address'}</Text>
            )}
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: 'gray' }]} 
            onPress={handleCancel}
            disabled={btnLoading === 'cancel'}
          >
            {btnLoading === 'cancel' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Cancel</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f8ff'
  },
  container: { 
    padding: 20, 
    alignItems: 'center' 
  },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 50, 
    textAlign: 'center', 
    color: '#333' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#494949ff', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 12, 
    width: '100%', 
    backgroundColor: '#fff' 
  },
  btn: { 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10, 
    width: '100%', 
    elevation: 3 
  },
  btnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default AddEditAddress;
