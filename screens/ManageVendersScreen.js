import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Alert,
  Modal,
  TouchableOpacity,
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
  Portal,
  Dialog,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from 'react-native';
import Loader from "../components/Loader";
import theme from "../theme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors, updateVendorStatus } from "../redux/slices/VenderSlice";
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const rowsPerPageOptions = [5, 10];

const ManageVendersScreen = () => {
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vender);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  // For status toggle
  const handleToggleStatus = (vendor) => {
    const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
    dispatch(updateVendorStatus({ vendorId: vendor.id, status: newStatus }));
  };

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      // Prepare data
      const exportData = filteredVenders.map((vender, idx) => ({
        SNo: page * rowsPerPage + idx + 1,
        Name: vender.name,
        Email: vender.email,
        Mobile: vender.phone,
        Status: vender.status || "Active",
        DateTime: new Date(vender.createdAt).toLocaleString(),
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vendors");

      if (Platform.OS === 'web') {
        // Web: trigger browser download
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vendors_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Native: use expo-file-system and expo-sharing
        const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
        const fileUri = FileSystem.cacheDirectory + `Vendors_${Date.now()}.xlsx`;
        await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert("Sharing not available", "Exported file saved at: " + fileUri);
          console.log("Sharing not available. File saved at:", fileUri);
          return;
        }
        await Sharing.shareAsync(fileUri, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", dialogTitle: "Share Excel File" });
      }
    } catch (err) {
      Alert.alert("Export Error", err.message || "Failed to export vendors.");
      console.log("Export Error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSearchText(""); // clear search input
      dispatch(fetchVendors()); // fetch latest vendors
    }, [dispatch])
  );

  const filteredVenders = vendors.filter((vender) => {
    const searchLower = searchText.toLowerCase();
    return (
      vender.name.toLowerCase().includes(searchLower) ||
      (vender.email && vender.email.toLowerCase().includes(searchLower)) ||
      (vender.phone && vender.phone.toLowerCase().includes(searchLower))
    );
  });
  const paginatedVenders = filteredVenders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <PaperProvider theme={theme}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.page}>
            {/* Data Table Card */}
            <Card style={styles.card} mode="contained">
              <Card.Content>
                {/* Controls */}
                <View style={styles.tableHeaderControls}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Add vendor")}
                    style={styles.addUserButton}
                    labelStyle={styles.addUserButtonLabel}
                    icon={() => (
                      <Icon name="person-add" size={20} color="#fff" />
                    )}
                  >
                    Add Vendor
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
                        Name
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Email
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Mobile
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Status
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Date & Time
                      </DataTable.Title>
                    </DataTable.Header>

                    {paginatedVenders.map((vender, index) => (
                      <DataTable.Row key={vender.id} style={styles.row}>
                        <DataTable.Cell style={styles.cell}>
                          {page * rowsPerPage + index + 1}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          <GreenActionMenu vender={vender} handleToggleStatus={handleToggleStatus} />
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {vender.name}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {vender.email}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {vender.phone}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {vender.status || "Active"}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {new Date(vender.createdAt).toLocaleString()}
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                    {paginatedVenders.length === 0 && (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 16 }}>No vendors found</Text>
                      </View>
                    )}

                    <DataTable.Pagination
                      page={page}
                      numberOfPages={Math.ceil(
                        filteredVenders.length / rowsPerPage
                      )}
                      onPageChange={setPage}
                      label={`${page * rowsPerPage + 1}-${Math.min(
                        (page + 1) * rowsPerPage,
                        filteredVenders.length
                      )} of ${filteredVenders.length}`}
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
        </>
      )}
    </PaperProvider>
  );
};

// Removed duplicate GreenActionMenu declaration
const GreenActionMenu = ({ vender, handleToggleStatus }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const isActive = vender.status === 'Active' || !vender.status;

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
          navigation.navigate("Vendor Details", { venderId: vender.id });
        }}
        title="View"
        leadingIcon="eye"
      />
      <Menu.Item
        onPress={() => {
          setVisible(false);
          navigation.navigate("Edit Vendor", { vender });
        }}
        title="Edit"
        leadingIcon="pencil"
      />
      <Menu.Item
        onPress={() => {
          setVisible(false);
          handleToggleStatus(vender);
        }}
        title={isActive ? "Mark as Inactive" : "Mark as Active"}
        leadingIcon={isActive ? "close-circle" : "check-circle"}
      />
      <Divider />
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
  // ...existing code...
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: 280,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default ManageVendersScreen;
