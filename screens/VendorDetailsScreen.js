import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorById } from "../redux/slices/VenderSlice";
import Loader from "../components/Loader"; // your custom loader component

const VendorDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { venderId } = route.params;

  // Select vendor details and loading state from Redux
  const {
    selectedVendor: vendor,
    loading,
    error,
  } = useSelector((state) => state.vender);

  useEffect(() => {
    dispatch(fetchVendorById(venderId))
      .unwrap()
      .catch(() => {
        Alert.alert("Error", "Failed to load vendor details.");
      });
  }, [dispatch, venderId]);

  if (loading) {
    return <Loader />; // Your custom loader component
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.center}>
        <Text>No vendor found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card style={styles.card}>
        <Card.Title title="Vendor Details" />
        <Card.Content>
          <Text style={styles.label}>Vendor ID:</Text>
          <Text style={styles.value}>{vendor.id}</Text>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{vendor.name}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{vendor.email}</Text>

          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{vendor.phone}</Text>

          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{vendor.status || "Active"}</Text>

          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {vendor.createdAt
              ? new Date(vendor.createdAt).toLocaleString()
              : "N/A"}
          </Text>

          {/* Add other fields as needed */}
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Back
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  backButton: {
    alignSelf: "center",
    width: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VendorDetailsScreen;
