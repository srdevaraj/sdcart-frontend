// src/screens/AddEditAddress.js

import React, { useState, useRef } from 'react';
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
  Platform,
  StatusBar,
  Image,
  Animated,
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

const API_URL = 'https://sdcart-backend-1.onrender.com';

const AddEditAddress = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { address } = route.params || {};

  // ---------------- FORM ----------------

  const [fullName, setFullName] = useState(
    address?.fullName || ''
  );

  const [mobileNumber, setMobileNumber] = useState(
    address?.mobileNumber || ''
  );

  const [altMobileNumber, setAltMobileNumber] = useState(
    address?.altMobileNumber || ''
  );

  const [addressLine1, setAddressLine1] = useState(
    address?.addressLine1 || ''
  );

  const [addressLine2, setAddressLine2] = useState(
    address?.addressLine2 || ''
  );

  const [city, setCity] = useState(
    address?.city || ''
  );

  const [state, setState] = useState(
    address?.state || ''
  );

  const [pincode, setPincode] = useState(
    address?.pincode || ''
  );

  const [landmark, setLandmark] = useState(
    address?.landmark || ''
  );

  const [btnLoading, setBtnLoading] =
    useState(null);

  // ---------------- ANIMATION ----------------

  const fade = useRef(
    new Animated.Value(0)
  ).current;

  const slide = useRef(
    new Animated.Value(40)
  ).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ---------------- SAVE ----------------

  const handleSave = async () => {

    if (
      !fullName ||
      !mobileNumber ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      Alert.alert(
        'Validation',
        'Please fill all required fields.'
      );
      return;
    }

    try {

      setBtnLoading('save');

      const token =
        await AsyncStorage.getItem(
          'userToken'
        );

      const payload = {
        fullName,
        mobileNumber,
        altMobileNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
      };

      if (address) {

        await axios.put(
          `${API_URL}/api/address/${address.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Alert.alert(
          'Success',
          'Address updated successfully.'
        );

      } else {

        await axios.post(
          `${API_URL}/api/address/add`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        Alert.alert(
          'Success',
          'Address added successfully.'
        );
      }

      navigation.goBack();

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Error',
        'Failed to save address.'
      );

    } finally {
      setBtnLoading(null);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // ---------------- REUSABLE INPUT ----------------

  const InputField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
  }) => (
    <View style={styles.inputContainer}>

      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color="#2563EB"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />

    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        backgroundColor="#2563EB"
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <LinearGradient
          colors={[
            '#2563EB',
            '#4F46E5',
          ]}
          style={styles.header}
        >

          <Image
            source={require('../../assets/clogo.png')}
            style={styles.logo}
          />

          <Text style={styles.headerTitle}>
            {address
              ? 'Update Address'
              : 'Add Address'}
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your delivery location
          </Text>

        </LinearGradient>

        <Animated.View
          style={{
            flex: 1,
            opacity: fade,
            transform: [
              {
                translateY: slide,
              },
            ],
          }}
        >

          <ScrollView
            contentContainerStyle={
              styles.container
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.formCard}>
                            <View style={styles.titleRow}>
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={28}
                  color="#2563EB"
                />

                <Text style={styles.formTitle}>
                  Delivery Information
                </Text>
              </View>

              <Text style={styles.formSubtitle}>
                Fill the details below to save your delivery address.
              </Text>

              <InputField
                icon="account-outline"
                placeholder="Full Name *"
                value={fullName}
                onChangeText={setFullName}
              />

              <InputField
                icon="phone-outline"
                placeholder="Mobile Number *"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
              />

              <InputField
                icon="phone-plus-outline"
                placeholder="Alternate Mobile Number"
                value={altMobileNumber}
                onChangeText={setAltMobileNumber}
                keyboardType="phone-pad"
              />

              <InputField
                icon="home-city-outline"
                placeholder="House / Flat / Building *"
                value={addressLine1}
                onChangeText={setAddressLine1}
              />

              <InputField
                icon="road-variant"
                placeholder="Street / Area / Village"
                value={addressLine2}
                onChangeText={setAddressLine2}
              />

              <InputField
                icon="city"
                placeholder="City *"
                value={city}
                onChangeText={setCity}
              />

              <InputField
                icon="map-outline"
                placeholder="State *"
                value={state}
                onChangeText={setState}
              />

              <InputField
                icon="mailbox-outline"
                placeholder="Pincode *"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
              />

              <InputField
                icon="map-marker-star-outline"
                placeholder="Landmark (Optional)"
                value={landmark}
                onChangeText={setLandmark}
              />

              {/* Save Button */}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.saveButton}
                onPress={handleSave}
                disabled={btnLoading === 'save'}
              >
                {btnLoading === 'save' ? (
                  <ActivityIndicator
                    color="#fff"
                  />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={
                        address
                          ? 'content-save-edit'
                          : 'content-save'
                      }
                      size={22}
                      color="#fff"
                    />

                    <Text style={styles.saveText}>
                      {address
                        ? 'Update Address'
                        : 'Save Address'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={22}
                  color="#64748B"
                />

                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>

            <View style={{ height: 40 }} />

          </ScrollView>

        </Animated.View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  container: {
    paddingBottom: 40,
  },

  /* ---------------- Header ---------------- */

  header: {
    paddingTop: 20,
    paddingBottom: 95,
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 15,
    marginTop: 8,
  },

  /* ---------------- Form Card ---------------- */

  formCard: {
    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginTop: -55,

    borderRadius: 28,

    padding: 22,

    elevation: 12,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  formTitle: {
    marginLeft: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  formSubtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },

  /* ---------------- Inputs ---------------- */

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    marginBottom: 16,

    paddingHorizontal: 15,

    minHeight: 62,
  },

  iconContainer: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: '#EEF4FF',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  input: {
    flex: 1,

    color: '#111827',

    fontSize: 16,

    paddingVertical: 15,
  },

  /* ---------------- Save Button ---------------- */

  saveButton: {
    height: 58,

    backgroundColor: '#2563EB',

    borderRadius: 18,

    marginTop: 15,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',

    elevation: 8,

    shadowColor: '#2563EB',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },

  /* ---------------- Cancel ---------------- */

  cancelButton: {
    height: 58,

    borderRadius: 18,

    marginTop: 16,

    borderWidth: 1.5,

    borderColor: '#CBD5E1',

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',

    backgroundColor: '#FFFFFF',
  },

  cancelText: {
    marginLeft: 8,

    color: '#64748B',

    fontWeight: '700',

    fontSize: 16,
  },

});
export default AddEditAddress;