import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function CategoryModal({ navigation }) {
  const handlePress = (category) => {
    navigation.replace(category); // Or use navigate
  };

  return (
    <View style={styles.modalContainer}>
      {['Fruits', 'Mobiles', 'Grocery'].map((cat) => (
        <Pressable
          key={cat}
          style={styles.button}
          onPress={() => handlePress(cat)}
        >
          <Text style={styles.text}>{cat}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 15,
    backgroundColor: 'blue',
    marginVertical: 10,
    borderRadius: 8,
    width: '70%',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
