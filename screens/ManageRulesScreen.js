import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Modal,
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
import Loader from "../components/Loader";
import theme from "../theme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRules,
  createTurfRule,
  updateTurfRule,
  deleteRule,
} from "../redux/slices/RulesSlice";

const rowsPerPageOptions = [5, 10];

const ManageRulesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get state from Redux
  const { rules, loading, error } = useSelector((state) => state.rules);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false); // For adding/editing rule
  const [ruleText, setRuleText] = useState(""); // New rule input
  const [currentTurfId, setCurrentTurfId] = useState(null); // Turf ID for adding rule
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Fetch rules on mount
  useFocusEffect(
    useCallback(() => {
      setSearchText(""); // clear search input
      dispatch(fetchRules()); // fetch latest vendors
    }, [dispatch])
  );

  // Ensure amenities is always an array, and filter it if it's an array
  const filteredRules = Array.isArray(rules)
    ? rules.filter((rule) => {
        if (!searchText.trim()) {
          return true; // If searchText is empty or spaces, return all rules
        }
        const nameMatches =
          rule.name &&
          rule.name.toLowerCase().includes(searchText.toLowerCase());
        const descriptionMatches =
          rule.description &&
          rule.description.toLowerCase().includes(searchText.toLowerCase());
        return nameMatches || descriptionMatches;
      })
    : [];
  console.log(filteredRules);

  const paginatedRules = filteredRules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAddRule = (turfId) => {
    setCurrentTurfId(turfId); // Store the turf ID to associate the rule
    setRuleText(""); // Clear previous input
    setModalVisible(true); // Show modal for adding rule
  };

  const handleSaveRule = () => {
    if (ruleText.trim()) {
      // Create a new rule for the turf
      dispatch(
        createTurfRule({ turfId: currentTurfId, ruleData: { ruleText } })
      );
      setModalVisible(false); // Close modal
    }
  };

  const handleUpdateRule = (turfId, ruleId, updatedRule) => {
    dispatch(
      updateTurfRule({ turfId, ruleId, ruleData: { ruleText: updatedRule } })
    );
  };

  return (
    <PaperProvider theme={theme}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.page}>
            <Card style={styles.card} mode="contained">
              <Card.Content>
                {/* Top controls */}
                <View style={styles.tableHeaderControls}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Add Rule")}
                    style={styles.addUserButton}
                    labelStyle={styles.addUserButtonLabel}
                    icon={() => <Icon name="add" size={20} color="#fff" />}
                  >
                    Add Rule
                  </Button>

                  <TextInput
                    placeholder="Search"
                    value={searchText}
                    onChangeText={setSearchText}
                    mode="outlined"
                    style={styles.searchInput}
                    right={<TextInput.Icon icon="magnify" />}
                  />
                </View>

                {/* Table */}
                <ScrollView horizontal>
                  <DataTable style={{ width: 1300 }}>
                    <DataTable.Header style={styles.headerRow}>
                      <DataTable.Title style={styles.headerCell}>
                        S.No
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Action
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Rule
                      </DataTable.Title>
                      <DataTable.Title style={styles.headerCell}>
                        Description
                      </DataTable.Title>
                    </DataTable.Header>

                    {paginatedRules.map((rule, index) => (
                      <DataTable.Row key={rule.id} style={styles.row}>
                        <DataTable.Cell style={styles.cell}>
                          {page * rowsPerPage + index + 1}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          <GreenActionMenu rule={rule} />
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {rule.name}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.cell}>
                          {rule.description}
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                    {paginatedRules.length === 0 && (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 16 }}>No rules found</Text>
                      </View>
                    )}

                    <DataTable.Pagination
                      page={page}
                      numberOfPages={Math.ceil(
                        filteredRules.length / rowsPerPage
                      )}
                      onPageChange={setPage}
                      label={`${page * rowsPerPage + 1}-${Math.min(
                        (page + 1) * rowsPerPage,
                        filteredRules.length
                      )} of ${filteredRules.length}`}
                      showFastPaginationControls
                    />
                  </DataTable>
                </ScrollView>
              </Card.Content>
            </Card>
          </ScrollView>

          {/* Footer */}
          <Surface style={styles.footer}>
            <Text style={styles.footerText}>COPYRIGHT © KRIDA</Text>
          </Surface>

          {/* Modal for adding/updating rules */}
          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enter Rule</Text>
                <TextInput
                  value={ruleText}
                  onChangeText={setRuleText}
                  mode="outlined"
                  label="Rule Text"
                  style={styles.input}
                />
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveRule}
                    style={styles.modalButton}
                  >
                    Save Rule
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </PaperProvider>
  );
};

const GreenActionMenu = ({ rule }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // For the delete confirmation modal
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteRule(rule.id)) // Assuming deleteAmenity deletes the amenity
      .then(() => {
        setDeleteModalVisible(false); // Close the modal
        Toast.show({
          type: "success",
          text1: "Rule deleted successfully",
        });
      })
      .catch((error) => {
        setDeleteModalVisible(false); // Close the modal
        Toast.show({
          type: "error",
          text1: "There was an issue deleting the rule",
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
            navigation.navigate("Edit Rule", { rule });
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
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
        >
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
              <Text>Are you sure you want to delete this rule?</Text>
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

export default ManageRulesScreen;
