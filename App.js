import jwtDecode from 'jwt-decode';

import { StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { CartProvider } from './src/context/CartContext';

import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import GetProductById from './src/screens/GetProductByIdScreen';
import SelectedProduct from './src/screens/SelectedProduct';
import AdminScreen from './src/screens/AdminScreen';
import Admin from './src/screens/Admin';
import CategoryModal from './src/screens/CategoryModal';
import Fruits from './src/screens/Fruits';
import Mobiles from './src/screens/Mobiles';
import Grocery from './src/screens/Grocery';
import Cart from './src/screens/Cart';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AccountScreen from './src/screens/AccountScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Products') iconName = 'pricetags-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Cart') iconName = 'cart-outline';
          else if (route.name === 'Account') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
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
      <Tab.Screen name="Search" component={GetProductById} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { userInfo, authLoading } = useAuth();

  if (authLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userInfo ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="SelectedProduct" component={SelectedProduct} />
          <Stack.Screen name="AdminScreen" component={AdminScreen} />
          <Stack.Screen name="Admin" component={Admin} />
          <Stack.Screen name="CategoryModal" component={CategoryModal} />
          <Stack.Screen name="Fruits" component={Fruits} />
          <Stack.Screen name="Mobiles" component={Mobiles} />
          <Stack.Screen name="Grocery" component={Grocery} />
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
