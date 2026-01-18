import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Alert,
  Platform,
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
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/slices/UserSlice";
import theme from "../theme";
import * as XLSX from "xlsx";
import { Image, TouchableOpacity } from "react-native";

const rowsPerPageOptions = [5, 10];

const ManageUsersScreen = () => {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const userArray = Array.isArray(users)
    ? users
    : Array.isArray(users?.users)
    ? users.users
    : [];

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUsers());
    }, [dispatch])
  );

  const filteredUsers = userArray.filter((user) => {
    const search = searchText.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase?.().includes(search) || // only if phone is a string
      user.email?.toLowerCase().includes(search)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      const exportData = filteredUsers.map((user, idx) => ({
        SNo: page * rowsPerPage + idx + 1,
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        Status: user.status || "Active",
        CreatedAt: user.createdAt
          ? new Date(user.createdAt).toLocaleString()
          : "-",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      if (Platform.OS === "web") {
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Users_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        Alert.alert(
          "Export",
          "Excel export is only supported on web in this version."
        );
      }
    } catch (err) {
      Alert.alert(
        "Export Error",
        err.message || "Failed to export users."
      );
      console.log("Export Error:", err);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <PaperProvider theme={theme}>
          <ScrollView contentContainerStyle={styles.page}>
            <Card style={styles.card} mode="contained">
              <Card.Content>
                <View style={styles.tableHeaderControls}>
                  {/* <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Add User")}
                    style={styles.addUserButton}
                    labelStyle={styles.addUserButtonLabel}
                    icon={() => <Icon name="person-add" size={20} color="#fff" />}
                  >
                    Add User
                  </Button> */}
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
                      {/* <DataTable.Title style={styles.headerCell}>
                      Action
                    </DataTable.Title> */}
                      <DataTable.Title style={styles.headerCell}>
                        Name
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Email
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Mobile
                      </DataTable.Title>
                      {/* <DataTable.Title style={styles.headerCell}>
                      Status
                    </DataTable.Title> */}
                      <DataTable.Title style={styles.headerCell}>
                        Date & Time
                      </DataTable.Title>
                    </DataTable.Header>

                    {paginatedUsers.map((user, index) => (
                      <DataTable.Row key={user.id} style={styles.row}>
                        <DataTable.Cell style={styles.cell}>
                          {page * rowsPerPage + index + 1}
                        </DataTable.Cell>
                        {/* <DataTable.Cell style={styles.cell}>
                        <GreenActionMenu />
                      </DataTable.Cell> */}
                        <DataTable.Cell style={styles.cell}>
                          {user.name}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {user.email}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {user.phone}
                        </DataTable.Cell>
                        {/* <DataTable.Cell style={styles.cell}>
                        {user.status}
                      </DataTable.Cell> */}
                        <DataTable.Cell style={styles.cell}>
                          {moment(user.createdAt).format("LL")}
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 16 }}>No users found</Text>
                      </View>
                    )}

                    <DataTable.Pagination
                      page={page}
                      numberOfPages={Math.ceil(
                        filteredUsers.length / rowsPerPage
                      )}
                      onPageChange={setPage}
                      label={`${page * rowsPerPage + 1}-${Math.min(
                        (page + 1) * rowsPerPage,
                        filteredUsers.length
                      )} of ${filteredUsers.length}`}
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
      )}
    </>
  );
};

const GreenActionMenu = () => {
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
          navigation.navigate("User Details");
        }}
        title="View"
        leadingIcon="eye"
      />
      <Menu.Item
        onPress={() => {
          setVisible(false);
          console.log("Edit user");
        }}
        title="Edit"
        leadingIcon="pencil"
      />
      <Divider />
      <Menu.Item
        onPress={() => {
          setVisible(false);
          handleDelete();
        }}
        title="Delete"
        leadingIcon="delete"
        titleStyle={{ color: "red" }}
      />
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
    width: 250,
    backgroundColor: "#fdfdfd",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 8,
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
});

export default ManageUsersScreen;
