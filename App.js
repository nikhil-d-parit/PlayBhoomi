import React, { useState, useEffect } from "react";
import { View, Image, Pressable, ScrollView, SafeAreaView } from "react-native";
import {
  Provider as PaperProvider,
  Text,
  Button,
  Card,
  Avatar,
  TextInput,
  Drawer as PaperDrawer,
  useTheme,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Provider as ReduxProvider } from "react-redux";
import Store from "./redux/Store";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

/**********************
 *   SCREENS        *
 **********************/
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ManageUsersScreen from "./screens/ManageUsersScreen";
import UserDetailsScreen from "./screens/UserDetailsScreen";
import AddUserScreen from "./screens/AddUserScreen";
import AddVenueScreen from "./screens/AddVenueScreen";
import ManageVendersScreen from "./screens/ManageVendersScreen";
import ManageVenuesScreen from "./screens/ManageVenuesScreen";
import AddVenderScreen from "./screens/AddVenderScreen";
import ManageBookingsScreen from "./screens/ManageBookingsScreen";
import AddBookingScreen from "./screens/AddBookingScreen";
import ManageAminitiesScreen from "./screens/ManageAminitiesScreen";
import ManageRulesScreen from "./screens/ManageRulesScreen";
import BookingDetailsScreen from "./screens/BookingDetailsScreen";
import EditVendorScreen from "./screens/EditVendorScreen";
import VendorDetailsScreen from "./screens/VendorDetailsScreen";
import AddAmenityScreen from "./screens/AddAmenityScreen";
import EditAmenityScreen from "./screens/EditAmenityScreen";
import AddRuleScreen from "./screens/AddRuleScreen";
import EditRuleScreen from "./screens/EditRuleScreen";
import EditVenueScreen from "./screens/EditVenueScreen";
import ManageNotificationsScreen from "./screens/ManageNotificationsScreen";
import theme from "./theme";

const PlaceholderScreen = ({ title }) => (
  <SafeAreaView
    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  >
    <Text variant="headlineMedium">{title}</Text>
  </SafeAreaView>
);

/**********************
 *  DRAWER CONTENT    *
 **********************/

import { logout } from './redux/slices/AuthSlice';

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    dispatch(logout());
    navigation.replace('Login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#2e7d32",
          padding: 24,
          alignItems: "center",
        }}
      >
        <Avatar.Icon
          size={64}
          icon="soccer"
          color="#fff"
          style={{ backgroundColor: "transparent" }}
        />
        <Text style={{ color: "white", marginTop: 8 }} variant="titleMedium">
          KRIDA ADMIN
        </Text>
      </View>

      <PaperDrawer.Section style={{ marginTop: 16 }}>
        {[
          ["Dashboard", "view-dashboard"],
          ["Manage Users", "account-multiple"],
          ["Manage Turf", "stadium"],
          ["Manage vendors", "storefront"],
          ["Manage Bookings", "calendar-clock"],
          ["Manage Aminities", "wrench"],
          ["Manage Rules", "scale-balance"],
        ].map(([label, icon]) => (
          <PaperDrawer.Item
            key={label}
            label={label}
            icon={icon}
            onPress={() => navigation.navigate(label)}
          />
        ))}
        <View style={{ flex: 1, justifyContent: "flex-end"}}>
          <PaperDrawer.Item
            label="Logout"
            icon="logout"
            onPress={handleLogout}
          />
        </View>
      </PaperDrawer.Section>
    </DrawerContentScrollView>
  );
};

/**********************
 *   NAVIGATORS       *
 **********************/
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const MainDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{ headerShown: true }}
  >
    <Drawer.Screen name="Dashboard" component={DashboardScreen} />
    <Drawer.Screen name="Manage Users" component={ManageUsersScreen}/>
    <Drawer.Screen name="Manage vendors" component={ManageVendersScreen}/>
    <Drawer.Screen name="Manage Turf" component={ManageVenuesScreen} />
    <Drawer.Screen name="Manage Bookings" component={ManageBookingsScreen}/>
    <Drawer.Screen name="Manage Notifications" component={ManageNotificationsScreen}/>
    <Drawer.Screen name="Manage Aminities" component={ManageAminitiesScreen}/>
    <Drawer.Screen name="Manage Rules" component={ManageRulesScreen}/>
  </Drawer.Navigator>
);

/**********************
 *      APP           *
 **********************/


function AppInner() {
  const [initialRoute, setInitialRoute] = useState('Splash');
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        dispatch({ type: 'auth/loginUser/fulfilled', payload: { token } });
        setInitialRoute('Main');
      } else {
        setInitialRoute('Login');
      }
    };
    checkToken();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="User Details" component={UserDetailsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add User" component={AddUserScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add Turf" component={AddVenueScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add vendor" component={AddVenderScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add Booking" component={AddBookingScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Booking Details" component={BookingDetailsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Edit Vendor" component={EditVendorScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Vendor Details" component={VendorDetailsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add Amenity" component={AddAmenityScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Edit Amenity" component={EditAmenityScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Add Rule" component={AddRuleScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Edit Rule" component={EditRuleScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Edit Turf" component={EditVenueScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Main" component={MainDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={Store}>
      <AppInner />
    </ReduxProvider>
  );
}
