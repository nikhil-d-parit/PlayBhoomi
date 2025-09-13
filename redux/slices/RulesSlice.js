import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../Api";

// ✅ Fetch all turf rules
export const fetchRules = createAsyncThunk(
  "rules/fetchRules",
  async (_, thunkAPI) => {
    try {
      const response = await Api.get("/rules");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch turf rules";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Create a new rule
export const createRule = createAsyncThunk(
  "rules/createRule",
  async (ruleData, thunkAPI) => {
    try {
      const response = await Api.post("/rules", ruleData);
      return response.data; // Return new rule
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create rule";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Update a rule
export const updateRule = createAsyncThunk(
  "rules/updateRule",
  async ({ id, ruleData }, thunkAPI) => {
    try {
      const response = await Api.put(`/rules/${id}`, ruleData);
      return response.data; // Return updated rule
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update rule";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Delete a rule
export const deleteRule = createAsyncThunk(
  "rules/deleteRule",
  async (id, thunkAPI) => {
    try {
      await Api.delete(`/rules/${id}`);
      return id; // Return deleted rule ID
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete rule";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Rules Slice
const rulesSlice = createSlice({
  name: "rules",
  initialState: {
    rules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // === FETCH RULES ===
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rules";
      })

      // === CREATE RULE ===
      .addCase(createRule.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.loading = false;
        state.rules.push(action.payload); // Add new rule to state
      })
      .addCase(createRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create rule";
      })

      // === UPDATE RULE ===
      .addCase(updateRule.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRule.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.rules.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.rules[index] = updated;
        }
      })
      .addCase(updateRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update rule";
      })

      // === DELETE RULE ===
      .addCase(deleteRule.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.rules = state.rules.filter((rule) => rule.id !== deletedId);
      })
      .addCase(deleteRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete rule";
      });
  },
});

export default rulesSlice.reducer;
