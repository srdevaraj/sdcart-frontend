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

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  createAddress,
  updateAddress,
} from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';

const AddEditAddress = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { address } = route.params || {};

  // ---------------- FORM (backend AddressRequest contract) ----------------

  const [label, setLabel] = useState(address?.label || 'Home');
  const [recipientName, setRecipientName] = useState(
    address?.recipientName || ''
  );
  const [phone, setPhone] = useState(address?.phone || '');
  const [line1, setLine1] = useState(address?.line1 || '');
  const [line2, setLine2] = useState(address?.line2 || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [postalCode, setPostalCode] = useState(
    address?.postalCode || ''
  );
  const [country, setCountry] = useState(address?.country || 'India');
  const [isDefault, setIsDefault] = useState(
    Boolean(address?.isDefault)
  );

  const [btnLoading, setBtnLoading] = useState(null);

  // ---------------- ANIMATION ----------------

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

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
    if (!recipientName || !phone || !line1 || !city || !postalCode) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    const payload = {
      label,
      recipientName,
      phone,
      line1,
      line2: line2 || undefined,
      city,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country,
      isDefault,
    };

    try {
      setBtnLoading('save');

      if (address) {
        await updateAddress(address.publicId, payload);
        Alert.alert('Success', 'Address updated successfully.');
      } else {
        await createAddress(payload);
        Alert.alert('Success', 'Address added successfully.');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
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
        <MaterialCommunityIcons name={icon} size={22} color="#2563EB" />
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

      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <LinearGradient
          colors={['#2563EB', '#4F46E5']}
          style={styles.header}
        >

          <Image
            source={require('../../assets/clogo.png')}
            style={styles.logo}
          />

          <Text style={styles.headerTitle}>
            {address ? 'Update Address' : 'Add Address'}
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
            contentContainerStyle={styles.container}
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
                icon="home-outline"
                placeholder="Label (Home / Office) *"
                value={label}
                onChangeText={setLabel}
              />

              <InputField
                icon="account-outline"
                placeholder="Recipient Name *"
                value={recipientName}
                onChangeText={setRecipientName}
              />

              <InputField
                icon="phone-outline"
                placeholder="Mobile Number *"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <InputField
                icon="home-city-outline"
                placeholder="House / Flat / Building *"
                value={line1}
                onChangeText={setLine1}
              />

              <InputField
                icon="road-variant"
                placeholder="Street / Area / Village"
                value={line2}
                onChangeText={setLine2}
              />

              <InputField
                icon="city"
                placeholder="City *"
                value={city}
                onChangeText={setCity}
              />

              <InputField
                icon="map-outline"
                placeholder="State"
                value={state}
                onChangeText={setState}
              />

              <InputField
                icon="mailbox-outline"
                placeholder="Pincode *"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="number-pad"
              />

              <InputField
                icon="earth"
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
              />

              {/* Default address toggle */}

              <TouchableOpacity
                style={styles.defaultRow}
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
              >

                <MaterialCommunityIcons
                  name={
                    isDefault
                      ? 'checkbox-marked-circle'
                      : 'checkbox-blank-circle-outline'
                  }
                  size={24}
                  color={isDefault ? '#16A34A' : '#94A3B8'}
                />

                <Text style={styles.defaultText}>
                  Set as default address
                </Text>

              </TouchableOpacity>

              {/* Save Button */}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.saveButton}
                onPress={handleSave}
                disabled={btnLoading === 'save'}
              >
                {btnLoading === 'save' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={address ? 'content-save-edit' : 'content-save'}
                      size={22}
                      color="#fff"
                    />

                    <Text style={styles.saveText}>
                      {address ? 'Update Address' : 'Save Address'}
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

                <Text style={styles.cancelText}>Cancel</Text>
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

  /* ---------------- Default toggle ---------------- */

  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },

  defaultText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
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
