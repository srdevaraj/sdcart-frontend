// src/screens/AccountScreen.js
import React, { useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as Animatable from 'react-native-animatable';

export default function AccountScreen({ navigation }) {
  const { userInfo, logout, authLoading, refreshUserInfo } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={logout}
          style={{ marginRight: 20 }}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={24} color="red" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (containerRef.current) {
      containerRef.current.pulse(500);
    }
    await refreshUserInfo?.();
    setRefreshing(false);
  };

  const AnimatedRow = ({ icon, iconColor, text, onPress, label, delay }) => (
    <Animatable.View
      animation="fadeInUpBig"
      duration={900}
      delay={delay}
      useNativeDriver
    >
      <View style={styles.row} accessible accessibilityLabel={label}>
        <View style={styles.iconText}>
          <Ionicons name={icon} size={28} color={iconColor} />
          <Text style={styles.text}>{text}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  if (authLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading user info...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User not logged in</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Animatable.View ref={containerRef}>
        <Animatable.Text
          animation="bounceInDown"
          duration={1000}
          style={styles.greeting}
          useNativeDriver
        >
          Hello, {userInfo.firstName} 👋
        </Animatable.Text>

        <AnimatedRow
          icon="person-circle-outline"
          iconColor="#555"
          text="Account Info"
          onPress={() => navigation.navigate('AccountInfo')}
          label="Account Info section"
          delay={200}
        />
        <View style={styles.gap} />

        <AnimatedRow
          icon="cube-outline"
          iconColor="#8e44ad"
          text="My Orders"
          onPress={() => navigation.navigate('Orders')}
          label="Orders section"
          delay={400}
        />
        <View style={styles.gap} />

        <AnimatedRow
          icon="heart-outline"
          iconColor="#e74c3c"
          text="Favourites"
          onPress={() => navigation.navigate('Favourites')}
          label="Favourites section"
          delay={600}
        />
        <View style={styles.gap} />

        <AnimatedRow
          icon="location-outline"
          iconColor="#27ae60"
          text="Delivery Address"
          onPress={() => navigation.navigate('DeliveryAddress')}
          label="Delivery Address section"
          delay={800}
        />
        <View style={styles.gap} />

        <AnimatedRow
          icon="pricetags-outline"
          iconColor="#f39c12"
          text="Coupons"
          onPress={() => navigation.navigate('Coupons')}
          label="Coupons section"
          delay={1000}
        />
        <View style={styles.gap} />

        <AnimatedRow
          icon="help-circle-outline"
          iconColor="#2980b9"
          text="Help Center"
          onPress={() => navigation.navigate('HelpCenter')}
          label="Help Center section"
          delay={1200}
        />
        <View style={styles.gap} />

        {/* sdCart footer text */}
        <Animatable.Text
          animation="fadeIn"
          duration={1500}
          delay={1400}
          style={styles.footerText}
          useNativeDriver
        >
          sdCart
        </Animatable.Text>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#b7dafdff',
  },
  gap: {
    marginVertical: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginLeft: 12,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  footerText: {
    marginTop: 0,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
