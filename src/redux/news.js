import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const newsThunk = createAsyncThunk(
    "data/news",
    async (_, thunkAPI) => {
        const url = import.meta.env.VITE_APP_SERVER_URL;
        console.log('Making request to:', `${url}news`);

        try {
            const res = await axios.get(`${url}news`);
            console.log('Response status:', res.status);
            console.log('Response headers:', res.headers);
            console.log('Response data:', res.data);

            // Check if the response looks like an error
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

const newsSlice = createSlice({
    name: "news",
    initialState: {
        loading: false,
        data: null,
        error: null
    },
    extraReducers: (builder) => {
        builder.addCase(newsThunk.pending, (state) => {
            state.loading = true
        })
        builder.addCase(newsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload
            state.error = null
        })
        builder.addCase(newsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            state.data = null
        })
    }
})

export default newsSlice.reducer