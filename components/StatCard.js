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

export default StatCard = ({ icon: Icon, label, value }) => {
  const theme = useTheme();
  
  return (
    <Card style={{ flexBasis: "47%", marginVertical: 8 }}>
      <Card.Content style={{ alignItems: "center" }}>
        <Icon size={28} color={theme.colors.primary} />
        <Text variant="titleMedium" style={{ marginTop: 12, color: theme.colors.onSurface }}>
          {label}
        </Text>
        <Text variant="headlineSmall" style={{ marginTop: 4, fontWeight: 'bold', color: theme.colors.onSurface }}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
};