import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const earningsThunk = createAsyncThunk(
    "data/earnings",
    async (ticker, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        console.log('Making request to:', `${url}earnings`);

        try {
            const res = await axios.get(`${url}earnings`, {
                params: { ticker, module: 'earnings' }
            });
            console.log('Response status:', res.status);
            console.log('Response data:', res.data);

            if (res.data && (res.data.error || res.data.message)) {
                console.log('Response contains error data');
                return thunkAPI.rejectWithValue(res.data.message || "API returned error");
            }

            return res.data;
        } catch (error) {
            console.log('Error details:', {
                message: error.message,
                response: error.response,
                code: error.code
            });
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Request failed"
            );
        }
    }
);

const earningsSlice = createSlice({
    name: "earnings",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(earningsThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(earningsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
            state.error = null
        })
        builder.addCase(earningsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            state.data = null
        })
    }
})

export default earningsSlice.reducer