import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  View,
  Image,
  Text,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  CartProvider,
} from './src/context/CartContext';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import {
  WishlistProvider,
} from './src/context/WishlistContext';


// --------------------------------------------------
// Screens
// --------------------------------------------------

import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import SearchScreen from './src/screens/SearchScreen';
import SelectedProduct from './src/screens/SelectedProduct';

import OrderScreen from './src/screens/OrderScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';

import Admin from './src/screens/Admin';

import WishlistScreen from './src/screens/WishlistScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';

import CategoryModal from './src/screens/CategoryModal';

import Fruits from './src/screens/Fruits';
import Mobiles from './src/screens/Mobiles';
import Grocery from './src/screens/Grocery';
import ElectricalsModule from './src/screens/ElectricalsModule';

import Cart from './src/screens/Cart';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import AccountScreen from './src/screens/AccountScreen';

import DeliveryAddress from './src/screens/DeliveryAddress';
import AddEditAddress from './src/screens/AddEditAddress';

import AccountInfoScreen from './src/screens/AccountInfoScreen';


// --------------------------------------------------
// Navigation
// --------------------------------------------------

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// --------------------------------------------------
// Theme
// --------------------------------------------------

const lightBlue = '#48d4ff';


// ==================================================
// Bottom Tab Navigation
// ==================================================

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        /*
         * Bottom navigation icons
         */
        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused
                ? 'home'
                : 'home-outline';
              break;

            case 'Products':
              iconName = focused
                ? 'pricetags'
                : 'pricetags-outline';
              break;

            case 'Search':
              iconName = focused
                ? 'search'
                : 'search-outline';
              break;

            case 'Cart':
              iconName = focused
                ? 'cart'
                : 'cart-outline';
              break;

            case 'Account':
              iconName = focused
                ? 'person'
                : 'person-outline';
              break;

            default:
              iconName = 'circle';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },

        /*
         * Bottom navigation
         */
        tabBarActiveTintColor: 'blue',

        tabBarInactiveTintColor: 'black',

        tabBarStyle: {
          backgroundColor: lightBlue,
        },

        /*
         * IMPORTANT:
         *
         * The normal tab screens can have their own
         * headers, but category screens are outside
         * MainTabs and therefore explicitly hide
         * their Stack header.
         */
        headerStyle: {
          backgroundColor: lightBlue,
        },
      })}
    >

      {/* ============================================
          HOME
          ============================================ */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,

          headerTitle: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Image
                source={require('./assets/clogo.png')}
                style={{
                  width: 30,
                  height: 30,
                  marginRight: 8,
                }}
                resizeMode="contain"
              />

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                sdCart
              </Text>
            </View>
          ),
        }}
      />

      {/* ============================================
          PRODUCTS
          ============================================ */}

      <Tab.Screen
        name="Products"
        component={ProductScreen}
        options={({ navigation }) => ({
          headerShown: true,

          title: 'Products',

          headerRight: () => (
            <Icon
              name="view-grid"
              size={24}
              color="black"
              style={{
                marginRight: 15,
              }}
              onPress={() =>
                navigation.navigate('CategoryModal')
              }
            />
          ),
        })}
      />

      {/* ============================================
          SEARCH
          ============================================ */}

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* ============================================
          CART
          ============================================ */}

      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: true,
          title: 'Cart',
        }}
      />

      {/* ============================================
          ACCOUNT
          ============================================ */}

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: true,
          title: 'Account',
        }}
      />

    </Tab.Navigator>
  );
}


// ==================================================
// Root Stack Navigation
// ==================================================

function AppNavigator() {
  const {
    userInfo,
    authLoading,
  } = useAuth();


  /*
   * Authentication loading
   */
  if (authLoading) {
    return null;
  }


  return (
    <Stack.Navigator
      screenOptions={{
        /*
         * Root stack does NOT show headers by default.
         */
        headerShown: false,

        headerStyle: {
          backgroundColor: lightBlue,
        },
      }}
    >

      {/* ============================================
          AUTHENTICATION
          ============================================ */}

      {!userInfo ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>

          {/* ========================================
              MAIN APPLICATION
              ======================================== */}

          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              PRODUCT DETAILS
              ======================================== */}

          <Stack.Screen
            name="SelectedProduct"
            component={SelectedProduct}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              ORDER / PAYMENT
              ======================================== */}

          <Stack.Screen
            name="OrderScreen"
            component={OrderScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="PaymentResult"
            component={PaymentResultScreen}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              ADMIN
              ======================================== */}

          <Stack.Screen
            name="Admin"
            component={Admin}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              WISHLIST
              ======================================== */}

          <Stack.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              ORDERS
              ======================================== */}

          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="OrderDetails"
            component={OrderDetailsScreen}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              CATEGORY MODAL
              ======================================== */}

          <Stack.Screen
            name="CategoryModal"
            component={CategoryModal}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              CATEGORY SCREENS
              
              IMPORTANT:
              These screens have NO TOP NAVBAR.
              ======================================== */}

          <Stack.Screen
            name="Fruits"
            component={Fruits}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Mobiles"
            component={Mobiles}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Grocery"
            component={Grocery}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ElectricalsModule"
            component={ElectricalsModule}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              ADDRESS
              ======================================== */}

          <Stack.Screen
            name="DeliveryAddress"
            component={DeliveryAddress}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="AddEditAddress"
            component={AddEditAddress}
            options={{
              headerShown: false,
            }}
          />


          {/* ========================================
              ACCOUNT INFO
              ======================================== */}

          <Stack.Screen
            name="AccountInfo"
            component={AccountInfoScreen}
            options={{
              headerShown: false,
            }}
          />

        </>
      )}

    </Stack.Navigator>
  );
}


// ==================================================
// Application Root
// ==================================================

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>

          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: 'white',
            }}
          >

            <StatusBar
              barStyle="dark-content"
              backgroundColor="white"
            />

            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>

          </SafeAreaView>

        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}