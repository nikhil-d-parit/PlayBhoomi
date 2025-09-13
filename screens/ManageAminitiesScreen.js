import { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, View, Alert, } from "react-native";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAmenities, deleteAmenity } from "../redux/slices/AmenitiesSlice";
import Loader from "../components/Loader";
import Toast from "react-native-toast-message";

const rowsPerPageOptions = [2, 3, 5];

const ManageAminitiesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  

  // Fetch amenities from the Redux store
  const { amenities, loading, error } = useSelector((state) => state.amenities);

  // Fetch amenities when the component mounts
   useFocusEffect(
      useCallback(() => {
        setSearchText(""); // clear search input
         dispatch(fetchAmenities()); // fetch latest vendors
      }, [dispatch])
    );

  // Ensure amenities is always an array, and filter it if it's an array
  const filteredAmenities = Array.isArray(amenities)
    ? amenities.filter((amenity) => {
        const nameMatches =
          amenity.name &&
          amenity.name.toLowerCase().includes(searchText.toLowerCase());
        const descriptionMatches =
          amenity.description &&
          amenity.description.toLowerCase().includes(searchText.toLowerCase());
        return nameMatches || descriptionMatches;
      })
    : [];

  // Paginate filtered amenities
  const paginatedAmenities = filteredAmenities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <PaperProvider>
      {loading ? (
        <Loader /> // This is displayed while loading
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.page}>
            {/* Data Table Card */}
            <Card style={styles.card} mode="contained">
              <Card.Content>
                {/* Controls for Add Amenity and Search */}
                <View style={styles.tableHeaderControls}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Add Amenity")}
                    style={styles.addUserButton}
                    labelStyle={styles.addUserButtonLabel}
                    icon={() => (
                      <Icon name="person-add" size={20} color="#fff" />
                    )}
                  >
                   Add Amenity
                  </Button>
                  <TextInput
                    placeholder="Search..."
                    value={searchText}
                    onChangeText={setSearchText}
                    mode="outlined"
                    style={styles.searchInput}
                    right={<TextInput.Icon icon="magnify" />}
                  />
                </View>

                {/* Data Table */}
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
                        Description
                      </DataTable.Title>
                    </DataTable.Header>

                    {/* Map through the paginated amenities */}
                    {paginatedAmenities.map((amenity, index) => (
                      <DataTable.Row key={index} style={styles.row}>
                        <DataTable.Cell style={styles.cell}>
                          {page * rowsPerPage + index + 1}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          <GreenActionMenu amenity ={amenity} />
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {amenity.name}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {amenity.description}
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}

                    {/* Pagination */}
                    <DataTable.Pagination
                      page={page}
                      numberOfPages={Math.ceil(
                        filteredAmenities.length / rowsPerPage
                      )}
                      onPageChange={setPage}
                      label={`${page * rowsPerPage + 1}-${Math.min(
                        (page + 1) * rowsPerPage,
                        filteredAmenities.length
                      )} of ${filteredAmenities.length}`}
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
        </>
      )}
    </PaperProvider>
  );
};

const GreenActionMenu = ({amenity} ) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // For the delete confirmation modal
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteAmenity(amenity.id)) // Assuming deleteAmenity deletes the amenity
      .then(() => {
        setDeleteModalVisible(false); // Close the modal
        Toast.show({
                type: "success",
                text1: response.data.message || "Amenity deleted successfully",
              });
      })
      .catch((error) => {
        setDeleteModalVisible(false); // Close the modal
         Toast.show({
                type: "error",
                text1: response.data.message || "There was an issue deleting the amenity",
              });
      });
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
          navigation.navigate("Edit Amenity", { amenity });
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
    {/* Delete Confirmation Modal */}
      <Portal>
        <Dialog visible={deleteModalVisible} onDismiss={() => setDeleteModalVisible(false)}>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this amenity?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteModalVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} color="red">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </>
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
});

export default ManageAminitiesScreen;
