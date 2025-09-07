// App.js
import React from 'react';
import { StatusBar, SafeAreaView, View, Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import SearchScreen from './src/screens/SearchScreen';
import SelectedProduct from './src/screens/SelectedProduct';
import OrderScreen from './src/screens/OrderScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';
import AdminScreen from './src/screens/AdminScreen';
import Admin from './src/screens/Admin';
import CategoryModal from './src/screens/CategoryModal';
import Fruits from './src/screens/Fruits';
import Mobiles from './src/screens/Mobiles';
import Grocery from './src/screens/Grocery';
import Electricals from './src/screens/Electricals';
import Cart from './src/screens/Cart';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AccountScreen from './src/screens/AccountScreen';
import DeliveryAddress from './src/screens/DeliveryAddress';
import AddEditAddress from './src/screens/AddEditAddress';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const lightBlue = '#48d4ffff';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'pricetags' : 'pricetags-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'black',
        headerShown: true,
        headerStyle: { backgroundColor: lightBlue },
        tabBarStyle: { backgroundColor: lightBlue },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/clogo.png')}
                style={{ width: 30, height: 30, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>sdCart</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductScreen}
        options={({ navigation }) => ({
          title: 'Products',
          headerRight: () => (
            <Icon
              name="view-grid"
              size={24}
              color="black"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('CategoryModal')}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { userInfo, authLoading } = useAuth();

  if (authLoading) return null;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, headerStyle: { backgroundColor: lightBlue } }}
    >
      {!userInfo ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SelectedProduct" component={SelectedProduct} />
          <Stack.Screen name="OrderScreen" component={OrderScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
          <Stack.Screen name="AdminScreen" component={AdminScreen} />
          <Stack.Screen name="Admin" component={Admin} />
          <Stack.Screen name="CategoryModal" component={CategoryModal} />
          <Stack.Screen name="Fruits" component={Fruits} />
          <Stack.Screen name="Mobiles" component={Mobiles} />
          <Stack.Screen name="Grocery" component={Grocery} />
          <Stack.Screen name="Electricals" component={Electricals} />
          <Stack.Screen name="DeliveryAddress" component={DeliveryAddress} />
          <Stack.Screen name="AddEditAddress" component={AddEditAddress} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </CartProvider>
    </AuthProvider>
  );
}
