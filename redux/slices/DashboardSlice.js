import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../Api";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, thunkAPI) => {
    try {
      const response = await Api.get("/all-bookings");
      return {
        bookings: response.data.bookings,
        total: response.data.total,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch dashboard info";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchBookingDetails = createAsyncThunk(
  "dashboard/fetchBookingDetails",
  async (bookingId, thunkAPI) => {
    try {
      const response = await Api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch booking details";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    bookings: [],
    total: 0,
    loading: false,
    error: null,
    bookingDetails: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetails = action.payload;
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
