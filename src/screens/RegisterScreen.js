import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_BASE_URL } from '../services/apiConfig';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dob: '',
    mobile: '',
    altMobile: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleRegister = async () => {
    if (Object.values(formData).some(field => !field)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      Alert.alert('Success', 'Registered successfully');
      navigation.navigate('Login');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong during registration.';
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const showDOBPicker = () => setShowDatePicker(true);

  const onDOBChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('dob', formattedDate);
    }
  };

  const cancelRegistration = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dob: '',
      mobile: '',
      altMobile: '',
    });
    setStep(1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/clogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {step === 1 && (
        <>
          <Text style={styles.title}>Create an Account</Text>
          <TextInput
            placeholder="Email"
            value={formData.email}
            onChangeText={text => handleInputChange('email', text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={formData.password}
            onChangeText={text => handleInputChange('password', text)}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={text => handleInputChange('confirmPassword', text)}
            style={styles.input}
            secureTextEntry
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelRegistration}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                if (!formData.email || !formData.password || !formData.confirmPassword) {
                  Alert.alert('Error', 'Please fill all fields in this step');
                  return;
                }
                if (formData.password !== formData.confirmPassword) {
                  Alert.alert('Error', 'Passwords do not match');
                  return;
                }
                setStep(2);
              }}
            >
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Personal Details</Text>
          <TextInput
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={text => handleInputChange('firstName', text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={text => handleInputChange('lastName', text)}
            style={styles.input}
          />
          <TouchableOpacity style={styles.input} onPress={showDOBPicker}>
            <Text style={{ color: formData.dob ? '#000' : '#888' }}>
              {formData.dob || 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.dob ? new Date(formData.dob) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDOBChange}
              maximumDate={new Date()}
            />
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelRegistration}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                if (!formData.firstName || !formData.lastName || !formData.dob) {
                  Alert.alert('Error', 'Please complete all fields in this step');
                  return;
                }
                setStep(3);
              }}
            >
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Contact Details</Text>
          <TextInput
            placeholder="Mobile Number"
            value={formData.mobile}
            onChangeText={text => handleInputChange('mobile', text)}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="Alternate Mobile"
            value={formData.altMobile}
            onChangeText={text => handleInputChange('altMobile', text)}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelRegistration}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.switchText} onPress={() => navigation.navigate('Login')}>
        Already registered? Login here
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 140,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#007BFF',
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    marginLeft: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchText: {
    color: '#007BFF',
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
  },
});
