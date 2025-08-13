// Admin.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Admin() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Admin Dashboard!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
