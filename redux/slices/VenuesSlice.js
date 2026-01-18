// ✅ Async thunk to toggle venue status (active/inactive)
export const toggleVenueStatus = createAsyncThunk(
  "venues/toggleStatus",
  async ({ vendorId, turfId, isSuspended }, thunkAPI) => {
    try {
      const response = await Api.patch(
        `/turfs/${vendorId}/${turfId}/suspend`,
        { isSuspended: isSuspended ? 1 : 0 }
      );
      return { turfId, turf: response.data.turf };
    } catch (error) {
      console.error('❌ Toggle Status Error:', error.response?.data || error.message);
      const message =
        error.response?.data?.message || error.message || "Failed to update status";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../Api";

// Async thunk to fetch venues/turfs
// Async thunk to fetch venues/turfs for a specific vendor
export const fetchVenues = createAsyncThunk(
  "venues/fetchVenues",
  async (vendorId, thunkAPI) => {
    try {
      const response = await Api.get(`/turfs`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch venues";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Async thunk to add a new venue for a specific vendor
export const addVenue = createAsyncThunk(
  "venues/addVenue",
  async ({ venueData, vendorId }, thunkAPI) => {
    try {
      // Remove vendorId from venueData before sending
      const { vendorId: _, ...venuePayload } = venueData;
      const response = await Api.post(`/vendors/${vendorId}/turfs`, venuePayload);
      console.log("Add Venue Response:", response.data); // Debugging line
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to add venue";
      console.error("Add Venue Error:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Async thunk to edit an existing venue
export const editVenue = createAsyncThunk(
  "venues/editVenue",
  async ({ vendorId, turfId, venueData }, thunkAPI) => {
    try {
      const response = await Api.put(
        `/vendors/${vendorId}/turfs/${turfId}`,
        venueData
      );
      console.log("Edit Venue Response:", response.data); // Debugging line
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to edit venue";
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const venuesSlice = createSlice({
  name: "venues",
  initialState: {
    venues: [],
    loading: false,
    error: null,
    editLoading: false,
    editError: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add venue reducers
      .addCase(addVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVenue.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new venue to the list
        state.venues.push(action.payload);
      })
      .addCase(addVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle venue status reducer
      .addCase(toggleVenueStatus.fulfilled, (state, action) => {
        state.venues = state.venues.map(v => 
          v.turfId === action.payload.turfId ? action.payload.turf : v
        );
      })
      .addCase(toggleVenueStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Edit venue reducers
      .addCase(editVenue.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
      })
      .addCase(editVenue.fulfilled, (state, action) => {
        state.editLoading = false;
        // Update the venue in the list
        state.venues = state.venues.map(v => 
          v.turfId === action.payload.turfId ? action.payload : v
        );
      })
      .addCase(editVenue.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload;
      });
  },
});

export default venuesSlice.reducer;
