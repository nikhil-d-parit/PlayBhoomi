import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { updateRule } from "../redux/slices/RulesSlice"; // Make sure this action exists
import Toast from "react-native-toast-message";

const EditRuleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // Destructure rule object from route params (should contain id, name, description)
  const { rule } = route.params;

  const [name, setName] = useState(rule?.name || "");
  const [description, setDescription] = useState(rule?.description || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateRule = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in both Rule Name and Description.");
      return;
    }

    setLoading(true);

    const updatedRule = {
      name: name.trim(),
      description: description.trim(),
    };

    dispatch(updateRule({ id: rule.id, ruleData: updatedRule }))
      .unwrap()
      .then(() => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Rule updated successfully!",
        });
        navigation.goBack();
      })
      .catch(() => {
        setLoading(false);
        Alert.alert("Error", "There was an issue updating the rule.");
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Rule Name"
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
          onPress={handleUpdateRule}
          loading={loading}
          style={styles.updateButton}
          contentStyle={{ height: 40, justifyContent: "center" }} // centers content vertically
          labelStyle={styles.buttonLabel} // centers label horizontally
        >
          Update Rule
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

export default EditRuleScreen;
