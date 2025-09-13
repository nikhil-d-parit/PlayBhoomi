import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "../Api"; // Uses the interceptor for token

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const response = await Api.get("/users");
      return response.data.users;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch users";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
       state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
