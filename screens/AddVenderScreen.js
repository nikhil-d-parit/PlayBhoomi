import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Text,
  Provider as PaperProvider,
  HelperText,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { addVendor, resetVendorState } from "../redux/slices/VenderSlice";
import { useNavigation } from "@react-navigation/native";

export default function AddVendorScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [location, setLocation] = useState("");
  const [mobile, setMobile] = useState("");
  const [gpsUrl, setgpsUrl] = useState("");

  // error states
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { loading, success } = useSelector((state) => state.vender);

  useEffect(() => {
    if (success) {
      setFirstName("");
      setLocation("");
      setMobile("");
      setgpsUrl("");
    }
    return () => {
      dispatch(resetVendorState());
    };
  }, [success]);

  const validateForm = () => {
    let newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "Name is required";
    if (!location.trim()) {
      newErrors.location = "Location Address is required";
    }
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!gpsUrl.trim()) newErrors.gpsUrl = "Gps Url is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // valid if no errors
  };

  const handleAddVendor = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(
        addVendor({
          firstName,
          location,
          mobile,
          location,
          gpsUrl
        })
      );

      if (addVendor.fulfilled.match(result)) {
        navigation.navigate("Main", {
          screen: "Manage Vendors",
        });
      }
    } catch (error) {
      console.log("Unexpected error:", error);
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.page}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.formRow}>
              <View style={{ width: "48%" }}>
                <TextInput
                  label="Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.firstName}
                />
                {errors.firstName && (
                  <HelperText type="error">{errors.firstName}</HelperText>
                )}
              </View>
              <View style={{ width: "48%" }}>
                <TextInput
                  label="Mobile"
                  value={mobile}
                  onChangeText={setMobile}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  error={!!errors.mobile}
                />
                {errors.mobile && (
                  <HelperText type="error">{errors.mobile}</HelperText>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
               <View style={{ width: "48%" }}>
                <TextInput
                  label="Location address"
                  value={location}
                  onChangeText={setLocation}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.location}
                />
                {errors.location && (
                  <HelperText type="error">{errors.location}</HelperText>
                )}
              </View>
              
              <View style={{ width: "48%" }}>
                <TextInput
                  label="GPS Url"
                  value={gpsUrl}
                  onChangeText={setgpsUrl}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.gpsUrl}
                />
                {errors.gpsUrl && (
                  <HelperText type="error">{errors.gpsUrl}</HelperText>
                )}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                disabled={loading}
              >
                CANCEL
              </Button>
              <View style={{ width: 10 }} />
              <Button
                mode="contained"
                onPress={handleAddVendor}
                loading={loading}
                style={styles.addButton}
              >
                ADD VENDOR
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#f8f8f8", flexGrow: 1 },
  card: { backgroundColor: "white", elevation: 4, borderRadius: 8 },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  input: { backgroundColor: "#fdfdfd" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    marginHorizontal: 10,
  },
  cancelButton: { borderColor: "#2196F3", borderWidth: 1 },
  addButton: { backgroundColor: "#4CAF50" },
});
