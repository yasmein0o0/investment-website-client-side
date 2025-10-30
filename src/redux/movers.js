import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const moversThunk = createAsyncThunk(
    "data/movers",
    async (thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL
        try {
            const response = await axios.get(`${url}movers`)
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "failed"
            );
        }
    }
)

const moversSlice = createSlice({
    name: 'movers',
    initialState: {
        data: null,
        loading: false,
        error: null,
    },

    extraReducers: (builder) => {
        builder
            .addCase(moversThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moversThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(moversThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default moversSlice.reducer