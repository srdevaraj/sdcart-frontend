import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = 'https://sdcart-backend-1.onrender.com'; // your backend URL

export default function LoginScreen({ navigation }) {
  const { setUserInfo } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const token = response.data.token;

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        console.log('✅ Token saved:', token);

        const decoded = jwtDecode(token);
        console.log('👤 Decoded user info:', decoded);
        setUserInfo(decoded);

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });

        Alert.alert('Login Success', 'You are now logged in!');
      } else {
        Alert.alert('Login failed', 'No token returned from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/clogo.png')} style={styles.logo} />

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <Text style={styles.registerText}>
        Don't have an account?
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          {' Register here'}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
    color: '#000',   // ✅ Title always visible
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#000',   // ✅ Fix: force input text color to black
  },
  registerText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#000',   // ✅ ensure readable on all themes
  },
  link: {
    color: 'blue',
  },
});

