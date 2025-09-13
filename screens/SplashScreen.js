import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";
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
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default SplashScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const timeout = setTimeout(() => navigation.navigate("Login"), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const { colors } = useTheme();
  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.primary }}
    >
      <FontAwesome5 name="futbol" size={80} color="#fff" />
      <Text variant="headlineMedium" style={{ marginTop: 12, color: "white" }}>
        KRIDA ADMIN
      </Text>
    </View>
  );
};