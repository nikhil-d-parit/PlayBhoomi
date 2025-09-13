import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../Api"; // Uses the interceptor for token

// Async action to fetch amenities
export const fetchAmenities = createAsyncThunk(
  "turfs/fetchAmenities",
  async (_, thunkAPI) => {
    try {
      const response = await Api.get("/amenities");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch amenities";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async action to create a new amenity
export const createAmenity = createAsyncThunk(
  "turfs/createAmenity",
  async (amenityData, thunkAPI) => {
    try {
      const response = await Api.post("/amenities", amenityData);
      return response.data; // Returning the newly created amenity
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create amenity";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async action to update an amenity
export const updateAmenity = createAsyncThunk(
  "turfs/updateAmenity",
  async ({ id, amenityData }, thunkAPI) => {
    try {
      const response = await Api.put(`/amenities/${id}`, amenityData);
      return response.data; // Returning the updated amenity
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update amenity";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async action to delete an amenity
export const deleteAmenity = createAsyncThunk(
  "turfs/deleteAmenity",
  async (id, thunkAPI) => {
    try {
      await Api.delete(`/amenities/${id}`);
      return id; // Returning the id of the deleted amenity
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete amenity";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const amenitiesSlice = createSlice({
  name: "amenities",
  initialState: {
    amenities: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch amenities
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create amenity
      .addCase(createAmenity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities.push(action.payload); // Add new amenity to the list
      })
      .addCase(createAmenity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update amenity
      .addCase(updateAmenity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.amenities.findIndex((amenity) => amenity.id === action.payload.id);
        if (index !== -1) {
          state.amenities[index] = action.payload; // Update the amenity in the list
        }
      })
      .addCase(updateAmenity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete amenity
      .addCase(deleteAmenity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = state.amenities.filter(
          (amenity) => amenity.id !== action.payload
        ); // Remove deleted amenity from the list
      })
      .addCase(deleteAmenity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default amenitiesSlice.reducer;
