import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Dialog, Portal, Text } from "react-native-paper";
import { useDispatch } from "react-redux";
import { createRule } from "../redux/slices/RulesSlice"; // make sure this action exists
import Loader from "../components/Loader"; // your custom loader component
import Toast from "react-native-toast-message";

const AddRuleScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddRule = () => {
    if (!ruleName.trim() || !description.trim()) {
      Toast.show({
        type: "error",
        text1: "Please fill in all the fields.",
      });
      return;
    }

    const ruleData = {
      name: ruleName,
      description,
    };

    setLoading(true);

    dispatch(createRule(ruleData))
      .unwrap()
      .then(() => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "Rule added successfully!",
        });
        navigation.goBack();
      })
      .catch(() => {
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
        label="Rule Name"
        value={ruleName}
        onChangeText={setRuleName}
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
        onPress={handleAddRule}
        loading={loading}
        style={styles.addButton}
      >
        Add Rule
      </Button>

      <Portal>
        <Dialog visible={loading} dismissable={false}>
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

export default AddRuleScreen;
