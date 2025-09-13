import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Alert,
  Platform
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
  Divider,
  Chip,
  Portal,
  Dialog
} from "react-native-paper";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchVenues, deleteVenue } from "../redux/slices/VenuesSlice";
import { fetchVendors } from "../redux/slices/VenderSlice";
import Loader from "../components/Loader";
import moment from "moment";
import * as XLSX from 'xlsx';
import { Image, TouchableOpacity } from 'react-native';

const rowsPerPageOptions = [2, 3, 5];

const ManageVenuesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { venues, loading, error } = useSelector((state) => state.venues);
  const { vendors } = useSelector((state) => state.vender);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const { width } = useWindowDimensions();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchVendors());
      dispatch(fetchVenues()); // Will be refactored to use /admin/turfs
    }, [dispatch])
  );

  const filteredVenues = venues.filter((venue) => {
    const search = searchText.trim().toLowerCase();
    if (!search) return true;
    return (
      (venue.turfId && venue.turfId.toString().toLowerCase().includes(search)) ||
      (venue.title && venue.title.toLowerCase().includes(search)) ||
      (venue.vendorName && venue.vendorName.toLowerCase().includes(search)) ||
      (venue.phone && venue.phone.toString().toLowerCase().includes(search))
    );
  });

  const paginatedVenues = filteredVenues.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isTablet = width >= 768;

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      const exportData = filteredVenues.map((venue, idx) => ({
        SNo: page * rowsPerPage + idx + 1,
        TurfId: venue.turfId,
        TurfName: venue.title,
        VendorName: venue.vendorName,
        Phone: venue.phone,
        Courts: Array.isArray(venue.courts) ? venue.courts.join(', ') : '-',
        CreatedAt: venue.createdAt ? moment(venue.createdAt).format('YYYY-MM-DD HH:mm') : '-',
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Turfs');
      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Turfs_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // For native, you can add expo-file-system/expo-sharing logic if needed
        Alert.alert('Export', 'Excel export is only supported on web in this version.');
      }
    } catch (err) {
      Alert.alert('Export Error', err.message || 'Failed to export turfs.');
      console.log('Export Error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.page}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.page}>
        <Card style={styles.card} mode="contained">
          <Card.Content>
            <View style={styles.tableHeaderControls}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Add Turf")}
                style={styles.addUserButton}
                labelStyle={styles.addUserButtonLabel}
                icon={() => <Icon name="add-location" size={20} color="#fff" />}
              >
                Add Turf
              </Button>

              <TextInput
                placeholder="Search by name..."
                value={searchText}
                onChangeText={setSearchText}
                mode="outlined"
                style={styles.searchInput}
                right={<TextInput.Icon icon="magnify" />}
              />
              {/* Export to Excel icon as TouchableOpacity */}
              <View style={styles.exportIconWrapper}>
                <TouchableOpacity onPress={handleExportExcel} activeOpacity={0.7} style={styles.exportTouchable}>
                  <Image
                    source={require('../assets/excel.jpg')}
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
                    Vendor Name
                  </DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>
                    Phone
                  </DataTable.Title>
                  {/* <DataTable.Title style={styles.headerCell}>
                    Open Time
                  </DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>
                    Close Time
                  </DataTable.Title> */}
                  <DataTable.Title style={styles.headerCell}>
                    Courts
                  </DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>
                    Created At
                  </DataTable.Title>
                </DataTable.Header>

                {paginatedVenues.map((venue, index) => (
                  <DataTable.Row key={venue.turfId} style={styles.row}>
                    <DataTable.Cell style={styles.cell}>
                      {page * rowsPerPage + index + 1}
                    </DataTable.Cell>

                    <DataTable.Cell style={styles.cell}>
                      <GreenActionMenu venue={venue} />
                    </DataTable.Cell>

                    <DataTable.Cell style={styles.cell}>
                      {venue.title}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      {venue.vendorName}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      {venue.phone}
                    </DataTable.Cell>
                    {/* <DataTable.Cell style={styles.cell}>
                      {venue.openTime}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      {venue.closeTime}
                    </DataTable.Cell> */}
                    <DataTable.Cell style={styles.cell}>
                      {Array.isArray(venue.courts) && venue.courts.length > 0
                        ? venue.courts.join(", ")
                        : "-"}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.cell}>
                      {venue.createdAt ? moment(venue.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}

                <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(filteredVenues.length / rowsPerPage)}
                  onPageChange={setPage}
                  label={`${page * rowsPerPage + 1}-${Math.min(
                    (page + 1) * rowsPerPage,
                    filteredVenues.length
                  )} of ${filteredVenues.length}`}
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
        <Text style={styles.footerText}>COPYRIGHT © KRIDA</Text>
      </Surface>
    </PaperProvider>
  );
};

const GreenActionMenu = ({ venue }) => {
  const { vendors, loading, error } = useSelector((state) => state.vender);
  //console.log("vendors",vendors)
  //console.log("venue", venue);
  const [visible, setVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const navigation = useNavigation();
  const vendor = vendors.find((v) => v.name === venue.vendorName);
  const vendorId = vendor?.id;
//  console.log("vendorId",vendorId);

  const dispatch = useDispatch();
  const handleDelete = async () => {
    if (vendorId && venue.turfId) {
      try {
        await dispatch(deleteVenue({ vendorId, turfId: venue.turfId })).unwrap();
        Toast.show({ type: "success", text1: "Venue deleted successfully" });
        setDeleteModalVisible(false);
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to delete venue", text2: err?.message || "" });
      }
    }
  };

  return (
    <>
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
            navigation.navigate("Venue Details");
          }}
          title="View"
          leadingIcon="eye"
        />
        <Menu.Item
          onPress={() => {
            setVisible(false);
            navigation.navigate("Edit Turf", {
              vendorId,
              turfId: venue.turfId,
              venue,
            });
          }}
          title="Edit"
          leadingIcon="pencil"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            setVisible(false);
            setDeleteModalVisible(true);
          }}
          title="Delete"
          leadingIcon="delete"
          titleStyle={{ color: "red" }}
        />
      </Menu>
      <Portal>
        <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)}>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete <Text style={{ fontWeight: "bold" }}>{venue.title}</Text>?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteModalVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} color="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
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
    marginTop: 16,
  },
  tableHeaderControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  addUserButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 40,
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
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
  exportIconWrapper: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
  },
  exportTouchable: {
    borderRadius: 18,
    backgroundColor: '#1976D2',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default ManageVenuesScreen;
