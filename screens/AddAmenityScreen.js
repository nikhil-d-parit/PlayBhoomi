import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Dialog, Portal, Text } from "react-native-paper";
import { useDispatch } from "react-redux";
import { createAmenity } from "../redux/slices/AmenitiesSlice"; // Assuming the action is correct
import Loader from "../components/Loader";
import Toast from "react-native-toast-message";


const AddAmenityScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // State for form inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Hardcoded icon URL
  const icon = "https://example.com/icons/wifi.png";

  const handleAddAmenity = () => {
    if (!name || !description) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    // Prepare the request body
    const amenityData = {
      name,
      description,
      icon,
    };

    setLoading(true);

    // Dispatch the action to create the amenity
    dispatch(createAmenity(amenityData))
      .then(() => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Amenity added successfully!",
        });
        navigation.goBack(); // Go back to the previous screen after successful submission
      })
      .catch((err) => {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong!",
        });
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
        mode="outlined"
        multiline
      />

      <Button
        mode="contained"
        onPress={handleAddAmenity}
        loading={loading}
        style={styles.addButton}
      >
        Add Amenity
      </Button>

      <Portal>
        <Dialog visible={loading} onDismiss={() => setLoading(false)}>
          <Loader />
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width:'15%'
  },
});

export default AddAmenityScreen;
