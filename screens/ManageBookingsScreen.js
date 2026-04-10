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
  Chip,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Loader from "../components/Loader";
import theme from "../theme";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/slices/DashboardSlice";
import * as XLSX from "xlsx";
import { Image, TouchableOpacity } from "react-native";

const rowsPerPageOptions = [5, 10, 25];

const statusOptions = ["All", "confirmed", "cancelled", "pending"];
const sportOptions = ["All", "cricket", "football", "tennis", "badminton"];

const ManageBookingsScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { width } = useWindowDimensions();

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Menus
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [sportMenuVisible, setSportMenuVisible] = useState(false);

  const dispatch = useDispatch();
  const { bookings, total, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // Apply all filters
  const filteredBookings = bookings.filter((item) => {
    // Search
    const matchesSearch =
      !searchText ||
      (item.turfName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (item.turfLocation || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (item.bookingId || "").toLowerCase().includes(searchText.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "All" ||
      (item.bookingStatus || item.paymentStatus || "").toLowerCase() === statusFilter.toLowerCase();

    // Sport filter
    const matchesSport =
      sportFilter === "All" ||
      (item.sports || "").toLowerCase() === sportFilter.toLowerCase();

    // Date range filter
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && item.date >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && item.date <= dateTo;
    }

    return matchesSearch && matchesStatus && matchesSport && matchesDate;
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchText, statusFilter, sportFilter, dateFrom, dateTo]);

  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const clearFilters = () => {
    setStatusFilter("All");
    setSportFilter("All");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const activeFilterCount = [
    statusFilter !== "All",
    sportFilter !== "All",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

  // Export to Excel handler — exports filtered results
  const handleExportExcel = async () => {
    if (filteredBookings.length === 0) {
      Alert.alert("No Data", "No bookings to export with current filters.");
      return;
    }
    try {
      const exportData = filteredBookings.map((item, idx) => ({
        SNo: idx + 1,
        BookingID: item.bookingId || "",
        TurfName: item.turfName || "",
        Location: item.turfLocation || "",
        Sport: item.sports || "",
        TimeSlot: item.timeSlot || "",
        Date: item.date || "",
        Status: item.bookingStatus || item.paymentStatus || "",
        Amount: item.amount || item.finalAmount || "",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bookings");
      if (Platform.OS === "web") {
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Bookings_${dateFrom || "all"}_to_${dateTo || "all"}_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        Alert.alert("Export", "Excel export is only supported on web.");
      }
    } catch (err) {
      Alert.alert("Export Error", err.message || "Failed to export bookings.");
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <PaperProvider theme={theme}>
      <ScrollView contentContainerStyle={styles.page}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={styles.summaryNumber}>{filteredBookings.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.summaryNumber, { color: "#2E7D32" }]}>
              {filteredBookings.filter((b) => (b.bookingStatus || b.paymentStatus || "").toLowerCase() === "confirmed").length}
            </Text>
            <Text style={styles.summaryLabel}>Confirmed</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.summaryNumber, { color: "#E65100" }]}>
              {filteredBookings.filter((b) => (b.bookingStatus || b.paymentStatus || "").toLowerCase() === "pending").length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: "#FFEBEE" }]}>
            <Text style={[styles.summaryNumber, { color: "#C62828" }]}>
              {filteredBookings.filter((b) => (b.bookingStatus || b.paymentStatus || "").toLowerCase() === "cancelled").length}
            </Text>
            <Text style={styles.summaryLabel}>Cancelled</Text>
          </Card>
        </View>

        {/* Data Table Card */}
        <Card style={styles.card} mode="contained">
          <Card.Content>
            {/* Controls Row */}
            <View style={styles.tableHeaderControls}>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
              >
                <Icon name="filter-list" size={20} color={activeFilterCount > 0 ? "#fff" : "#333"} />
                <Text style={[styles.filterToggleText, activeFilterCount > 0 && { color: "#fff" }]}>
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Search turf, location, ID..."
                value={searchText}
                onChangeText={setSearchText}
                mode="outlined"
                style={styles.searchInput}
                right={<TextInput.Icon icon="magnify" />}
              />

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

            {/* Filter Panel */}
            {showFilters && (
              <View style={styles.filterPanel}>
                <View style={styles.filterRow}>
                  {/* Status Filter */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <Menu
                      visible={statusMenuVisible}
                      onDismiss={() => setStatusMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          onPress={() => setStatusMenuVisible(true)}
                          style={styles.filterDropdown}
                        >
                          <Text style={styles.filterDropdownText}>
                            {statusFilter === "All" ? "All Statuses" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                          </Text>
                          <Icon name="arrow-drop-down" size={20} color="#666" />
                        </TouchableOpacity>
                      }
                    >
                      {statusOptions.map((s) => (
                        <Menu.Item
                          key={s}
                          onPress={() => { setStatusFilter(s); setStatusMenuVisible(false); }}
                          title={s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                        />
                      ))}
                    </Menu>
                  </View>

                  {/* Sport Filter */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Sport</Text>
                    <Menu
                      visible={sportMenuVisible}
                      onDismiss={() => setSportMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          onPress={() => setSportMenuVisible(true)}
                          style={styles.filterDropdown}
                        >
                          <Text style={styles.filterDropdownText}>
                            {sportFilter === "All" ? "All Sports" : sportFilter.charAt(0).toUpperCase() + sportFilter.slice(1)}
                          </Text>
                          <Icon name="arrow-drop-down" size={20} color="#666" />
                        </TouchableOpacity>
                      }
                    >
                      {sportOptions.map((s) => (
                        <Menu.Item
                          key={s}
                          onPress={() => { setSportFilter(s); setSportMenuVisible(false); }}
                          title={s === "All" ? "All Sports" : s.charAt(0).toUpperCase() + s.slice(1)}
                        />
                      ))}
                    </Menu>
                  </View>

                  {/* Date From */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>From Date</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={dateFrom}
                      onChangeText={setDateFrom}
                      mode="outlined"
                      style={styles.filterDateInput}
                      dense
                    />
                  </View>

                  {/* Date To */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>To Date</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={dateTo}
                      onChangeText={setDateTo}
                      mode="outlined"
                      style={styles.filterDateInput}
                      dense
                    />
                  </View>
                </View>

                {/* Active Filters & Clear */}
                <View style={styles.filterActions}>
                  {activeFilterCount > 0 && (
                    <>
                      {statusFilter !== "All" && (
                        <Chip
                          onClose={() => setStatusFilter("All")}
                          style={styles.filterChip}
                          textStyle={styles.filterChipText}
                        >
                          Status: {statusFilter}
                        </Chip>
                      )}
                      {sportFilter !== "All" && (
                        <Chip
                          onClose={() => setSportFilter("All")}
                          style={styles.filterChip}
                          textStyle={styles.filterChipText}
                        >
                          Sport: {sportFilter}
                        </Chip>
                      )}
                      {dateFrom !== "" && (
                        <Chip
                          onClose={() => setDateFrom("")}
                          style={styles.filterChip}
                          textStyle={styles.filterChipText}
                        >
                          From: {dateFrom}
                        </Chip>
                      )}
                      {dateTo !== "" && (
                        <Chip
                          onClose={() => setDateTo("")}
                          style={styles.filterChip}
                          textStyle={styles.filterChipText}
                        >
                          To: {dateTo}
                        </Chip>
                      )}
                      <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                        <Text style={styles.clearBtnText}>Clear All</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Text style={styles.resultCount}>
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
                  </Text>
                </View>
              </View>
            )}

            <ScrollView horizontal>
              <DataTable style={{ minWidth: 1300 }}>
                <DataTable.Header style={styles.headerRow}>
                  <DataTable.Title style={styles.headerCell}>S.No</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Action</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Turf Name</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Location</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Time Slot</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Sports</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Status</DataTable.Title>
                  <DataTable.Title style={styles.headerCell}>Date</DataTable.Title>
                </DataTable.Header>
                {paginatedBookings.length === 0 ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ color: "#666", fontSize: 16 }}>
                      No bookings found
                    </Text>
                  </View>
                ) : (
                  paginatedBookings.map((item, index) => (
                    <DataTable.Row
                      key={item.id || item.bookingId || index}
                      style={styles.row}
                    >
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
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                (item.bookingStatus || item.paymentStatus || "").toLowerCase() === "confirmed"
                                  ? "#E8F5E9"
                                  : (item.bookingStatus || item.paymentStatus || "").toLowerCase() === "cancelled"
                                  ? "#FFEBEE"
                                  : "#FFF3E0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  (item.bookingStatus || item.paymentStatus || "").toLowerCase() === "confirmed"
                                    ? "#2E7D32"
                                    : (item.bookingStatus || item.paymentStatus || "").toLowerCase() === "cancelled"
                                    ? "#C62828"
                                    : "#E65100",
                              },
                            ]}
                          >
                            {(item.bookingStatus || item.paymentStatus || "N/A").charAt(0).toUpperCase() +
                              (item.bookingStatus || item.paymentStatus || "N/A").slice(1)}
                          </Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.cell}>
                        {item.date}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                )}
                <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(filteredBookings.length / rowsPerPage)}
                  onPageChange={setPage}
                  label={`${page * rowsPerPage + 1}-${Math.min(
                    (page + 1) * rowsPerPage,
                    filteredBookings.length
                  )} of ${filteredBookings.length}`}
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
  );
};

const GreenActionMenu = ({ bookingId }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

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
    </Menu>
  );
};

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#f8f8f8", flexGrow: 1 },
  // Summary cards
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: { fontSize: 22, fontWeight: "700", color: "#1565C0" },
  summaryLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  // Table card
  card: { backgroundColor: "white", elevation: 4, borderRadius: 8 },
  tableHeaderControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    marginRight: "auto",
  },
  filterToggleActive: { backgroundColor: "#4CAF50" },
  filterToggleText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: "#333" },
  searchInput: {
    width: 200,
    backgroundColor: "#fdfdfd",
    borderRadius: 8,
    height: 40,
  },
  exportIconWrapper: { justifyContent: "center", alignItems: "center", height: 36, width: 36 },
  exportTouchable: {
    borderRadius: 18,
    backgroundColor: "#1976D2",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  exportImage: { width: 20, height: 20, resizeMode: "contain" },
  // Filter panel
  filterPanel: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  filterItem: { minWidth: 150, flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 4 },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  filterDropdownText: { fontSize: 14, color: "#333" },
  filterDateInput: { backgroundColor: "#fff", height: 38, fontSize: 14 },
  filterActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  filterChip: { backgroundColor: "#E3F2FD" },
  filterChipText: { fontSize: 12 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  clearBtnText: { color: "#D32F2F", fontSize: 13, fontWeight: "600" },
  resultCount: { fontSize: 13, color: "#888", marginLeft: "auto" },
  // Table
  headerRow: { backgroundColor: "#F4F4F4" },
  headerCell: { justifyContent: "center", alignItems: "center" },
  row: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  cell: { justifyContent: "center", alignItems: "center", paddingVertical: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  // Action button
  greenButton: { backgroundColor: "#4CAF50", borderRadius: 8, paddingHorizontal: 8 },
  greenButtonLabel: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  buttonContent: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  // Footer
  footer: { backgroundColor: "#4CAF50", paddingVertical: 12, alignItems: "center", marginTop: 16 },
  footerText: { color: "#ffffff", fontSize: 12, fontWeight: "500" },
});

export default ManageBookingsScreen;
