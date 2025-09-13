import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  SafeAreaView,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Avatar,
  TextInput,
  HelperText,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/AuthSlice";

export default LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigation.replace("Main");
    }
  }, [token]);

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    setSubmitted(true);
    if (isEmailValid(email) && password.trim().length > 0) {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f7', justifyContent: "center", alignItems: "center" }}>
      <Card style={{ width: '90%', maxWidth: 400, padding: 20, elevation: 5 }}>
        <Card.Content>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Avatar.Icon size={80} icon="soccer" />
          </View>
          <Text variant="headlineSmall" style={{ textAlign: "center", marginBottom: 24 }}>
            Login
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 4 }}
            error={submitted && !isEmailValid(email)}
          />
          <HelperText type="error" visible={submitted && !isEmailValid(email)}>
            Please enter a valid email address
          </HelperText>

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 4 }}
            error={submitted && password.trim().length === 0}
          />
          <HelperText type="error" visible={submitted && password.trim().length === 0}>
            Password is required
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 16 }}
          >
            Login
          </Button>

          {error && (
            <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
              {error}
            </Text>
          )}

          {/* <Pressable onPress={() => navigation.navigate("Signup")}>
            <Text style={{ marginTop: 16, textAlign: "center", color: "#1e88e5" }}>
              Don't have an account? Sign Up
            </Text>
          </Pressable> */}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};
