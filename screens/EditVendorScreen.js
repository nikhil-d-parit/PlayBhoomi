
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Text,
  Provider as PaperProvider,
  HelperText,
} from "react-native-paper";
import { useDispatch } from "react-redux";
import { editVendor, fetchVendors } from "../redux/slices/VenderSlice";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditVendorScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { vender } = route.params;

  // Pre-fill fields from vender
  const [firstName, setFirstName] = useState(vender?.name || "");
  const [location, setLocation] = useState(
    vender?.location !== undefined && vender?.location !== null
      ? (typeof vender.location === "string"
          ? vender.location
          : vender.location.address || "")
      : ""
  );
  const [mobile, setMobile] = useState(vender?.phone || "");
  const [gpsUrl, setgpsUrl] = useState(vender?.gpsUrl || "");

  // error states
  const [errors, setErrors] = useState({});

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
    return Object.keys(newErrors).length === 0;
  };

  const handleEditVendor = async () => {
    if (!validateForm()) return;
    try {
      const formData = {
        firstName,
        location,
        mobile,
        gpsUrl,
      };
      await dispatch(editVendor({ id: vender.id, formData }));
      await dispatch(fetchVendors());
      navigation.goBack();
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
              >
                CANCEL
              </Button>
              <View style={{ width: 10 }} />
              <Button
                mode="contained"
                onPress={handleEditVendor}
                style={styles.addButton}
              >
                SAVE CHANGES
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
