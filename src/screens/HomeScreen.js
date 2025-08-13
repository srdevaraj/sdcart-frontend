// src/screens/HomeScreen.js
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          style={styles.image}
          source={require('../../assets/clogo.png')}
        />
        <Text style={styles.title}>Welcome to sdCart</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  image: {
    width: 200,
    height: 200,
  },
});
