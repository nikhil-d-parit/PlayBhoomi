import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  Alert,
} from "react-native";
import {
  DataTable,
  TextInput,
  Text,
  Menu,
  Button,
  Card,
  Surface,
  Provider as PaperProvider,
  Avatar,
  Chip,
  Divider,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/slices/DashboardSlice";
import * as XLSX from "xlsx";
import { Image, TouchableOpacity } from "react-native";

const rowsPerPageOptions = [2, 3, 5];

const ManageBookingsScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const dispatch = useDispatch();
  const { bookings, total, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const filteredBookings = bookings.filter((item) =>
    item.turfName.toLowerCase().includes(searchText.toLowerCase())
  );
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      const exportData = filteredBookings.map((item, idx) => ({
        SNo: page * rowsPerPage + idx + 1,
        TurfName: item.turfName,
        Location: item.turfLocation,
        TimeSlot: item.timeSlot,
        Sports: item.sports,
        Status: item.paymentStatus,
        DateTime: item.date,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bookings_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        Alert.alert('Export', 'Excel export is only supported on web in this version.');
      }
    } catch (err) {
      Alert.alert('Export Error', err.message || 'Failed to export bookings.');
      console.log('Export Error:', err);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <PaperProvider>
        <ScrollView contentContainerStyle={styles.page}>
          {/* Data Table Card */}
          <Card style={styles.card} mode="contained">
            <Card.Content>
              {/* Container for Add User Button and Search Input */}
              <View style={styles.tableHeaderControls}>
                {/* <Button
                mode="contained"
                onPress={() => navigation.navigate('Add Booking')} // Replace with actual navigation/action
                style={styles.addUserButton}
                labelStyle={styles.addUserButtonLabel}
                icon={() => <Icon name="person-add" size={20} color="#fff" />}
              >
                Add Booking
              </Button> */}
                <TextInput
                  placeholder="Search..."
                  value={searchText}
                  onChangeText={setSearchText}
                  mode="outlined"
                  style={styles.searchInput}
                  right={<TextInput.Icon icon="magnify" />}
                />
                {/* Export to Excel icon as TouchableOpacity */}
                <View style={styles.exportIconWrapper}>
                  <TouchableOpacity
                    onPress={handleExportExcel}
                    activeOpacity={0.7}
                    style={styles.exportTouchable}
                  >
                    <Image
                      source={require("../assets/excel.jpg")}
                      style={styles.exportImage}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView horizontal>
                <DataTable style={{ minWidth: 1300 }}>
                  <DataTable.Header style={styles.headerRow}>
                    <DataTable.Title style={styles.headerCell}>
                      S.No
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Action
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Turf Name
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Location
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Time Slot
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Sports
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Status
                    </DataTable.Title>
                    <DataTable.Title style={styles.headerCell}>
                      Date & Time
                    </DataTable.Title>
                  </DataTable.Header>
                  {paginatedBookings.map((item, index) => (
                    <DataTable.Row key={item.id} style={styles.row}>
                      <DataTable.Cell style={styles.cell}>
                        {page * rowsPerPage + index + 1}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        <GreenActionMenu bookingId={item.bookingId} />
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.turfName}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.turfLocation}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.timeSlot}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.sports}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.paymentStatus}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.date}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                  <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(
                      filteredBookings.length / rowsPerPage
                    )}
                    onPageChange={setPage}
                    label={`${page * rowsPerPage + 1}-${Math.min(
                      (page + 1) * rowsPerPage,
                      filteredBookings.length
                    )} of ${filteredBookings.length}`}
                    numberOfItemsPerPage={rowsPerPage}
                    onItemsPerPageChange={setRowsPerPage}
                    numberOfItemsPerPageList={rowsPerPageOptions}
                    selectPageDropdownLabel="Rows per page"
                    showFastPaginationControls
                  />
                </DataTable>
              </ScrollView>
            </Card.Content>
          </Card>
        </ScrollView>
        <Surface style={styles.footer}>
          <Text style={styles.footerText}>
            COPYRIGHT © YOUNG DECADE IT SOFTWARE SOLUTION
          </Text>
        </Surface>
      </PaperProvider>
    </>
  );
};

const GreenActionMenu = ({ bookingId }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const handleDelete = () => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => console.log("User deleted"),
        style: "destructive",
      },
    ]);
  };
  const handleViewDetails = () => {
    navigation.navigate("Booking Details", { bookingId });
  };
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
          icon={() => <Icon name="arrow-drop-down" size={20} color="#fff" />}
        >
          ACTION
        </Button>
      }
    >
      <Menu.Item
        onPress={() => {
          setVisible(false);
          handleViewDetails();
        }}
        title="View"
        leadingIcon="eye"
      />
      {/* <Menu.Item
        onPress={() => {
          setVisible(false);
          console.log("Edit user");
        }}
        title="Edit"
        leadingIcon="pencil"
      /> */}
      {/* <Divider /> */}
      {/* <Menu.Item
        onPress={() => {
          setVisible(false);
          handleDelete();
        }}
        title="Delete"
        leadingIcon="delete"
        titleStyle={{ color: "red" }}
      /> */}
    </Menu>
  );
};

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
    marginTop: 16,
  },
  personalDetailsCard: {
    backgroundColor: "white",
    elevation: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  // Container for button and search input
  tableHeaderControls: {
    flexDirection: "row",
    justifyContent: "flex-end", // Pushes both items to the right
    alignItems: "center", // Vertically centers items
    marginBottom: 12,
    flexWrap: "wrap", // Allow wrapping on smaller screens
    gap: 10, // Space between button and search input
  },
  addUserButton: {
    backgroundColor: "#4CAF50", // A nice blue color for "Add User"
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 40, // Match height of search input
  },
  addUserButtonLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchInput: {
    width: 150,
    backgroundColor: "#fdfdfd",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 8,
  },
  exportIconWrapper: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    width: 36,
  },
  exportTouchable: {
    borderRadius: 18,
    backgroundColor: "#1976D2",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  profileSection: {
    flexDirection: "row", // Default to row for larger screens
    alignItems: "flex-start",
    marginBottom: 16,
    flexWrap: "wrap", // Allow wrapping on smaller screens
  },
  avatar: {
    backgroundColor: "#4CAF50",
    marginRight: 24, // Space to the right of avatar
    marginBottom: 16, // Fallback margin for wrapping
  },
  avatarLabel: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  detailsContainer: {
    flex: 1, // Allow details to take available space
    minWidth: 250, // Ensure details don't get too squished before wrapping
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
    minWidth: 120,
    marginRight: 8,
  },
  detailValue: {
    color: "#333",
    flexShrink: 1,
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
  greenButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  greenButtonLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonContent: {
    flexDirection: "row-reverse", // icon on right
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ManageBookingsScreen;
