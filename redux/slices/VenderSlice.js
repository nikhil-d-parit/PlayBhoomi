// src/redux/slices/venderSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import Api from "../Api";
import axios from "axios";
import { cleanAddress } from "../../utils/cleanAddress";

// Utility: extract lat/lng from URL (works with short + long Google Maps links)
const extractLatLngFromUrl = async (url) => {
  try {
    let targetUrl = url;

    // Expand short Google Maps links (maps.app.goo.gl or goo.gl/maps)
    if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
      try {
        const res = await axios.get(url, { maxRedirects: 5 });
        targetUrl = res.request?.responseURL || url;

        console.log("Expanded Google Maps URL:", targetUrl);

        // In case responseURL was not set, fallback to res.data (HTML body)
        if (!targetUrl || targetUrl === url) {
          const html = res.data || "";
          const hrefMatch = html.match(/https:\/\/www\.google\.com\/maps[^\"]+/);
          if (hrefMatch) {
            targetUrl = hrefMatch[0];
            console.log("Extracted from HTML body:", targetUrl);
          }
        }
      } catch (redirectErr) {
        console.warn("Failed to expand short URL:", redirectErr.message);
        return null;
      }
    }

    // Try @lat,lng
    const atMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return {
        lat: parseFloat(parseFloat(atMatch[1]).toFixed(6)),
        lng: parseFloat(parseFloat(atMatch[2]).toFixed(6)),
      };
    }

    // Try q=lat,lng
    const qMatch = targetUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return {
        lat: parseFloat(parseFloat(qMatch[1]).toFixed(6)),
        lng: parseFloat(parseFloat(qMatch[2]).toFixed(6)),
      };
    }

    // Try ll=lat,lng
    const llMatch = targetUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return {
        lat: parseFloat(parseFloat(llMatch[1]).toFixed(6)),
        lng: parseFloat(parseFloat(llMatch[2]).toFixed(6)),
      };
    }

    // Try query=lat,lng
    const queryMatch = targetUrl.match(/[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (queryMatch) {
      return {
        lat: parseFloat(parseFloat(queryMatch[1]).toFixed(6)),
        lng: parseFloat(parseFloat(queryMatch[2]).toFixed(6)),
      };
    }

    console.warn("No coordinates found in:", targetUrl);
    return null;
  } catch (e) {
    console.error("extractLatLngFromUrl error:", e.message);
    return null;
  }
};

// addVendor.js inside your VenderSlice
export const addVendor = createAsyncThunk(
  "vender/addVendor",
  async (formData, thunkAPI) => {
    try {
      const {
        firstName: name,
        location,
        mobile:phone,
        gpsUrl, 
      } = formData;

      const payload = {
        name,
        location,
        phone,
        gpsUrl, 
      };

      console.log("payload:", payload);

      const response = await Api.post("/vendors", payload);

      Toast.show({
        type: "success",
        text1: response.data.message || "Vendor added successfully",
      });

      return response.data;
    } catch (err) {
      console.error("Add Vendor Error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

// ✅ Fetch Vendor List Thunk
export const fetchVendors = createAsyncThunk(
  "vender/fetchVendors",
  async (_, thunkAPI) => {
    try {
      const response = await Api.get("/vendors");
      return response.data.vendors; // Expected to be an array of vendors
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch vendors",
        text2: err.response?.data?.message || err.message,
      });
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);

export const editVendor = createAsyncThunk(
  "vender/editVendor",
  async ({ id, formData }, thunkAPI) => {
    try {
      // Accepts: { firstName, location, mobile, gpsUrl }
      const {
        firstName: name,
        location,
        mobile: phone,
        gpsUrl,
      } = formData;

      const payload = {
        name,
        location,
        phone,
        gpsUrl,
      };
      console.log("Edit Vendor payload:", payload);

      const response = await Api.put(`/vendors/${id}`, payload);
      Toast.show({
        type: "success",
        text1: response.data.message || "Vendor updated successfully",
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  }
);
export const deleteVendor = createAsyncThunk(
  "vender/deleteVendor",
  async (id, thunkAPI) => {
    try {
      const response = await Api.delete(`/vendors/${id}`);
      Toast.show({
        type: "success",
        text1: response.data?.message || "Vendor deleted successfully",
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  }
);

export const fetchVendorById = createAsyncThunk(
  "vender/fetchVendorById",
  async (id, thunkAPI) => {
    try {
      const response = await Api.get("/vendors"); // fetch all vendors
      const vendors = response.data.vendors || response.data; // depending on API shape
      const vendor = vendors.find((v) => v.id === id);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      return vendor;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch vendor"
      );
    }
  }
);

// ✅ Initial State
const venderSlice = createSlice({
  name: "vender",
  initialState: {
    loading: false,
    error: null,
    success: false,
    vendors: [], // Added vendor list state
    selectedVendor: null,
  },
  reducers: {
    resetVendorState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 👉 Add Vendor
      .addCase(addVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addVendor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.success = false;
      })

      // 👉 Fetch Vendor List
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(editVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editVendor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(editVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.success = false;
      })
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.meta.arg; // id passed to thunk
        state.vendors = state.vendors.filter((v) => v.id !== deletedId);
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
        state.success = false;
      })
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedVendor = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vendor";
      });
  },
});

export const { resetVendorState } = venderSlice.actions;

export default venderSlice.reducer;
