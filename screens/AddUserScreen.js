"use client"

import { useState } from "react"
import { ScrollView, StyleSheet, View, Dimensions } from "react-native"
import { TextInput, Text, Button, Card, Surface, Provider as PaperProvider, Menu } from "react-native-paper"

const { width } = Dimensions.get("window")

const countries = ["USA", "Canada", "India", "UK", "Australia"]
const statesByCountry = {
  USA: ["California", "Texas", "New York"],
  Canada: ["Ontario", "Quebec", "British Columbia"],
  India: ["Maharashtra", "Karnataka", "Delhi"],
  UK: ["England", "Scotland", "Wales"],
  Australia: ["New South Wales", "Victoria", "Queensland"],
}

export default function AddUserScreen() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const [countryMenuVisible, setCountryMenuVisible] = useState(false)
  const [stateMenuVisible, setStateMenuVisible] = useState(false)

  const availableStates = selectedCountry ? statesByCountry[selectedCountry] || [] : []

  const handleAddUser = () => {
    console.log("Add User Data:", {
      firstName,
      lastName,
      email,
      mobile,
      address1,
      address2,
      selectedCountry,
      selectedState,
      postalCode,
    })
    // Implement your logic to add the user (e.g., API call)
  }

  const handleCancel = () => {
    console.log("Cancel Pressed")
    // Implement your logic to navigate back or clear form
  }

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.page}>
        <Card style={styles.card} mode="contained">
          <Card.Content>

            {/* Form Fields */}
            <View style={styles.formRow}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                label="Mobile"
                value={mobile}
                onChangeText={setMobile}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <TextInput
                label="Address 1"
                value={address1}
                onChangeText={setAddress1}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Address 2"
                value={address2}
                onChangeText={setAddress2}
                mode="outlined"
                style={styles.input}
              />
            </View>

            {/* <View style={styles.formRow}>
              <Menu
                visible={countryMenuVisible}
                onDismiss={() => setCountryMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Country"
                    value={selectedCountry}
                    mode="outlined"
                    editable={false} // Make it non-editable to act as a dropdown trigger
                    right={<TextInput.Icon icon="menu-down" onPress={() => setCountryMenuVisible(true)} />}
                    onFocus={() => setCountryMenuVisible(true)}
                    style={styles.inputdrop} // Apply input style to the TextInput acting as anchor
                  />
                }

                style={[styles.menuContainer, { width: styles.input.width }]}
              >
                {countries.map((country) => (
                  <Menu.Item
                    key={country}
                    onPress={() => {
                      setSelectedCountry(country)
                      setSelectedState("") // Reset state when country changes
                      setCountryMenuVisible(false)
                    }}
                    title={country}
                  />
                ))}
              </Menu>
              <Menu
                visible={stateMenuVisible}
                onDismiss={() => setStateMenuVisible(false)}
                anchor={
                  <TextInput
                    label="State"
                    value={selectedState}
                    mode="outlined"
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" onPress={() => setStateMenuVisible(true)} />}
                    onFocus={() => setStateMenuVisible(true)}
                    style={styles.inputdrop} // Apply input style to the TextInput acting as anchor
                    disabled={!selectedCountry} // Disable if no country is selected
                  />
                }
                // Apply menuContainer style and explicitly set width
                style={[styles.menuContainer, { width: styles.input.width }]}
              >
                {availableStates.length > 0 ? (
                  availableStates.map((state) => (
                    <Menu.Item
                      key={state}
                      onPress={() => {
                        setSelectedState(state)
                        setStateMenuVisible(false)
                      }}
                      title={state}
                    />
                  ))
                ) : (
                  <Menu.Item title="Select a country first" disabled />
                )}
              </Menu>
            </View> */}

            <View style={styles.formRow}>
              <TextInput
                label="Postal Code"
                value={postalCode}
                onChangeText={setPostalCode}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              {/* Empty view to maintain two-column layout */}
              <View style={styles.inputPlaceholder} />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                CANCEL
              </Button>
              <Button
                mode="contained"
                onPress={handleAddUser}
                style={styles.addButton}
                labelStyle={styles.addButtonLabel}
              >
                ADD USER
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Surface style={styles.footer}>
        <Text style={styles.footerText}>COPYRIGHT © YOUNG DECADE IT SOFTWARE SOLUTION</Text>
      </Surface>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "white",
    elevation: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  formRow: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows items to wrap to the next line if space is insufficient
    justifyContent: "space-between", // Distributes items with space between them
    marginBottom: 16,
  },
  input: {
    width: "48%", // Each input takes roughly half the width, leaving space for gap
    marginBottom: 16, // Consistent margin below each input
    backgroundColor: "#fdfdfd",
  },
  inputdrop:{
     width: 500, // Each input takes roughly half the width, leaving space for gap
    marginBottom: 16, // Consistent margin below each input
    backgroundColor: "#fdfdfd",
  },
  inputPlaceholder: {
    width: "48%", // Placeholder to maintain two-column layout for single fields
    marginBottom: 16,
  },
  menuContainer: {
    // This style is applied to the Menu component itself, which controls the dropdown's popover width
    // The width is dynamically set in the component using `styles.input.width`
    // Add any other styling for the menu popover here if needed
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 10, // Space between buttons
  },
  cancelButton: {
    borderColor: "#2196F3", // Blue border
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonLabel: {
    color: "#2196F3", // Blue text
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4CAF50", // Green background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
})
