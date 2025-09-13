import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { updateAmenity } from "../redux/slices/AmenitiesSlice"; // Update action
import Toast from "react-native-toast-message";

const EditAmenityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // Get the amenity to edit from the route params
  const { amenity } = route.params;

  const [name, setName] = useState(amenity.name);
  const [description, setDescription] = useState(amenity.description);
  const [loading, setLoading] = useState(false);

  const handleUpdateAmenity = () => {
    if (!name || !description) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    // Create the updated amenity object
    const updatedAmenity = {
      name,
      description,
      icon: amenity.icon, // keep the existing icon
    };

    setLoading(true);

    // Dispatch the update amenity action
    dispatch(updateAmenity({ id: amenity.id, amenityData: updatedAmenity }))
      .then(() => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Amenity updated successfully!",
        });
        navigation.goBack(); // Go back after successful update
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", "There was an issue updating the amenity.");
      });
  };

  return (
    <View style={styles.container}>
          <TextInput
            label="Amenity Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={4}
            mode="outlined"
          />
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Button
              mode="contained"
              onPress={handleUpdateAmenity}
              loading={loading}
              style={styles.updateButton}
              contentStyle={{ height: 40, justifyContent: "center" }}
              labelStyle={styles.buttonLabel}
            >
              Update Amenity
            </Button>
          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    width: 200,
    height: 40,
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});

export default EditAmenityScreen;
