// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { CartProvider } from './src/context/CartContext';
import { CustomTabBar } from './src/components/navigation/CustomTabBar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import SearchScreen from './src/screens/SearchScreen';
import Cart from './src/screens/Cart';
import AccountScreen from './src/screens/AccountScreen';
import SelectedProduct from './src/screens/SelectedProduct';
import OrderScreen from './src/screens/OrderScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import DeliveryAddress from './src/screens/DeliveryAddress';
import AddEditAddress from './src/screens/AddEditAddress';
import AccountInfoScreen from './src/screens/AccountInfoScreen';
import CategoryModal from './src/screens/CategoryModal';
import Mobiles from './src/screens/Mobiles';
import Fruits from './src/screens/Fruits';
import Grocery from './src/screens/Grocery';
import ElectricalsModule from './src/screens/ElectricalsModule';
import Admin from './src/screens/Admin';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { userInfo, authLoading } = useAuth();
  const { colors, isDark } = useTheme();

  if (authLoading) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!userInfo ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="SelectedProduct"
              component={SelectedProduct}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="OrderScreen"
              component={OrderScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="PaymentResult"
              component={PaymentResultScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Wishlist"
              component={WishlistScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="DeliveryAddress"
              component={DeliveryAddress}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AddEditAddress"
              component={AddEditAddress}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="AccountInfo"
              component={AccountInfoScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CategoryModal"
              component={CategoryModal}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Mobiles"
              component={Mobiles}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Fruits"
              component={Fruits}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Grocery"
              component={Grocery}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ElectricalsModule"
              component={ElectricalsModule}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Admin"
              component={Admin}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <AppNavigator />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}