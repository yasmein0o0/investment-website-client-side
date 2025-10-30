import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const insiderThunk = createAsyncThunk(
    "data/insider",
    async (ticker, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        console.log('Making request to:', `${url}finance`);

        try {
            const res = await axios.get(`${url}insider`, {
                params: { ticker, module: 'insider-transactions' }
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

const insiderSlice = createSlice({
    name: "insider",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(insiderThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(insiderThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
            state.error = null
        })
        builder.addCase(insiderThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            state.data = null
        })
    }
})

export default insiderSlice.reducer