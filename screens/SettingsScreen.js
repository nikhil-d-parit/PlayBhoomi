import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, TextInput, Button, Card, Divider } from "react-native-paper";
import Toast from "react-native-toast-message";
import Api from "../redux/Api";

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [taxRate, setTaxRate] = useState("");
  const [convenienceFee, setConvenienceFee] = useState("");
  const [discountRate, setDiscountRate] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await Api.get("/settings");
        setTaxRate(String(res.data.taxRate ?? 0));
        setConvenienceFee(String(res.data.convenienceFee ?? 35));
        setDiscountRate(String(res.data.discountRate ?? 0));
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load settings", position: "bottom" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const tax = parseFloat(taxRate);
    const fee = parseFloat(convenienceFee);
    const discount = parseFloat(discountRate);

    if (isNaN(tax) || tax < 0) return Alert.alert("Validation", "Enter a valid tax rate (≥ 0)");
    if (isNaN(fee) || fee < 0) return Alert.alert("Validation", "Enter a valid convenience fee (≥ 0)");
    if (isNaN(discount) || discount < 0 || discount > 100)
      return Alert.alert("Validation", "Discount rate must be 0–100");

    setSaving(true);
    try {
      await Api.put("/settings", {
        taxRate: tax,
        convenienceFee: fee,
        discountRate: discount,
      });
      Toast.show({ type: "success", text1: "Settings saved", position: "bottom" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: err.response?.data?.message || err.message,
        position: "bottom",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Pricing Settings" subtitle="Applied to all bookings" />
        <Card.Content>
          <Text style={styles.label}>Tax Rate (%)</Text>
          <TextInput
            mode="outlined"
            value={taxRate}
            onChangeText={setTaxRate}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="e.g. 18"
          />
          <Text style={styles.hint}>GST or applicable tax percentage on base amount</Text>

          <Divider style={styles.divider} />

          <Text style={styles.label}>Convenience Fee (₹)</Text>
          <TextInput
            mode="outlined"
            value={convenienceFee}
            onChangeText={setConvenienceFee}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="e.g. 35"
          />
          <Text style={styles.hint}>Fixed fee added per booking (in rupees)</Text>

          <Divider style={styles.divider} />

          <Text style={styles.label}>Discount Rate (%)</Text>
          <TextInput
            mode="outlined"
            value={discountRate}
            onChangeText={setDiscountRate}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="e.g. 10"
          />
          <Text style={styles.hint}>Discount applied on subtotal (base + tax + fee)</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
        buttonColor="#2e7d32"
      >
        Save Settings
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 12 },
  input: { marginTop: 6 },
  hint: { fontSize: 12, color: "#777", marginTop: 4 },
  divider: { marginVertical: 12 },
  saveButton: { marginTop: 8 },
});

export default SettingsScreen;
