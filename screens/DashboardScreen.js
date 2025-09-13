import React, { useEffect } from "react";
import { View, ScrollView, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/slices/DashboardSlice";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { Tooltip } from "react-native-paper";

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { bookings, total, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // Data Calculations
  const totalAmount = bookings
    .filter((b) => b.paymentStatus === "confirmed" && b.bookingStatus === "confirmed")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const uniqueTurfIds = new Set(bookings.map((b) => b.turfId)).size;
  const uniqueUserIds = new Set(bookings.map((b) => b.userId)).size;

  const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
  const todayBookings = bookings.filter((b) => b.date === today && b.bookingStatus === "confirmed");
  const todayBookingCount = todayBookings.length;
  const todayEarnings = todayBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    // Prepare last 7 days earnings data for chart
    const getLastNDays = (n) => {
      const days = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
      }
      return days;
    };

    const last7Days = getLastNDays(7);
    const earningsLast7Days = last7Days.map(date => {
      return bookings
        .filter(b => b.date === date && b.paymentStatus === "confirmed" && b.bookingStatus === "confirmed")
        .reduce((sum, b) => sum + (b.amount || 0), 0);
    });

      // Pie chart data for user distribution (example: confirmed vs pending users)
      // If you have user status info, adjust accordingly. Here, we use unique users and total bookings as slices.
      // Calculate total for percentage
      const pieTotal = uniqueUserIds + total;
      const usersPercent = pieTotal ? ((uniqueUserIds / pieTotal) * 100).toFixed(1) : 0;
      const bookingsPercent = pieTotal ? ((total / pieTotal) * 100).toFixed(1) : 0;
      const pieChartData = [
        {
          name: `Users (${usersPercent}%)`,
          population: uniqueUserIds,
          color: "#2e7d32",
          legendFontColor: "#2e7d32",
          legendFontSize: 14,
        },
        {
          name: `Bookings (${bookingsPercent}%)`,
          population: total,
          color: "#0288d1",
          legendFontColor: "#0288d1",
          legendFontSize: 14,
        },
      ];

      // Line chart data for last 7 days: bookings and earnings
      const bookingsLast7Days = last7Days.map(date => {
        return bookings
          .filter(b => b.date === date && b.bookingStatus === "confirmed")
          .length;
      });

      const bookingsEarningsLineData = {
        labels: last7Days.map(d => d.slice(5)), // MM-DD
        datasets: [
          {
            data: bookingsLast7Days,
            color: (opacity = 1) => `rgba(2, 136, 209, ${opacity})`,
            strokeWidth: 2,
            label: "Bookings"
          },
          {
            data: earningsLast7Days,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            strokeWidth: 2,
            label: "Earnings"
          },
        ],
        legend: ["Bookings", "Earnings"],
      };

return (
  loading ? (
    <Loader />
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            backgroundColor: "#e8f5e9",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <StatCard icon={Ionicons} label="Total Users" value={uniqueUserIds.toString()} />
          <StatCard icon={FontAwesome5} label="Total Turf" value={uniqueTurfIds.toString()} />
          <StatCard icon={Ionicons} label="Total Bookings" value={total.toString()} />
          <StatCard icon={Ionicons} label="Today's Booking" value={todayBookingCount.toString()} />
          <StatCard icon={Ionicons} label="Total Earnings" value={`₹${totalAmount}`} />
          <StatCard icon={Ionicons} label="Today's Earnings" value={`₹${todayEarnings}`} />
        </View>

          {/* Charts Row with background and tooltips */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 32,
            backgroundColor: "#f1f8e9",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            {/* Pie Chart for Users */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Tooltip title="Shows the ratio of users to bookings" enterTouchDelay={0} leaveTouchDelay={1500}>
                <Text variant="titleMedium" style={{ marginBottom: 8, textAlign: "center" }}>Users vs Bookings</Text>
              </Tooltip>
              <PieChart
                data={pieChartData}
                width={Dimensions.get("window").width / 2 - 24}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            </View>
            {/* Bookings & Earnings Trend Line Chart using react-native-chart-kit */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Tooltip title="Shows daily bookings and earnings trends" enterTouchDelay={0} leaveTouchDelay={1500}>
                <Text variant="titleMedium" style={{ marginBottom: 8, textAlign: "center" }}>Bookings & Earnings Trend</Text>
              </Tooltip>
              <LineChart
                data={{
                  labels: last7Days.map(d => d.slice(5)),
                  datasets: [
                    {
                      data: bookingsLast7Days,
                      color: (opacity = 1) => `rgba(2, 136, 209, ${opacity})`,
                      strokeWidth: 2,
                    },
                    {
                      data: earningsLast7Days,
                      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                  legend: ["Bookings", "Earnings"],
                }}
                width={Dimensions.get("window").width / 2 - 24}
                height={200}
                yAxisLabel={""}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#e0f2f1",
                  backgroundGradientTo: "#b2dfdb",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(2, 136, 209, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#2e7d32",
                  },
                }}
                bezier
                style={{ borderRadius: 16, marginVertical: 8 }}
              />
            </View>
          </View>
      </ScrollView>

      <View style={{ paddingVertical: 12, alignItems: "center", backgroundColor: "#388e3c", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
        <Text style={{ color: "white", fontWeight: "bold", letterSpacing: 1 }} variant="bodySmall">
          COPYRIGHT © KRIDA
        </Text>
      </View>
    </SafeAreaView>
  )
);
}
