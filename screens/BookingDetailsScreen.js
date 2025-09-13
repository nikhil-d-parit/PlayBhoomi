import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Paragraph,
  Text,
  Divider,
  Badge,
  Avatar,
  useTheme,
} from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { fetchBookingDetails } from "../redux/slices/DashboardSlice";
import Loader from "../components/Loader";

const BookingDetailsScreen = () => {
  const theme = useTheme();
  const route = useRoute();
  const dispatch = useDispatch();
  const { bookingId } = route.params || {};
  const { bookingDetails, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingDetails(bookingId));
    }
  }, [bookingId]);

  if (loading || !bookingDetails || bookingDetails.bookingId !== bookingId) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Booking Summary"
          left={(props) => <Avatar.Icon {...props} icon="clipboard-list" />}
        />
        <Card.Content>
          <Section title="Booking Info">
            <Info label="Booking ID" value={bookingDetails.bookingId} />
            <Info label="Order ID" value={bookingDetails.orderId} />
            <Info label="Created At" value={moment(bookingDetails.createdAt).format("MMMM Do YYYY, h:mm A")} />
            <Info label="Date" value={moment(bookingDetails.date).format("MMMM Do YYYY")} />
            <Info label="Time Slot" value={bookingDetails.timeSlot} />
          </Section>

          <Section title="User & Vendor">
            <Info label="User ID" value={bookingDetails.userId} />
            <Info label="Vendor Name" value={bookingDetails.vendorName} />
          </Section>

          <Section title="Turf Details">
            <Info label="Turf Name" value={bookingDetails.turfName} />
            <Info label="Location" value={bookingDetails.turfLocation} />
            <Info
              label="Coordinates"
              value={`${bookingDetails.locationCoordinates?.latitude}, ${bookingDetails.locationCoordinates?.longitude}`}
            />
            <Info label="Sport" value={bookingDetails.sports} />
          </Section>

          <Section title="Payment Details">
            <Info
              label="Amount (₹)"
              value={`₹ ${bookingDetails.amount}`}
              valueStyle={{ fontWeight: "bold", color: theme.colors.primary }}
            />
            <Status label="Payment Status" status={bookingDetails.paymentStatus} />
            <Status label="Booking Status" status={bookingDetails.bookingStatus} />
          </Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const Info = ({ label, value, valueStyle }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Paragraph style={[styles.value, valueStyle]}>{value}</Paragraph>
  </View>
);

const Status = ({ label, status }) => {
  const isConfirmed = status.toLowerCase() === "confirmed";
  const isCancelled = status.toLowerCase() === "cancelled";
  const isPending = status.toLowerCase() === "pending";

  const statusColor = isConfirmed
    ? "green"
    : isCancelled
    ? "red"
    : isPending
    ? "orange"
    : "grey";

  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Badge style={[styles.badge, { backgroundColor: statusColor }]}>
        {status}
      </Badge>
    </View>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Divider style={styles.sectionDivider} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f4f6f8",
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  sectionDivider: {
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "500",
    color: "#555",
  },
  value: {
    fontSize: 15,
    color: "#000",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 4,
    color: "white",
    textTransform: "capitalize",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default BookingDetailsScreen;
