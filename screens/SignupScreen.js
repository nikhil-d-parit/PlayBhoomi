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

export default SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f7', justifyContent: "center", alignItems: "center" }}>
      <Card style={{ width: '90%', maxWidth: 400, padding: 20, elevation: 5 }}>
        <Card.Content>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Avatar.Icon size={80} icon="account-plus" />
          </View>
          <Text variant="headlineSmall" style={{ textAlign: "center", marginBottom: 24 }}>
            Sign Up
          </Text>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 24 }}
          />
          <Button mode="contained" onPress={() => navigation.replace("Main")}>
            Sign Up
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};