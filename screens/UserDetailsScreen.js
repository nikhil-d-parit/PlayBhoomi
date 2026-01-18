"use client"

import { useState } from "react"
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native"
import {
  DataTable,
  TextInput,
  Text,
  Menu,
  Button,
  Card,
  Surface,
  Provider as PaperProvider,
  Avatar, // Import Avatar for the personal details card
  Chip, // Import Chip for the status badge
} from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native" // Assuming @react-navigation/native is installed
import theme from "../theme";

const usersData = [
  {
    id: 1,
    name: "rssguh",
    email: "clevercrap@gmail.com",
    mobile: "8807472336",
    status: "Active",
    createdAt: "16/07/25 04:23 PM",
  },
  {
    id: 2,
    name: "Azeem shaikh",
    email: "Azeemshaikh10h@gmail.com",
    mobile: "6352556249",
    status: "Active",
    createdAt: "15/07/25 01:56 PM",
  },
  {
    id: 3,
    name: "saaransh",
    email: "jainsaaransh4@gmail.com",
    mobile: "9752230477",
    status: "Active",
    createdAt: "15/07/25 01:10 PM",
  },
  {
    id: 4,
    name: "prasad",
    email: "prasadsalvi2001@gmail.com",
    mobile: "9588665948",
    status: "Active",
    createdAt: "14/07/25 10:28 PM",
  },
]

const rowsPerPageOptions = [5, 10]

const UserDatailsScreen = () => {
  const [searchText, setSearchText] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const { width } = useWindowDimensions()
  const isTablet = width >= 768 // This variable is not directly used in the new layout but kept for context

  const filteredUsers = usersData.filter((user) => user.name.toLowerCase().includes(searchText.toLowerCase()))
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Mock user data for the personal details card (using the first user for demonstration)
  const userData = usersData[0] || {
    id: 0,
    name: "N/A",
    email: "N/A",
    mobile: "N/A",
    status: "N/A",
    createdAt: "N/A",
  }

  // Function to get initials for Avatar.Text
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <PaperProvider theme={theme}>
      <ScrollView contentContainerStyle={styles.page}>
        {/* Personal Details Card */}
        <Card style={styles.personalDetailsCard} mode="contained">
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.profileSection}>
              <Avatar.Text
                size={80}
                label={getInitials(userData.name)}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{userData.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{userData.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mobile:</Text>
                  <Text style={styles.detailValue}>{userData.mobile}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Chip style={styles.statusChip} textStyle={styles.statusText}>
                    {userData.status}
                  </Chip>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Create Date & Time:</Text>
                  <Text style={styles.detailValue}>{new Date(userData.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Data Table Card */}
        <Card style={styles.card} mode="contained">
          <Card.Content>
             <Text style={styles.sectionTitle}>Booking History</Text>
            <ScrollView horizontal>
              <DataTable style={{ minWidth: 1300 }}>
                <DataTable.Header style={styles.headerRow}>
                  <DataTable.Title style={styles.headerCell}>S.No</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Action</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Name</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Email</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Mobile</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Status</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Date & Time</DataTable.Title>
                </DataTable.Header>
                {paginatedUsers.map((user, index) => (
                  <DataTable.Row key={user.id} style={styles.row}>
                    <DataTable.Cell style={styles.cell}>{page * rowsPerPage + index + 1}</DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      <GreenActionMenu />
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>{user.name}</DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>{user.email}</DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>{user.mobile}</DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>{user.status}</DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>{user.createdAt}</DataTable.Cell>
                  </DataTable.Row>
                ))}
                {paginatedUsers.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 16 }}>No booking history found</Text>
                  </View>
                )}
                <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(filteredUsers.length / rowsPerPage)}
                  onPageChange={setPage}
                  label={`${page * rowsPerPage + 1}-${Math.min(
                    (page + 1) * rowsPerPage,
                    filteredUsers.length,
                  )} of ${filteredUsers.length}`}
                  showFastPaginationControls
                />
              </DataTable>
            </ScrollView>
          </Card.Content>
        </Card>
      </ScrollView>
      <Surface style={styles.footer}>
        <Text style={styles.footerText}>COPYRIGHT © YOUNG DECADE IT SOFTWARE SOLUTION</Text>
      </Surface>
    </PaperProvider>
  )
}

const GreenActionMenu = () => {
  const [visible, setVisible] = useState(false)
  const navigation = useNavigation() // This hook requires @react-navigation/native to be set up

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="contained"
          onPress={() => setVisible(true)}
          style={styles.greenButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.greenButtonLabel}
          icon={() => <Icon name="arrow-drop-down" size={16} color="#fff" style={{ marginLeft: 4 }} />}
        >
          ACTION
        </Button>
      }
    >
      <Menu.Item
        onPress={() => navigation.navigate("User Details")} // Make sure "User Details" route exists
        title="View"
      />
      <Menu.Item onPress={() => {}} title="Edit" />
      <Menu.Item onPress={() => {}} title="Delete" />
    </Menu>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    flexGrow: 1, // Ensure ScrollView takes full height
  },
  card: {
    backgroundColor: "white",
    elevation: 4,
    borderRadius: 8,
    marginTop: 16, // Add margin to separate from personal details card
  },
  personalDetailsCard: {
    backgroundColor: "white",
    elevation: 4,
    borderRadius: 8,
    marginBottom: 16, // Add margin to separate from data table card
  },
  searchInput: {
    marginBottom: 12,
    backgroundColor: "#fdfdfd",
  },
  greenButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  greenButtonLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  buttonContent: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#F4F4F4",
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingVertical: 12,
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
  // Styles for Personal Details Card
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  profileSection: {
    flexDirection: "column", // Default to column for small screens
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#4CAF50",
    marginBottom: 16, 
    alignItems:'center'

  },
  avatarLabel: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  detailsContainer: {
    flex: 1, // Allow details to take available space
    width: "100%", // Ensure it takes full width in column layout
    "@media (min-width: 600px)": {
      width: "auto", // Auto width in row layout
    },
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap", // Allow text to wrap
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
    minWidth: 120, // Ensure labels align
    marginRight: 8,
  },
  detailValue: {
    color: "#333",
    flexShrink: 1, // Allow value to shrink
  },
  statusChip: {
    backgroundColor: "#4CAF50",
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
})

export default UserDatailsScreen
